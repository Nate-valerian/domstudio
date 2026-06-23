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


def build_prompt(tool: ContentTool, input_data: dict[str, str], profile: dict[str, str]) -> str:
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
            "Language: Russian",
            "Business profile:",
            str(business),
            "User input:",
            str(input_data),
            "",
            "Rules:",
            "- Write natural Russian for small business sales.",
            "- Keep the output structured with clear headings.",
            "- Make the copy ready to paste into the target channel.",
            "- Avoid exaggerated claims, fake guarantees, fake discounts, and invented availability.",
            "- If price, warranty, timing, or compatibility is missing, ask for the missing detail.",
            "",
            "Task:",
            tool.task,
        ]
    )


def fallback_output(tool_slug: str, input_data: dict[str, str], profile: dict[str, str]) -> str:
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

    templates = {
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
            f"Здравствуйте! Да, {product} доступно. Цена: {price}. Напишите, пожалуйста, удобное время и район в {city}, я быстро подскажу лучший вариант.",
            "",
            "REPLY OPTION 2",
            f"Добрый день! Можем помочь с {product}. Главное преимущество: {advantages}. Уточню детали и дам точный ответ по цене и срокам.",
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
            f"Здравствуйте! Спасибо за отзыв о {business_name}. Нам важно, что вы отметили качество сервиса. По времени ожидания отдельно проверим процесс и постараемся сделать обслуживание быстрее.",
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
            f"Понимаю, цена важна. У нас {price}, потому что в работу входит: {advantages}. Могу подобрать более простой вариант или объяснить, где можно сэкономить без потери результата.",
        ],
    }

    return "\n".join(templates.get(tool_slug, [f"{tool_slug}: {product}"]))
