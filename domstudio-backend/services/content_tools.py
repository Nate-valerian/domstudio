"""Reusable sales-copy tools adapted from the AdPilot MVP."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ContentTool:
    slug: str
    name: str
    category: str
    cost_units: int
    fields: tuple[str, ...]
    task: str


TOOLS: tuple[ContentTool, ...] = (
    # ── Beauty vertical ────────────────────────────────────────────────────────
    ContentTool(
        slug="beauty-service-ad",
        name="Beauty Service Ad",
        category="Beauty",
        cost_units=1,
        fields=("product", "price", "city", "duration", "advantages", "offer"),
        task=(
            "Create a beauty service listing for Avito or 2GIS: 5 title options, "
            "a short description, a detailed description with trust signals, "
            "bullet benefits, booking CTA, and 3 buyer questions with replies."
        ),
    ),
    ContentTool(
        slug="master-bio",
        name="Master Bio",
        category="Beauty",
        cost_units=1,
        fields=("masterName", "product", "city", "advantages", "offer"),
        task=(
            "Write a beauty master profile bio for Avito, 2GIS, or social media: "
            "a short 2-sentence intro, a full 5-sentence bio, specialist certifications "
            "framing, signature service highlights, and a booking CTA."
        ),
    ),
    ContentTool(
        slug="beauty-promo-post",
        name="Beauty Promo Post",
        category="Beauty",
        cost_units=1,
        fields=("product", "offer", "city", "masterName", "advantages"),
        task=(
            "Create 3 beauty promo post variants for VK or Telegram: "
            "one seasonal/holiday promo, one before-and-after story hook, "
            "and one limited-slots urgency post. Each with headline, body, CTA, and 5 relevant hashtags."
        ),
    ),
    # ── Food / restaurant vertical ─────────────────────────────────────────────
    ContentTool(
        slug="food-delivery-ad",
        name="Food Delivery Ad",
        category="Food",
        cost_units=1,
        fields=("product", "price", "city", "advantages", "offer"),
        task=(
            "Create a food delivery / cafe listing for Yandex Maps, Avito, or delivery aggregators: "
            "5 headline options, a short description, a menu highlight paragraph, "
            "delivery/pickup details, trust signals, CTA, and 3 common customer questions with replies."
        ),
    ),
    ContentTool(
        slug="yandex-maps-card",
        name="Yandex Maps Card",
        category="Food",
        cost_units=1,
        fields=("businessName", "product", "city", "advantages", "offer"),
        task=(
            "Write a Yandex Maps / 2GIS business card: business description (up to 500 chars), "
            "category tags, highlight phrases for the photo caption, "
            "a reply template for 5-star reviews, a reply template for 1-3 star reviews, "
            "and an owner response to a critical comment."
        ),
    ),
    ContentTool(
        slug="food-promo-post",
        name="Food Promo Post",
        category="Food",
        cost_units=1,
        fields=("product", "offer", "city", "businessName", "advantages"),
        task=(
            "Create 3 food promo post variants for VK or Telegram: "
            "one dish-of-the-day post, one delivery promo, and one loyalty/regular-customer post. "
            "Each with an appetizing headline, short body, emoji accents, CTA, and 5 relevant hashtags."
        ),
    ),
    # ── Auto service vertical ──────────────────────────────────────────────────
    ContentTool(
        slug="auto-service-ad",
        name="Auto Service Ad",
        category="Auto",
        cost_units=1,
        fields=("product", "price", "city", "advantages", "offer"),
        task=(
            "Create an auto service Avito listing: 5 title options, a short description, "
            "a detailed description, bullet benefits, common objections with replies, "
            "trust signals (warranty, experience, certifications), booking CTA, "
            "and 3 common car-owner questions with clear answers."
        ),
    ),
    ContentTool(
        slug="auto-buyer-reply",
        name="Auto Buyer Reply",
        category="Auto",
        cost_units=1,
        fields=("customerQuestion", "product", "price", "city", "advantages"),
        task=(
            "Create 3 Avito chat reply variants for the auto service customer question: "
            "one short direct answer, one value-focused answer that justifies the price, "
            "and one that moves toward booking with a specific next step."
        ),
    ),
    ContentTool(
        slug="auto-promo-post",
        name="Auto Promo Post",
        category="Auto",
        cost_units=1,
        fields=("product", "offer", "city", "advantages", "businessName"),
        task=(
            "Create 3 social media posts for an auto service for VK or Telegram: "
            "one seasonal promo (winter/summer tyres, pre-trip check), "
            "one trust/expertise post, and one limited-time offer. "
            "Each with hook, body, CTA, and 5 hashtags."
        ),
    ),
    # ── General tools ──────────────────────────────────────────────────────────
    ContentTool(
        slug="avito-ad",
        name="Avito Ad",
        category="Avito",
        cost_units=1,
        fields=("product", "city", "price", "advantages", "targetCustomer", "tone"),
        task=(
            "Create 5 Avito title options, a short description, a long description, "
            "bullet benefits, trust phrases, call to action, and 5 buyer questions "
            "with suggested replies."
        ),
    ),
    ContentTool(
        slug="avito-reply",
        name="Avito Reply",
        category="Avito",
        cost_units=1,
        fields=("customerQuestion", "product", "price", "city", "tone"),
        task=(
            "Create 3 Avito chat reply variants for the customer question. Include "
            "one short answer, one warmer sales answer, and one answer that asks for "
            "missing details."
        ),
    ),
    ContentTool(
        slug="vk-post",
        name="VK Post",
        category="Social",
        cost_units=1,
        fields=("product", "offer", "targetCustomer", "tone", "city"),
        task="Create 3 VK post variants: promotional, educational, and direct offer. Include hook, body, CTA, and hashtags.",
    ),
    ContentTool(
        slug="yandex-ads",
        name="Yandex Ads",
        category="Ads",
        cost_units=2,
        fields=("product", "city", "offer", "advantages", "targetCustomer"),
        task="Create Yandex ad assets: 10 headlines, 6 descriptions, CTAs, keyword ideas, negative keyword ideas, and compliance notes.",
    ),
    ContentTool(
        slug="review-reply",
        name="Review Reply",
        category="Retention",
        cost_units=1,
        fields=("reviewText", "tone", "businessName"),
        task="Create polite replies to the customer review: one public reply, one private follow-up message, and one internal improvement note.",
    ),
    ContentTool(
        slug="product-description",
        name="Product Description",
        category="Marketplace",
        cost_units=1,
        fields=("product", "advantages", "targetCustomer", "price", "tone"),
        task="Create marketplace-style product copy: short description, long description, bullet benefits, specs placeholders, SEO keywords, and CTA.",
    ),
    ContentTool(
        slug="ozon-wb-card",
        name="Ozon/WB Card",
        category="Marketplace",
        cost_units=2,
        fields=("product", "advantages", "targetCustomer", "price"),
        task="Create an Ozon/Wildberries card draft: title, bullet points, SEO description, search keywords, review request message, and Q&A.",
    ),
    ContentTool(
        slug="landing-page",
        name="Landing Page",
        category="Pages",
        cost_units=3,
        fields=("product", "city", "offer", "advantages", "targetCustomer", "tone"),
        task="Create landing page copy: hero, subheadline, benefits, services, proof block, FAQ, CTA, and contact block.",
    ),
    ContentTool(
        slug="sms-promo",
        name="SMS Promo",
        category="Retention",
        cost_units=1,
        fields=("product", "offer", "city", "tone"),
        task="Create 7 SMS promo variants under 160 characters each, with practical CTAs and no spammy claims.",
    ),
    ContentTool(
        slug="price-objection",
        name="Price Objection",
        category="Retention",
        cost_units=1,
        fields=("customerQuestion", "product", "advantages", "price", "tone"),
        task="Create price objection replies for Avito/chat: respectful explanation, value framing, budget option, and question to keep the buyer engaged.",
    ),
)

TOOL_BY_SLUG = {tool.slug: tool for tool in TOOLS}

FIELD_LABELS = {
    "product": "Product or service",
    "city": "City",
    "price": "Price",
    "advantages": "Advantages",
    "targetCustomer": "Target customer",
    "tone": "Tone",
    "offer": "Offer",
    "customerQuestion": "Customer question",
    "reviewText": "Review text",
    "businessName": "Business name",
    "masterName": "Master / specialist name",
    "duration": "Duration",
}

FALLBACK_VALUES = {
    "product": "service",
    "city": "your city",
    "price": "request price",
    "advantages": "fast response, clear terms, trusted work",
    "targetCustomer": "local buyers",
    "tone": "friendly and practical",
    "offer": "free consultation",
    "customerQuestion": "Is this available?",
    "reviewText": "Thank you for the service.",
    "businessName": "Your business",
    "masterName": "the specialist",
    "duration": "60 minutes",
}


def public_tools() -> list[dict[str, Any]]:
    return [
        {
            "slug": tool.slug,
            "name": tool.name,
            "category": tool.category,
            "cost_units": tool.cost_units,
            "fields": list(tool.fields),
        }
        for tool in TOOLS
    ]


def clean_text(value: Any, max_len: int = 1200) -> str:
    if not isinstance(value, str):
        return ""
    return value.strip()[:max_len]


def clean_mapping(values: dict[str, Any] | None) -> dict[str, str]:
    return {str(key): clean_text(value) for key, value in (values or {}).items()}


def value(input_data: dict[str, str], profile: dict[str, str], key: str) -> str:
    return input_data.get(key) or profile.get(key) or FALLBACK_VALUES.get(key, "")


def detect_language(input_data: dict[str, str], profile: dict[str, str]) -> str:
    text = " ".join([*input_data.values(), *profile.values()])
    return "Russian" if any("\u0400" <= char <= "\u04ff" for char in text) else "English"


def normalize_language(language: str | None, input_data: dict[str, str], profile: dict[str, str]) -> str:
    requested = (language or "auto").strip().lower()
    if requested in {"russian", "ru", "русский"}:
        return "Russian"
    if requested in {"english", "en", "английский"}:
        return "English"
    return detect_language(input_data, profile)


def build_prompt(
    tool: ContentTool,
    input_data: dict[str, str],
    profile: dict[str, str],
    language: str | None = None,
) -> str:
    output_language = normalize_language(language, input_data, profile)
    business = {
        "businessName": value(input_data, profile, "businessName"),
        "city": value(input_data, profile, "city"),
        "niche": profile.get("niche", ""),
        "targetCustomer": value(input_data, profile, "targetCustomer"),
        "tone": value(input_data, profile, "tone"),
        "offer": value(input_data, profile, "offer"),
        "phone": profile.get("phone", ""),
    }
    return "\n".join(
        [
            f"Tool: {tool.name}",
            f"Language: {output_language}",
            "Business profile:",
            str(business),
            "User input:",
            str(input_data),
            "",
            "Rules:",
            f"- Write natural {output_language} for small business sales.",
            "- Start from the buyer's real pain, desire, or doubt, then show the relief or outcome the offer gives.",
            "- Make the reader feel the product is useful now: use concrete benefits, sensory details, trust cues, and a clear next step.",
            "- Avoid generic AI phrases, empty hype, pressure tactics, and manipulative fear.",
            "- Keep the output structured with clear headings.",
            "- Make the copy ready to paste into the target channel.",
            "- Avoid exaggerated claims, fake guarantees, fake discounts, and invented availability.",
            "- If price, warranty, timing, or compatibility is missing, ask for the missing detail.",
            "",
            "Task:",
            tool.task,
        ]
    )


def _reply_lines(
    output_language: str,
    product: str,
    price: str,
    city: str,
    advantages: str,
    business_name: str,
    review: str,
) -> dict[str, str]:
    if output_language == "Russian":
        return {
            "reply_1": (
                f"Здравствуйте! Да, {product} доступно. Цена: {price}. "
                f"Напишите, пожалуйста, удобное время и район в {city}, я быстро подскажу лучший вариант."
            ),
            "reply_2": (
                f"Добрый день! Можем помочь с {product}. Главное преимущество: {advantages}. "
                "Уточню детали и дам точный ответ по цене и срокам."
            ),
            "review": (
                f"Здравствуйте! Спасибо за отзыв о {business_name}. Нам важно, что вы отметили качество сервиса. "
                "По времени ожидания отдельно проверим процесс и постараемся сделать обслуживание быстрее."
            ),
            "price": (
                f"Понимаю, цена важна. У нас {price}, потому что в работу входит: {advantages}. "
                "Могу подобрать более простой вариант или объяснить, где можно сэкономить без потери результата."
            ),
        }
    return {
        "reply_1": (
            f"Hi! Yes, {product} is available. Price: {price}. "
            f"Please send a convenient time and area in {city}, and I will suggest the best option."
        ),
        "reply_2": (
            f"Hi! We can help with {product}. Main advantage: {advantages}. "
            "I can confirm the details and give you a precise answer on price and timing."
        ),
        "review": (
            f"Hi! Thank you for your review of {business_name}. We read it carefully: \"{review}\". "
            "We are glad the result was good, and we will also work on making the service faster."
        ),
        "price": (
            f"I understand that price matters. Our price is {price} because it includes: {advantages}. "
            "I can also suggest a simpler option or explain where it is possible to save without losing the result."
        ),
    }


def fallback_output(
    tool_slug: str,
    input_data: dict[str, str],
    profile: dict[str, str],
    language: str | None = None,
) -> str:
    output_language = normalize_language(language, input_data, profile)
    business_name = value(input_data, profile, "businessName")
    product = value(input_data, profile, "product")
    city = value(input_data, profile, "city")
    price = value(input_data, profile, "price")
    advantages = value(input_data, profile, "advantages")
    target_customer = value(input_data, profile, "targetCustomer")
    tone = value(input_data, profile, "tone")
    offer = value(input_data, profile, "offer")
    question = value(input_data, profile, "customerQuestion")
    review = value(input_data, profile, "reviewText")
    master_name = value(input_data, profile, "masterName")
    duration = value(input_data, profile, "duration")
    lines = _reply_lines(output_language, product, price, city, advantages, business_name, review)

    templates = {
        "auto-service-ad": [
            "TITLE OPTIONS",
            f"1. {product} in {city} — warranty included",
            f"2. {product}: {advantages}",
            f"3. {business_name}: {product} from {price}",
            f"4. Fast {product} — honest quote before work starts",
            f"5. {product} today — {offer}",
            "",
            "SHORT DESCRIPTION",
            f"{business_name} — {product} in {city}. Price from {price}. {advantages}.",
            "",
            "BOOKING CTA",
            "Write the car make/model, describe the issue, and we will reply with a quote within the hour.",
            "",
            "BUYER Q&A",
            "Q: How long does it take? A: Depends on the work. We give an exact time when you describe the task.",
            "Q: Do you give warranty? A: Yes, we warranty our work — ask us for the exact terms when you book.",
            "Q: Can I watch while you work? A: Yes, the workshop is open. We explain every step.",
        ],
        "auto-buyer-reply": [
            f"Customer: {question}",
            "",
            "REPLY OPTION 1 — SHORT",
            lines["reply_1"],
            "",
            "REPLY OPTION 2 — VALUE",
            lines["price"],
            "",
            "REPLY OPTION 3 — MOVE TO BOOKING",
            f"Hi! Yes, we do {product}. Send the car make/model and describe the issue — I will give you an exact quote and next available time in {city}.",
        ],
        "auto-promo-post": [
            "POST 1 — SEASONAL",
            f"🚗 Season change? Time for {product}.",
            f"{business_name} in {city}: {advantages}.",
            f"Book this week — {offer}.",
            "",
            "POST 2 — TRUST",
            f"At {business_name}, every job starts with an honest diagnosis.",
            f"{product}: we explain what needs to be done and why. No hidden extras.",
            "Message us with your car and we will answer any question.",
            "",
            "POST 3 — OFFER",
            f"⚡ Limited slots this week for {product}.",
            f"Price: {price}. {advantages}.",
            f"{city}. Message to book.",
        ],
        "food-delivery-ad": [
            "TITLE OPTIONS",
            f"1. {product} in {city} — delivery and pickup",
            f"2. {product}: {advantages}",
            f"3. Order {product} — {offer}",
            f"4. {business_name}: {product} with fast delivery in {city}",
            f"5. Fresh {product} — ready in minutes",
            "",
            "SHORT DESCRIPTION",
            f"{business_name} delivers {product} in {city}. {advantages}. Price from {price}.",
            "",
            "CTA",
            "Order now — we confirm your order within 5 minutes.",
            "",
            "BUYER Q&A",
            "Q: How long is delivery? A: We will confirm the exact time for your area when you place the order.",
            "Q: Can I pick up? A: Yes, pickup is available — write your order and we will give you the ready time.",
        ],
        "yandex-maps-card": [
            "BUSINESS DESCRIPTION",
            f"{business_name} — {product} in {city}. {advantages}. {offer}.",
            "",
            "5-STAR REVIEW REPLY",
            f"Thank you so much! We are glad you enjoyed {product}. Come back soon — we have more to offer.",
            "",
            "1-3 STAR REVIEW REPLY",
            f"Thank you for your honest feedback. We take quality seriously at {business_name} and will review this personally. Please contact us so we can make it right.",
            "",
            "OWNER RESPONSE TO CRITICISM",
            f"We hear you. This is not the standard we hold ourselves to. We are looking into this today and would like to reach out to you directly.",
        ],
        "food-promo-post": [
            "POST 1 — DISH OF THE DAY",
            f"🍽 Today's special: {product}",
            f"{advantages}. Available in {city} — delivery and pickup.",
            f"Order before it runs out: {offer}",
            "",
            "POST 2 — DELIVERY PROMO",
            f"🚀 {offer} on delivery of {product}!",
            f"Order from {business_name} in {city}. Straight to your door.",
            "Order in the app or message us directly.",
            "",
            "POST 3 — LOYALTY POST",
            f"Our regulars know: {product} at {business_name} is different.",
            f"{advantages}.",
            "Come back today — we have something special waiting for you.",
        ],
        "beauty-service-ad": [
            "TITLE OPTIONS",
            f"1. {product} in {city} — {price}, booking open",
            f"2. {product}: professional result, {duration}",
            f"3. {master_name}: {product} near you in {city}",
            f"4. {product} — {advantages}",
            f"5. {offer} — try {product} today",
            "",
            "SHORT DESCRIPTION",
            f"Professional {product} in {city}. Duration: {duration}. Price: {price}. {advantages}.",
            "",
            "BOOKING CTA",
            "Write to confirm your slot — we reply within 15 minutes.",
            "",
            "BUYER Q&A",
            f"Q: How long does it take? A: {duration}. We keep the schedule and let you know before the session.",
            "Q: Do you do home visits? A: Write your area in the message and we will tell you the current options.",
        ],
        "master-bio": [
            "SHORT BIO",
            f"{master_name} — {product} specialist in {city}.",
            "",
            "FULL BIO",
            f"Hi, I am {master_name}, a {product} master based in {city}. "
            f"I specialise in {advantages}. "
            f"Every session is {duration} with full attention to detail and hygiene. "
            f"My clients come back because results last and the process is comfortable. "
            f"{offer} — reach out and let's book your first session.",
            "",
            "BOOKING",
            "Write in chat — I will reply within the hour and confirm the next available slot.",
        ],
        "beauty-promo-post": [
            "POST 1 — SEASONAL PROMO",
            f"✨ {offer} on {product} this week!",
            f"{master_name} in {city}: {advantages}.",
            "Slots are limited — message now to confirm yours.",
            "",
            "POST 2 — BEFORE/AFTER STORY",
            f"Client came in for {product}. Duration: {duration}.",
            "Result: confident, ready, no touch-ups needed for weeks.",
            f"{price}. Book with {master_name} in {city}.",
            "",
            "POST 3 — URGENCY",
            f"Only 3 slots left this week for {product}.",
            f"{price} · {duration} · {city}",
            "Don't wait — message to secure your time.",
        ],
        "avito-ad": [
            "TITLE OPTIONS",
            f"1. {product} in {city} - fast and clear",
            f"2. {product} with warranty and honest terms",
            f"3. {business_name}: {product} from {price}",
            f"4. Reliable {product} for {target_customer}",
            f"5. {product} today - consultation included",
            "",
            "SHORT DESCRIPTION",
            f"{business_name} offers {product} in {city}. Good for {target_customer}. Key strengths: {advantages}. Price: {price}.",
            "",
            "BUYER Q&A",
            f"Q: Is it available? A: Yes, write your details and we will confirm the nearest option in {city}.",
            "Q: Can you discount? A: We can check the best option after we understand the exact request.",
        ],
        "avito-reply": [
            f"Customer: {question}",
            "",
            "REPLY OPTION 1",
            lines["reply_1"],
            "",
            "REPLY OPTION 2",
            lines["reply_2"],
        ],
        "vk-post": [
            "VK POST",
            f"{offer} for {product} in {city}.",
            "",
            f"If you are {target_customer}, this is a simple way to solve the task without long calls or unclear prices. {business_name} focuses on {advantages}.",
            "",
            "CTA",
            "Message us today and we will prepare the best option.",
        ],
        "yandex-ads": [
            "HEADLINES",
            f"{product} in {city}",
            offer,
            f"Fast {product}",
            f"Trusted option for {target_customer}",
            "",
            "DESCRIPTIONS",
            f"{advantages}. Price: {price}. Request a consultation today.",
            f"Practical offer for {target_customer}. Quick reply in {city}.",
        ],
        "review-reply": [
            f"Review: {review}",
            "",
            "REPLY",
            lines["review"],
        ],
        "product-description": [
            "SHORT DESCRIPTION",
            f"{product} for {target_customer}. {advantages}. Price: {price}.",
            "",
            "LONG DESCRIPTION",
            f"{business_name} offers {product} with a {tone} approach. This option is built for {target_customer} who want clear terms, quick communication, and predictable results.",
        ],
        "ozon-wb-card": [
            "PRODUCT TITLE",
            f"{product} - practical choice for {target_customer}",
            "",
            "BULLETS",
            f"- Main benefits: {advantages}",
            f"- Price positioning: {price}",
            "- Easy to compare and order",
        ],
        "landing-page": [
            "HERO",
            f"{product} in {city} without confusion",
            f"{offer}. For {target_customer}.",
            "",
            "BENEFITS",
            f"1. {advantages}",
            "2. Fast answer before the customer cools down",
            "3. Clear price and next step",
        ],
        "sms-promo": [
            "SMS OPTIONS",
            f"1. {business_name}: {offer} on {product} in {city}. Reply today to book.",
            f"2. Need {product}? {offer}. {business_name} will answer quickly.",
            f"3. {city}: {product}. Clear terms, fast reply. Message {business_name}.",
        ],
        "price-objection": [
            f"Customer: {question}",
            "",
            "REPLY",
            lines["price"],
        ],
    }

    return "\n".join(templates.get(tool_slug, [f"{tool_slug}: {product}"]))
