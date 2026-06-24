"""
DomStudio Telegram Bot
----------------------
Lets sellers generate ad copy without opening a browser.

Setup:
  export TELEGRAM_TOKEN=...
  export DOMSTUDIO_API=https://domstudio-production.up.railway.app  # or Amvera URL
  python bot.py

Flow:
  /start      → welcome + link instructions (if not linked)
  /link       → link DomStudio account (email + password)
  /tools      → pick a copy tool, fill fields, generate
  /balance    → show token balance
  /unlink     → remove stored account
"""

import asyncio
import json
import logging
import os
import sqlite3

import aiohttp
from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Update,
)
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

TOKEN = os.environ["TELEGRAM_TOKEN"]
API   = os.environ.get("DOMSTUDIO_API", "https://domstudio-production.up.railway.app")
DB    = os.environ.get("BOT_DB", "bot_users.sqlite3")

# ─── Conversation states ─────────────────────────────────────────────────────
AWAIT_EMAIL, AWAIT_PASSWORD, AWAIT_FIELD, AWAIT_LANG = range(4)

# ─── Tool catalogue (mirrors backend fallback list) ──────────────────────────
TOOLS = [
    {"slug": "beauty-service-ad",  "name": "💅 Beauty Ad",        "category": "Beauty",         "fields": ["product", "price", "city", "duration", "advantages", "offer"]},
    {"slug": "master-bio",          "name": "💅 Master Bio",        "category": "Beauty",         "fields": ["masterName", "product", "city", "advantages", "offer"]},
    {"slug": "beauty-promo-post",   "name": "💅 Beauty Post",       "category": "Beauty",         "fields": ["product", "offer", "city", "masterName", "advantages"]},
    {"slug": "food-delivery-ad",    "name": "🍕 Food Ad",           "category": "Food",           "fields": ["product", "price", "city", "advantages", "offer"]},
    {"slug": "yandex-maps-card",    "name": "🍕 Yandex Maps Card",  "category": "Food",           "fields": ["businessName", "product", "city", "advantages", "offer"]},
    {"slug": "food-promo-post",     "name": "🍕 Food Post",         "category": "Food",           "fields": ["product", "offer", "city", "businessName", "advantages"]},
    {"slug": "auto-service-ad",     "name": "🚗 Auto Ad",           "category": "Auto",           "fields": ["product", "price", "city", "advantages", "offer"]},
    {"slug": "auto-buyer-reply",    "name": "🚗 Auto Buyer Reply",  "category": "Auto",           "fields": ["customerQuestion", "product", "price", "city", "advantages"]},
    {"slug": "auto-promo-post",     "name": "🚗 Auto Post",         "category": "Auto",           "fields": ["product", "offer", "city", "advantages", "businessName"]},
    {"slug": "avito-ad",            "name": "📋 Avito Ad",          "category": "Listings",       "fields": ["product", "city", "price", "advantages"]},
    {"slug": "ozon-listing",        "name": "📋 Ozon Listing",      "category": "Listings",       "fields": ["product", "price", "advantages", "targetCustomer"]},
    {"slug": "wb-listing",          "name": "📋 WB Listing",        "category": "Listings",       "fields": ["product", "price", "advantages"]},
    {"slug": "buyer-reply",         "name": "💬 Buyer Reply",       "category": "Communication",  "fields": ["product", "customerQuestion"]},
    {"slug": "review-reply",        "name": "💬 Review Reply",      "category": "Communication",  "fields": ["product", "reviewText"]},
]
TOOLS_BY_SLUG = {t["slug"]: t for t in TOOLS}

FIELD_LABELS = {
    "product":          {"ru": "Товар / услуга",      "en": "Product / service"},
    "city":             {"ru": "Город",               "en": "City"},
    "price":            {"ru": "Цена",                "en": "Price"},
    "advantages":       {"ru": "Преимущества",        "en": "Advantages"},
    "targetCustomer":   {"ru": "Целевой клиент",      "en": "Target customer"},
    "offer":            {"ru": "Спецпредложение",     "en": "Special offer"},
    "customerQuestion": {"ru": "Вопрос клиента",      "en": "Customer question"},
    "reviewText":       {"ru": "Текст отзыва",        "en": "Review text"},
    "businessName":     {"ru": "Название бизнеса",    "en": "Business name"},
    "masterName":       {"ru": "Имя мастера",         "en": "Master / specialist"},
    "duration":         {"ru": "Длительность",        "en": "Duration"},
}

# ─── DB helpers ──────────────────────────────────────────────────────────────

def db_init():
    con = sqlite3.connect(DB)
    con.execute("""
        CREATE TABLE IF NOT EXISTS bot_users (
            telegram_id  INTEGER PRIMARY KEY,
            access_token TEXT,
            email        TEXT,
            language     TEXT NOT NULL DEFAULT 'ru'
        )
    """)
    con.commit()
    con.close()


def db_get(tid: int) -> dict | None:
    con = sqlite3.connect(DB)
    row = con.execute(
        "SELECT access_token, email, language FROM bot_users WHERE telegram_id = ?", (tid,)
    ).fetchone()
    con.close()
    if not row:
        return None
    return {"access_token": row[0], "email": row[1], "language": row[2]}


def db_save(tid: int, access_token: str, email: str, language: str = "ru"):
    con = sqlite3.connect(DB)
    con.execute("""
        INSERT INTO bot_users (telegram_id, access_token, email, language)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(telegram_id) DO UPDATE SET
            access_token = excluded.access_token,
            email        = excluded.email,
            language     = excluded.language
    """, (tid, access_token, email, language))
    con.commit()
    con.close()


def db_set_language(tid: int, language: str):
    con = sqlite3.connect(DB)
    con.execute("UPDATE bot_users SET language = ? WHERE telegram_id = ?", (language, tid))
    con.commit()
    con.close()


def db_delete(tid: int):
    con = sqlite3.connect(DB)
    con.execute("DELETE FROM bot_users WHERE telegram_id = ?", (tid,))
    con.commit()
    con.close()

# ─── API helpers ─────────────────────────────────────────────────────────────

async def api_login(email: str, password: str) -> dict:
    async with aiohttp.ClientSession() as s:
        r = await s.post(
            f"{API}/auth/login/email",
            json={"email": email, "password": password},
            timeout=aiohttp.ClientTimeout(total=15),
        )
        data = await r.json()
        if r.status != 200:
            raise ValueError(data.get("detail", "Login failed"))
        return data


async def api_me(token: str) -> dict:
    async with aiohttp.ClientSession() as s:
        r = await s.get(
            f"{API}/users/me/full",
            headers={"Authorization": f"Bearer {token}"},
            timeout=aiohttp.ClientTimeout(total=10),
        )
        data = await r.json()
        if r.status != 200:
            raise ValueError("Session expired. Use /link to re-connect.")
        return data


async def api_referral(token: str) -> dict:
    async with aiohttp.ClientSession() as s:
        r = await s.get(
            f"{API}/users/referral",
            headers={"Authorization": f"Bearer {token}"},
            timeout=aiohttp.ClientTimeout(total=10),
        )
        data = await r.json()
        if r.status != 200:
            raise ValueError("Could not load referral info.")
        return data


async def api_generate(token: str, slug: str, fields: dict, language: str) -> str:
    payload = {
        "tool_slug": slug,
        "input": fields,
        "profile": {},
        "output_language": language,
    }
    async with aiohttp.ClientSession() as s:
        r = await s.post(
            f"{API}/content/generate",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
            timeout=aiohttp.ClientTimeout(total=30),
        )
        data = await r.json()
        if r.status != 200:
            raise ValueError(data.get("detail", "Generation failed"))
        return data.get("output") or data.get("text") or data.get("result") or str(data)

# ─── Keyboards ───────────────────────────────────────────────────────────────

def tools_keyboard() -> InlineKeyboardMarkup:
    categories: dict[str, list] = {}
    for t in TOOLS:
        categories.setdefault(t["category"], []).append(t)
    rows = []
    for cat, tools in categories.items():
        rows.append([InlineKeyboardButton(f"── {cat} ──", callback_data="noop")])
        for t in tools:
            rows.append([InlineKeyboardButton(t["name"], callback_data=f"tool:{t['slug']}")])
    rows.append([InlineKeyboardButton("❌ Cancel", callback_data="cancel")])
    return InlineKeyboardMarkup(rows)


def lang_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([[
        InlineKeyboardButton("🇷🇺 Русский", callback_data="lang:ru"),
        InlineKeyboardButton("🇬🇧 English", callback_data="lang:en"),
    ]])

# ─── /start ──────────────────────────────────────────────────────────────────

async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tid = update.effective_user.id
    user = db_get(tid)
    if user:
        lang = user["language"]
        if lang == "ru":
            text = (
                f"👋 Привет! Аккаунт <b>{user['email']}</b> подключён.\n\n"
                "Команды:\n"
                "/tools — сгенерировать текст\n"
                "/balance — баланс токенов\n"
                "/referral — реферальная ссылка\n"
                "/lang — сменить язык\n"
                "/unlink — отключить аккаунт"
            )
        else:
            text = (
                f"👋 Hi! Account <b>{user['email']}</b> connected.\n\n"
                "Commands:\n"
                "/tools — generate copy\n"
                "/balance — token balance\n"
                "/referral — referral link\n"
                "/lang — change language\n"
                "/unlink — disconnect account"
            )
    else:
        text = (
            "👋 Welcome to <b>DomStudio</b>!\n\n"
            "Generate ad copy for Avito, Ozon, Wildberries, beauty, food, and auto services — right here in Telegram.\n\n"
            "To get started, link your DomStudio account:\n"
            "/link\n\n"
            "Don't have an account? Sign up at domstudio.site"
        )
    await update.message.reply_html(text)

# ─── /link flow ──────────────────────────────────────────────────────────────

async def cmd_link(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Enter your DomStudio email address:",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("❌ Cancel", callback_data="cancel_link")
        ]])
    )
    return AWAIT_EMAIL


async def got_email(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    ctx.user_data["link_email"] = update.message.text.strip()
    await update.message.reply_text("Now enter your password:")
    return AWAIT_PASSWORD


async def got_password(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    email = ctx.user_data.pop("link_email", "")
    password = update.message.text.strip()
    # Delete the password message to avoid it staying in chat
    try:
        await update.message.delete()
    except Exception:
        pass
    try:
        tokens = await api_login(email, password)
        db_save(update.effective_user.id, tokens["access_token"], email)
        await update.message.chat.send_message(
            f"✅ Account <b>{email}</b> linked!\n\nUse /tools to start generating copy.",
            parse_mode="HTML",
        )
    except ValueError as e:
        await update.message.chat.send_message(f"❌ {e}\n\nTry /link again.")
    return ConversationHandler.END


async def cancel_link(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    await query.edit_message_text("Cancelled.")
    return ConversationHandler.END

# ─── /unlink ─────────────────────────────────────────────────────────────────

async def cmd_unlink(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    db_delete(update.effective_user.id)
    await update.message.reply_text("Account unlinked. Use /link to reconnect.")


async def cmd_referral(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tid = update.effective_user.id
    user = db_get(tid)
    if not user:
        await update.message.reply_text("Link your account first: /link")
        return
    try:
        ref = await api_referral(user["access_token"])
        lang = user["language"]
        link = ref["link"]
        count = ref["referrals_count"]
        earned = ref["tokens_earned"]
        bonus = ref["tokens_per_referral"]
        if lang == "ru":
            text = (
                f"🔗 <b>Реферальная программа</b>\n\n"
                f"Ваша ссылка:\n<code>{link}</code>\n\n"
                f"Приглашено: {count}\n"
                f"Получено токенов: {earned}\n"
                f"+{bonus} токенов за каждого нового пользователя"
            )
        else:
            text = (
                f"🔗 <b>Referral program</b>\n\n"
                f"Your link:\n<code>{link}</code>\n\n"
                f"Invited: {count}\n"
                f"Tokens earned: {earned}\n"
                f"+{bonus} tokens per new user"
            )
        await update.message.reply_html(text)
    except ValueError as e:
        await update.message.reply_text(str(e))

# ─── /balance ────────────────────────────────────────────────────────────────

async def cmd_balance(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tid = update.effective_user.id
    user = db_get(tid)
    if not user:
        await update.message.reply_text("Link your account first: /link")
        return
    try:
        me = await api_me(user["access_token"])
        lang = user["language"]
        tokens = me.get("tokens", 0)
        plan   = me.get("subscription", {}).get("plan", "free") if me.get("subscription") else "free"
        if lang == "ru":
            text = f"💰 Токены: <b>{tokens}</b>\nТариф: {plan}"
        else:
            text = f"💰 Tokens: <b>{tokens}</b>\nPlan: {plan}"
        await update.message.reply_html(text)
    except ValueError as e:
        await update.message.reply_text(str(e))

# ─── /lang ───────────────────────────────────────────────────────────────────

async def cmd_lang(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tid = update.effective_user.id
    if not db_get(tid):
        await update.message.reply_text("Link your account first: /link")
        return
    await update.message.reply_text("Choose language for generated copy:", reply_markup=lang_keyboard())
    return AWAIT_LANG


async def got_lang(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    lang = query.data.split(":")[1]
    db_set_language(query.from_user.id, lang)
    label = "Русский" if lang == "ru" else "English"
    await query.edit_message_text(f"✅ Language set to {label}. Generated copy will be in this language.")
    return ConversationHandler.END

# ─── /tools flow ─────────────────────────────────────────────────────────────

async def cmd_tools(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tid = update.effective_user.id
    if not db_get(tid):
        await update.message.reply_text("Link your account first: /link")
        return ConversationHandler.END
    await update.message.reply_text("Choose a copy tool:", reply_markup=tools_keyboard())
    return AWAIT_FIELD


async def tool_selected(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    slug = query.data.split(":", 1)[1]
    tool = TOOLS_BY_SLUG.get(slug)
    if not tool:
        await query.edit_message_text("Unknown tool. Use /tools to try again.")
        return ConversationHandler.END

    ctx.user_data["tool"] = tool
    ctx.user_data["fields_done"] = {}
    ctx.user_data["field_idx"] = 0

    user = db_get(query.from_user.id)
    lang = user["language"] if user else "ru"
    ctx.user_data["gen_lang"] = lang

    await query.edit_message_text(f"✅ Tool: {tool['name']}\n\nI'll ask for each field. Type /skip to leave a field blank, /cancel to stop.")
    await ask_next_field(query.message.chat, ctx, lang)
    return AWAIT_FIELD


async def ask_next_field(chat, ctx: ContextTypes.DEFAULT_TYPE, lang: str):
    tool = ctx.user_data["tool"]
    idx  = ctx.user_data["field_idx"]
    fields = tool["fields"]
    if idx >= len(fields):
        await do_generate(chat, ctx)
        return
    field = fields[idx]
    label = FIELD_LABELS.get(field, {}).get(lang, field)
    prompt = f"[{idx+1}/{len(fields)}] {label}:" if lang == "en" else f"[{idx+1}/{len(fields)}] {label}:"
    await chat.send_message(prompt)


async def got_field_value(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tool = ctx.user_data.get("tool")
    if not tool:
        return ConversationHandler.END

    idx    = ctx.user_data["field_idx"]
    fields = tool["fields"]
    field  = fields[idx]
    ctx.user_data["fields_done"][field] = update.message.text.strip()
    ctx.user_data["field_idx"] = idx + 1

    lang = ctx.user_data.get("gen_lang", "ru")
    await ask_next_field(update.message.chat, ctx, lang)
    return AWAIT_FIELD


async def cmd_skip(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    tool = ctx.user_data.get("tool")
    if not tool:
        return ConversationHandler.END
    ctx.user_data["field_idx"] += 1
    lang = ctx.user_data.get("gen_lang", "ru")
    await ask_next_field(update.message.chat, ctx, lang)
    return AWAIT_FIELD


async def cmd_cancel(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    ctx.user_data.clear()
    await update.message.reply_text("Cancelled. Use /tools to start over.")
    return ConversationHandler.END


async def noop_callback(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.callback_query.answer()


async def cancel_callback(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    ctx.user_data.clear()
    await query.edit_message_text("Cancelled. Use /tools to start over.")
    return ConversationHandler.END


async def do_generate(chat, ctx: ContextTypes.DEFAULT_TYPE):
    tool       = ctx.user_data["tool"]
    fields     = ctx.user_data["fields_done"]
    lang       = ctx.user_data.get("gen_lang", "ru")
    tid        = chat.id  # This is the chat_id, not user_id — look up differently
    # We need the user id; stash it in user_data when tool is selected
    uid        = ctx.user_data.get("tid")
    user       = db_get(uid) if uid else None

    generating_text = "⏳ Генерирую..." if lang == "ru" else "⏳ Generating..."
    msg = await chat.send_message(generating_text)

    if not user:
        await msg.edit_text("❌ Session error. Use /link to reconnect.")
        ctx.user_data.clear()
        return

    try:
        text = await api_generate(user["access_token"], tool["slug"], fields, lang)
        chars = len(text)
        # Character limit hints
        hints = []
        if chars <= 3000:
            hints.append("✅ Avito (≤3000)")
        if chars <= 5000:
            hints.append("✅ Ozon/WB (≤5000)")
        hint_str = "  ·  ".join(hints) if hints else f"⚠️ {chars} chars"
        header = f"📝 {tool['name']}  ·  {chars} chars  ·  {hint_str}\n\n"
        await msg.edit_text(header + text)
    except ValueError as e:
        await msg.edit_text(f"❌ {e}")
    ctx.user_data.clear()

# ─── Stash user id when tool is selected ─────────────────────────────────────

async def tool_selected_with_tid(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    ctx.user_data["tid"] = update.callback_query.from_user.id
    return await tool_selected(update, ctx)

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    db_init()

    app = (
        Application.builder()
        .token(TOKEN)
        .connect_timeout(30)
        .read_timeout(30)
        .write_timeout(30)
        .pool_timeout(30)
        .build()
    )

    link_conv = ConversationHandler(
        entry_points=[CommandHandler("link", cmd_link)],
        states={
            AWAIT_EMAIL:    [MessageHandler(filters.TEXT & ~filters.COMMAND, got_email)],
            AWAIT_PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, got_password)],
        },
        fallbacks=[CallbackQueryHandler(cancel_link, pattern="^cancel_link$")],
    )

    tools_conv = ConversationHandler(
        entry_points=[CommandHandler("tools", cmd_tools)],
        states={
            AWAIT_FIELD: [
                CallbackQueryHandler(tool_selected_with_tid, pattern="^tool:"),
                CallbackQueryHandler(cancel_callback, pattern="^cancel$"),
                CallbackQueryHandler(noop_callback, pattern="^noop$"),
                CommandHandler("skip",   cmd_skip),
                CommandHandler("cancel", cmd_cancel),
                MessageHandler(filters.TEXT & ~filters.COMMAND, got_field_value),
            ],
        },
        fallbacks=[CommandHandler("cancel", cmd_cancel)],
    )

    lang_conv = ConversationHandler(
        entry_points=[CommandHandler("lang", cmd_lang)],
        states={
            AWAIT_LANG: [CallbackQueryHandler(got_lang, pattern="^lang:")],
        },
        fallbacks=[],
    )

    app.add_handler(CommandHandler("start",    cmd_start))
    app.add_handler(CommandHandler("balance",  cmd_balance))
    app.add_handler(CommandHandler("referral", cmd_referral))
    app.add_handler(CommandHandler("unlink",   cmd_unlink))
    app.add_handler(link_conv)
    app.add_handler(tools_conv)
    app.add_handler(lang_conv)

    log.info("Bot starting (polling)…")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
