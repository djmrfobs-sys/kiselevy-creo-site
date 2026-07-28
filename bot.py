#!/usr/bin/env python3
"""
KISELEVY CREO — Telegram Bot Assistant
Для сайта: автоматизация, чат-боты, AI, вайбкодинг, маркетинг, продюсирование
"""

import asyncio
import logging
from html import escape

from telegram import (
    BotCommand,
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Update,
    WebAppInfo,
)
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    InlineQueryHandler,
    MessageHandler,
    filters,
)

# ─── Конфигурация ───────────────────────────────────────────────────────
TOKEN = "8809949759:AAF1j1PUXs1IPS6TEcQ4chxVZWz5KyL5Eak"
BOT_USERNAME = "KiselevyCreoBot"  # заменить на реальный username после регистрации у @BotFather
SITE_URL = "https://kiselevy-creo.ru"
WEBHOOK_URL = None  # укажите URL вида https://your-domain.com/webhook для продакшена

import json
import os

PROJECTS_FILE = os.path.join(os.path.dirname(__file__), 'projects.json')

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# ─── Тексты ─────────────────────────────────────────────────────────────

START_TEXT = (
    "👋 Привет! Я — виртуальный помощник **KISELEVY CREO**.\n\n"
    "Мы помогаем бизнесу расти с помощью:\n"
    "🤖 Автоматизации и чат-ботов\n"
    "🧠 AI-решений\n"
    "💻 Вайбкодинга\n"
    "📢 Маркетинга\n"
    "🎬 Продюсирования\n\n"
    "Чем могу быть полезен? Напиши вопрос или выбери команду из меню 👇"
)

ABOUT_TEXT = (
    "**KISELEVY CREO** — команда из двух единомышленников.\n\n"
    "👤 **Артур Киселев** — предприниматель, автоматизатор, вайбкодер.\n"
    "    Опыт: запуск IT-проектов, разработка чат-ботов, AI-интеграции.\n\n"
    "👩 **Кети (Екатерина Киселева)** — маркетолог, продюсер, стратег.\n"
    "    Опыт: продюсирование онлайн-курсов, launch-маркетинг, "
    "упаковка брендов.\n\n"
    "Вместе они создают инструменты, которые реально приносят деньги "
    "и экономят время предпринимателей."
)

SERVICES_TEXT = (
    "**Услуги KISELEVY CREO**\n\n"
    "🤖 **Автоматизация бизнеса**\n"
    "    — CRM, воронки, сквозная аналитика, вебхуки, Zapier-замены\n\n"
    "💬 **Чат-боты**\n"
    "    — Telegram / WhatsApp / VK / сайт, AI-боты, генерация лидов\n\n"
    "🧠 **AI-решения**\n"
    "    — GPT-интеграции, AI-ассистенты, обработка данных, генерация\n\n"
    "✨ **Вайбкодинг**\n"
    "    — Быстрая разработка MVP, лендингов, микросервисов через AI\n\n"
    "📢 **Маркетинг**\n"
    "    — Трафик, контент, блоггинг, автоворонки, нейросети для контента\n\n"
    "🎬 **Продюсирование**\n"
    "    — Запуски, упаковка экспертов, стратегия, делегирование\n\n"
    "👉 Напиши, что тебя интересует, и я расскажу подробнее!"
)

CONTACT_TEXT = (
    "**Контакты KISELEVY CREO**\n\n"
    "📬 Связь с нами:\n\n"
    "📢 **Telegram-канал**\n"
    "    https://t.me/kiselevy_creo\n\n"
    "📧 **Email**\n"
    "    hello@kiselevy-creo.ru\n\n"
    "📸 **Instagram**\n"
    "    https://instagram.com/kiselevy_creo\n\n"
    "💼 **LinkedIn**\n"
    "    https://linkedin.com/company/kiselevy-creo\n\n"
    "👤 **Артур**\n"
    "    https://t.me/arthur_kiselev\n\n"
    "👩 **Кети**\n"
    "    https://t.me/katy_kiseleva\n\n"
    "Ждём тебя! 😊"
)

PORTFOLIO_TEXT = (
    "**Наши проекты**\n\n"
    "🌐 **Сайт KISELEVY CREO**\n"
    f"    {SITE_URL}\n\n"
    "💻 **GitHub**\n"
    "    https://github.com/kiselevy-creo\n\n"
    "🤖 **Примеры ботов**\n"
    "    — Бот для автоматизации поддержки\n"
    "    — AI-ассистент для продаж\n"
    "    — Мультиплатформенный чат-бот\n\n"
    "По каждому проекту могу дать детали — просто спроси!"
)

FALLBACK_TEXT = (
    "Я пока не знаю ответа на этот вопрос 🙈\n"
    "Но могу помочь с информацией о наших услугах!\n\n"
    "Используй /services — чтобы посмотреть услуги\n"
    "Или просто напиши, что тебя интересует 👇"
)

# ─── Хендлеры ───────────────────────────────────────────────────────────


async def start(update: Update, _context):
    """Приветствие + кнопка на сайт."""
    keyboard = [
        [InlineKeyboardButton("🌐 Открыть сайт", web_app=WebAppInfo(url=SITE_URL))],
        [
            InlineKeyboardButton("📋 Услуги", callback_data="services"),
            InlineKeyboardButton("📞 Контакты", callback_data="contact"),
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(START_TEXT, reply_markup=reply_markup)


async def about(update: Update, _context):
    """Информация о команде."""
    await update.message.reply_text(ABOUT_TEXT)


async def services(update: Update, _context):
    """Список услуг."""
    keyboard = [
        [InlineKeyboardButton("🌐 Открыть сайт", web_app=WebAppInfo(url=SITE_URL))],
        [InlineKeyboardButton("📞 Связаться с нами", callback_data="contact")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(SERVICES_TEXT, reply_markup=reply_markup)


async def contact(update: Update, _context):
    """Контакты."""
    await update.message.reply_text(CONTACT_TEXT)


async def portfolio(update: Update, _context):
    """Портфолио / проекты."""
    keyboard = [
        [InlineKeyboardButton("🌐 Сайт", url=SITE_URL)],
        [InlineKeyboardButton("💻 GitHub", url="https://github.com/kiselevy-creo")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(PORTFOLIO_TEXT, reply_markup=reply_markup)


async def handle_message(update: Update, _context):
    """Ответ на произвольное сообщение."""
    text = update.message.text.strip().lower()

    # Простая эвристика
    keywords_about = ["кто", "команда", "артур", "кети", "обо мне", "вы кто"]
    keywords_services = [
        "услуг", "цена", "стоимо", "сколько", "бот", "автоматиза",
        "ai", "чат", "маркетинг", "продюс", "вайбкод", "разработк",
        "сделать", "нужен", "помощ",
    ]
    keywords_contact = ["контакт", "связь", "написа", "email", "почт", "телеграм"]
    keywords_portfolio = [
        "проект", "портфолио", "работа", "пример", "кейс", "сделали",
    ]

    if any(k in text for k in keywords_about):
        await update.message.reply_text(ABOUT_TEXT)
    elif any(k in text for k in keywords_services):
        await update.message.reply_text(SERVICES_TEXT)
    elif any(k in text for k in keywords_contact):
        await update.message.reply_text(CONTACT_TEXT)
    elif any(k in text for k in keywords_portfolio):
        await update.message.reply_text(PORTFOLIO_TEXT)
    else:
        keyboard = [
            [InlineKeyboardButton("🌐 Открыть сайт", url=SITE_URL)],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(FALLBACK_TEXT, reply_markup=reply_markup)


async def inline_query(update: Update, context):
    """Inline mode — позволяет вызывать бота из любого чата через @botusername."""
    query = update.inline_query.query.strip().lower()
    results = []

    # Результаты для inline
    if not query or "привет" in query or "start" in query:
        results.append(
            {
                "type": "article",
                "id": "1",
                "title": "Приветствие",
                "description": "Узнать о KISELEVY CREO",
                "input_message_content": {
                    "message_text": START_TEXT,
                },
            }
        )
    if not query or "услуг" in query or "сервис" in query or "service" in query:
        results.append(
            {
                "type": "article",
                "id": "2",
                "title": "Наши услуги",
                "description": "Автоматизация, AI, боты, маркетинг",
                "input_message_content": {
                    "message_text": SERVICES_TEXT,
                },
            }
        )
    if not query or "контакт" in query or "связь" in query:
        results.append(
            {
                "type": "article",
                "id": "3",
                "title": "Контакты",
                "description": "Как с нами связаться",
                "input_message_content": {
                    "message_text": CONTACT_TEXT,
                },
            }
        )
    if not query or "проект" in query or "портфолио" in query:
        results.append(
            {
                "type": "article",
                "id": "4",
                "title": "Портфолио",
                "description": "Наши проекты и GitHub",
                "input_message_content": {
                    "message_text": PORTFOLIO_TEXT,
                },
            }
        )
    if not query or "команда" in query or "about" in query or "кто" in query:
        results.append(
            {
                "type": "article",
                "id": "5",
                "title": "О команде",
                "description": "Артур и Кети — основатели",
                "input_message_content": {
                    "message_text": ABOUT_TEXT,
                },
            }
        )

    # Inline-режим должен использовать answer_inline_query
    await update.inline_query.answer(
        results=[
            {
                "type": "article",
                "id": r["id"],
                "title": r["title"],
                "description": r["description"],
                "input_message_content": r["input_message_content"],
                "reply_markup": {
                    "inline_keyboard": [
                        [{"text": "🌐 Открыть сайт", "url": SITE_URL}],
                        [
                            {
                                "text": "👤 Артур",
                                "url": "https://t.me/arthur_kiselev",
                            },
                            {
                                "text": "👩 Кети",
                                "url": "https://t.me/katy_kiseleva",
                            },
                        ],
                    ]
                },
            }
            for r in results
        ],
        cache_time=30,
    )


async def callback_handler(update: Update, _context):
    """Обработка кнопок callback_data."""
    query: CallbackQuery = update.callback_query
    await query.answer()

    if query.data == "services":
        await query.edit_message_text(SERVICES_TEXT)
    elif query.data == "contact":
        await query.edit_message_text(CONTACT_TEXT)


# ─── Управление проектами ─────────────────────────────────────────────

def load_projects():
    """Загрузить проекты из JSON-файла."""
    if os.path.exists(PROJECTS_FILE):
        with open(PROJECTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_projects(projects):
    """Сохранить проекты в JSON-файл."""
    with open(PROJECTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)

def git_commit_and_push(message):
    """Commit and push projects.json to GitHub."""
    import subprocess
    repo_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        subprocess.run(['git', '-C', repo_dir, 'add', 'projects.json'], capture_output=True)
        result = subprocess.run(['git', '-C', repo_dir, 'diff', '--cached', '--quiet'], capture_output=True)
        if result.returncode == 0:
            return False  # No changes
        subprocess.run(['git', '-C', repo_dir, 'commit', '-m', message], capture_output=True)
        subprocess.run(['git', '-C', repo_dir, 'push'], capture_output=True)
        return True
    except Exception as e:
        logger.warning(f'Git push failed: {e}')
        return False

def generate_portfolio_js():
    """Сгенерировать JS-код для обновления портфолио на сайте."""
    projects = load_projects()
    if not projects:
        return None
    # Create a script tag with the projects data that can be injected into any page
    js = '''<script>
(function() {
  const newProjects = ''' + json.dumps(projects, ensure_ascii=False) + ''';
  try {
    const existing = JSON.parse(localStorage.getItem('kc_projects') || '[]');
    const merged = [...existing];
    for (const np of newProjects) {
      if (!merged.find(p => p.id === np.id)) {
        merged.push(np);
      }
    }
    localStorage.setItem('kc_projects', JSON.stringify(merged));
    if (typeof renderPortfolio === 'function') {
      const activeFilter = document.querySelector('.portfolio-filter.active');
      renderPortfolio(activeFilter ? activeFilter.dataset.filter : 'all');
    }
  } catch(e) { console.error('KC portfolio update error', e); }
})();
</script>'''
    return js

# ─── /addproject command ────────────────────────────────────────────────

VALID_CATEGORIES = {'site', 'bot', 'ai', 'marketing', 'design'}
CATEGORY_EMOJI = {'site': '🌐', 'bot': '🤖', 'ai': '🧠', 'marketing': '📢', 'design': '🎨'}

async def addproject(update: Update, _context):
    """Добавить проект в портфолио.
    Формат: /addproject Название | категория | описание | ссылка
    """
    user = update.effective_user
    text = update.message.text.strip()
    
    # Remove /addproject prefix
    args = text[len('/addproject'):].strip()
    
    if not args or '|' not in args:
        await update.message.reply_text(
            '❌ *Формат:* `/addproject Название | категория | описание | ссылка`\n'
            'Категории: `site`, `bot`, `ai`, `marketing`, `design`\n\n'
            '*Пример:*\n'
            '`/addproject Чат-бот для доставки | bot | Автоматический приём заказов в Telegram | https://t.me/bot`',
            parse_mode='Markdown'
        )
        return
    
    parts = [p.strip() for p in args.split('|')]
    
    if len(parts) < 2:
        await update.message.reply_text('❌ Нужно минимум: название и категория')
        return
    
    title = parts[0]
    category = parts[1].lower()
    description = parts[2] if len(parts) > 2 else ''
    link = parts[3] if len(parts) > 3 else ''
    
    if category not in VALID_CATEGORIES:
        await update.message.reply_text(
            f'❌ Неверная категория "{category}". Допустимые: ' + ', '.join(VALID_CATEGORIES)
        )
        return
    
    emoji = CATEGORY_EMOJI.get(category, '📦')
    
    # Create project object
    project = {
        'id': f'proj-{abs(hash(title + str(os.path.getmtime(".")))) % 100000}',
        'title_ru': title,
        'title_en': title,
        'category': category,
        'desc_ru': description,
        'desc_en': description,
        'image': '',
        'link': link,
        'link_label_ru': 'Подробнее →',
        'link_label_en': 'Learn more →',
    }
    
    # Save
    projects = load_projects()
    projects.append(project)
    save_projects(projects)
    
    # Auto-commit and push to GitHub (for Cloudflare Pages auto-deploy)
    pushed = git_commit_and_push(f'➕ Новый проект: {title}')
    if pushed:
        await update.message.reply_text(
            f'🚀 *Автоматически залито на GitHub!*\n'
            f'После деплоя проект появится на сайте.',
            parse_mode='Markdown'
        )
    
    # Generate the JavaScript injection (fallback)
    js_code = generate_portfolio_js()
    
    await update.message.reply_text(
        f'✅ *Проект добавлен!*\n\n'
        f'{emoji} *{escape(title)}*\n'
        f'📂 {escape(category)}\n'
        f'📝 {escape(description) or "—"}\n'
        f'🔗 {escape(link) or "—"}\n\n'
        f'📌 *Чтобы проект появился на сайте:*\n'
        f'1️⃣ Открой сайт в браузере\n'
        f'2️⃣ Нажми F12 → Console\n'
        f'3️⃣ Вставь этот код и нажми Enter:\n\n'
        f'```javascript\n'
        f'{js_code}\n'
        f'```\n\n'
        f'✨ Проект появится в портфолио сразу!',
        parse_mode='Markdown'
    )
    
    # Also notify the admin about the new project
    await update.message.reply_text(
        f'👤 *{user.full_name}* добавил проект: *{escape(title)}*',
        parse_mode='Markdown'
    )

async def listprojects(update: Update, _context):
    """Показать все проекты."""
    projects = load_projects()
    
    if not projects:
        await update.message.reply_text('📭 Проектов пока нет. Добавь через /addproject')
        return
    
    text = f'📁 *Всего проектов:* {len(projects)}\n\n'
    for i, p in enumerate(projects, 1):
        emoji = CATEGORY_EMOJI.get(p.get('category', ''), '📦')
        text += f'{i}. {emoji} {escape(p["title_ru"])} — {escape(p["category"])}\n'
        if p.get('desc_ru'):
            text += f'   📝 {escape(p["desc_ru"][:80])}\n'
    
    await update.message.reply_text(text, parse_mode='Markdown')

async def deleteproject(update: Update, _context):
    """Удалить проект по номеру из списка.
    Использование: /delproject 3
    """
    text = update.message.text.strip()
    args = text[len('/delproject'):].strip()
    
    if not args.isdigit():
        await update.message.reply_text('❌ Укажи номер проекта из /listprojects')
        return
    
    idx = int(args) - 1
    projects = load_projects()
    
    if idx < 0 or idx >= len(projects):
        await update.message.reply_text(f'❌ Нет проекта под номером {args}')
        return
    
    removed = projects.pop(idx)
    save_projects(projects)
    
    js_code = generate_portfolio_js()
    
    await update.message.reply_text(
        f'🗑 *Удалён проект:* {escape(removed["title_ru"])}\n\n'
        f'*Чтобы обновить сайт:* вставь в консоль (F12):\n\n'
        f'```javascript\n'
        f'{js_code}\n'
        f'```',
        parse_mode='Markdown'
    )

async def post_init(application: Application):
    """Установка команд бота."""
    commands = [
        BotCommand("start", "🚀 Приветствие"),
        BotCommand("about", "👥 О команде"),
        BotCommand("services", "📋 Услуги"),
        BotCommand("contact", "📞 Контакты"),
        BotCommand("portfolio", "💼 Портфолио"),
        BotCommand("addproject", "📸 Добавить проект в портфолио"),
        BotCommand("listprojects", "📁 Список проектов"),
        BotCommand("delproject", "🗑 Удалить проект"),
    ]
    await application.bot.set_my_commands(commands)
    logger.info("Команды бота установлены")


# ─── Запуск ─────────────────────────────────────────────────────────────


def main():
    """Точка входа."""
    application = Application.builder().token(TOKEN).post_init(post_init).build()

    # Регистрируем хендлеры
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("about", about))
    application.add_handler(CommandHandler("services", services))
    application.add_handler(CommandHandler("contact", contact))
    application.add_handler(CommandHandler("portfolio", portfolio))
    application.add_handler(CommandHandler("addproject", addproject))
    application.add_handler(CommandHandler("listprojects", listprojects))
    application.add_handler(CommandHandler("delproject", deleteproject))

    # Обработка кнопок
    application.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)
    )

    # Inline-режим
    application.add_handler(InlineQueryHandler(inline_query))

    # Callback query (кнопки)
    application.add_handler(
        CallbackQueryHandler(callback_handler)
    )

    # Сначала регистрируем webhook, если задан
    if WEBHOOK_URL:
        logger.info("Запуск в режиме webhook на %s", WEBHOOK_URL)
        application.run_webhook(
            listen="0.0.0.0",
            port=8443,
            url_path=TOKEN,
            webhook_url=f"{WEBHOOK_URL}/{TOKEN}",
        )
    else:
        logger.info("Бот-помощник KISELEVY CREO запущен")
        application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
