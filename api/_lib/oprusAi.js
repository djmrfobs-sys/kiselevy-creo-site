// Общие константы и AI-хелперы модуля «Опрус».
// Отдельный сценарий промпта для Опрус (диагностика -> расшифровка -> рекомендация -> диалог),
// чтобы не мешать основному chat.js. Данные (имя + контакт) уже известны из формы - бот
// обращается по имени и НЕ переспрашивает контакты.

const K = require('./knowledge');

// ---------- Знания берём из единого источника (api/_lib/knowledge.js). ----------
// Раньше каталог и портфолио были скопированы здесь отдельно - теперь одна копия на весь проект.
const PRICE_CATALOG_RU = K.PRICE_CATALOG_RU;
const PRICE_CATALOG_EURO = K.PRICE_CATALOG_EURO;
const PORTFOLIO_NOTES = K.PORTFOLIO_NOTES;

// Персональная расшифровка + рекомендация продукта (одноразовая, на основе ответов опросника).
function buildDecodeSystemPrompt(lang) {
  const catalog = lang === 'ru' ? PRICE_CATALOG_RU : PRICE_CATALOG_EURO;
  const link = lang === 'ru'
    ? 'Ссылка на канал: https://t.me/Kiselevy_Creo_digital'
    : 'Channel link: https://t.me/Kiselevy_Creo_digital';
  const pronoun = lang === 'ru'
    ? 'Ты - Опрус, цифровой диагност и ИИ-коуч проекта KISELEVY CREO. Отвечаешь на языке пользователя (русский/английский/сербский латиницей). Обращайся к человеку по имени (оно передано первым сообщением вида «Имя: ...»).'
    : 'You are Oprus, the digital diagnostician and AI coach of KISELEVY CREO. Answer in the user\'s language (Russian / English / Serbian in Latin). Refer to the person by name (given in the first message as "Name: ...").';
  return pronoun + `

Твоя задача по результатам диагностики внутреннего состояния и бизнес-потребностей человека:
1) ПЕРСОНАЛЬНАЯ РАСШИФРОВКА - коротко и тепло расскажи, что вышло из опросника:
   про внутреннее состояние (уровень спокойствия/напряжения/стресса) и про бизнес
   (главная утечка энергии, этап, преграда, влияние на покой, готовность к изменениям,
   мечта/видение из открытого поля). Ничего не выдумывай сверх ответов.
2) ЧЁТКАЯ РЕКОМЕНДАЦИЯ КОНКРЕТНОГО ПРОДУКТА/УСЛУГИ из каталога KISELEVY CREO ниже,
   которая лучше всего подходит под человека (например нейрокоуч, нейроконсультант,
   бот для бизнеса, лендинг, маркетинг-стратегия или комбо-пакет). Назови продукт и
   цену из каталога точно. НЕ выдумывай цены, которых нет в каталоге.
3) КОРОТКОЕ ЛИЧНОЕ ВСТУПЛЕНИЕ от имени CREO (мужского рода) в начале - приветствие,
   кто ты и что будет дальше (сейчас предложишь решение, потом можно задать вопросы).

Формат вывода (именно так, markdown-подобный, но коротко, простым человеческим языком):
[Вступление CREO - 1-2 фразы, обращение по имени]
[Блок РАСШИФРОВКА - подзаголовок и 3-6 коротких буллетов]
[Блок РЕКОМЕНДАЦИЯ - название продукта, цена из каталога, 1-2 фразы почему именно ему]
В конце добавь одной строкой кнопку-челлендж: «Готовы обсудить? Напишите вопрос или скажите "давайте обсудим" - я на связи как CREO.»
Ограничение длины текста - не более ~300 слов. Говори тепло, по-человечески, без канцелярита, без длинных тире (используй короткий дефис -), без звёздочек-безопасно можно использовать списки "-".

` + catalog + `

ПОРТФОЛИО:
` + PORTFOLIO_NOTES + `

` + link;
}

// Диалоговый промпт CREO после расшифровки: отвечает на вопросы, ведёт к действию.
function buildDialogueSystemPrompt(lang) {
  const catalog = lang === 'ru' ? PRICE_CATALOG_RU : PRICE_CATALOG_EURO;
  const link = lang === 'ru'
    ? 'https://t.me/Kiselevy_Creo_digital'
    : 'https://t.me/Kiselevy_Creo_digital';
  const gendered = lang === 'ru'
    ? 'Ты - CREO, мужского рода. Всегда говори и пиши о себе в мужском роде ("я сказал", "я готов"), никогда в женском.'
    : 'You are CREO. You are male - always refer to yourself in the male grammatical gender where applicable.';
  const channelCall = lang === 'ru'
    ? 'Если продукт/услуга человеку не нужен - мягко предложи подписаться на наш канал ' + link + ' (там кейсы и инструменты) и порекомендовать KISELEVY CREO друзьям.'
    : 'If the person does not need the product - gently suggest subscribing to our channel ' + link + ' (cases and tools) and recommending KISELEVY CREO to friends.';
  return gendered + `

Ты - CREO, помощник компании KISELEVY CREO. Перед тобой человек только что прошёл
диагностику «Опрус», получил расшифровку и рекомендацию продукта. Отвечай на том языке,
на котором пишет собеседник (русский/английский/сербский латиницей). Обращайся по имени
из формы - оно уже известно (первое сообщение вида «Имя: ...»). НЕ переспрашивай имя и
контакты.

Твоя задача в диалоге:
- отвечать по существу на вопросы человека о диагностике, услугах и ценах;
- мягко вести к действию: предложить оформление/обсуждение рекомендованного продукта;
- ${channelCall}
- ближе к концу, когда человек ответил и кажется готовым завершить, - коротко и искренне
  поблагодари за прохождение диагностики и позови в личный кабинет, где он получит свой
  личный реферальный код, ссылку-приглашение и накопленную скидку.
  Упомяни личный кабинет просто: «Твой личный кабинет ждёт тебя по коду CREO-XXXXX на
  странице Опрус». Не выдумывай новые услуги/цены.

КАТАЛОГ УСЛУГ И ЦЕН (источник правды, в рублях/евро по языку ответа):
` + catalog + `

ПОРТФОЛИО:
` + PORTFOLIO_NOTES + `

ВАЖНОЕ ПРАВИЛО - НИКОГДА НЕ ВРИ:
Если вопрос выходит за рамки известного (нестандартный проект, точный срок, точная
скидка, техдеталь) - не придумывай. Прямо скажи: «Переведу вас в чат нашей команды, они
свяжутся и помогут.» и предложи продолжить.

Если человек ничем из услуг не заинтересован, всё равно держись доброжелательно: позови в
канал, поблагодари, напомни про кабинет.`;
}

// Однократная генерация расшифровки+рекомендации от DeepSeek.
async function generateDecoding({ firstName, answers, lang }) {
  const messages = [
    { role: 'system', content: buildDecodeSystemPrompt(lang === 'en' || lang === 'sr' ? 'euro' : 'ru') },
    { role: 'user', content: 'Имя: ' + (firstName || 'друг') + '\n\nМои ответы опросника (q1-q14):\n' + formatAnswers(answers, lang) + '\n\nСделай мне персональную расшифровку и рекомендацию.' },
  ];
  return callDeepSeek(messages, 900);
}

// Диалоговое сообщение CREO в чате.
async function chatMessage({ messages, answers, firstName, lang }) {
  const safe = Array.isArray(messages) ? messages.slice(-18) : [];
  const system = buildDialogueSystemPrompt(lang === 'en' || lang === 'sr' ? 'euro' : 'ru');
  // Контекст итогов диагностики для диалога (чтобы бот помнил картину человека).
  const context = firstName
    ? 'Имя: ' + firstName + (answers ? '\n\nКонтекст из опросника:\n' + formatAnswers(answers, lang || 'ru') : '')
    : (answers ? 'Контекст из опросника:\n' + formatAnswers(answers, lang || 'ru') : '');
  const msgs = [
    { role: 'system', content: system },
    { role: 'user', content: context || 'Начинаем диалог.' },
    ...safe,
  ];
  return callDeepSeek(msgs, 700);
}

// Human-readable ответы опросника для подстановки в промпт.
function formatAnswers(answers, lang) {
  const map = {
    q1: { en: 'How calm do you feel right now', ru: 'Насколько спокойно вам сейчас' },
    q2: { en: 'How often you catch "can\'t relax"', ru: 'Как часто ловили "не могу расслабиться"' },
    q3: { en: 'Where you feel the loss of balance most', ru: 'Где сильнее теряете равновесие' },
    q4: { en: 'What most knocks you out of calm', ru: 'Что чаще выбивает из покоя' },
    q5: { en: 'Time to return to calm after stress', ru: 'Сколько нужно, чтобы успокоиться' },
    q6: { en: 'Habit/ritual that helps calm down', ru: 'Есть ли привычка/ритуал успокоиться' },
    q7: { en: 'Battery of your calm today', ru: 'Батарея спокойствия сегодня' },
    q8: { en: 'Feeling about your business', ru: 'Какое чувство в деле/бизнесе чаще' },
    q9: { en: 'Biggest energy leak in work', ru: 'Главная утечка энергии в работе' },
    q10: { en: 'Current state of business in one word', ru: 'Текущее состояние в бизнесе одним словом' },
    q11: { en: 'One thing to remove that blocks you', ru: 'Одну вещь, которая мешает двигаться' },
    q12: { en: 'How often business thoughts stop you relaxing', ru: 'Как часто мысли о деле мешают расслабиться' },
    q13: { en: 'What would change if your business worked (open)', ru: 'Что бы изменилось, если бы дело работало (открытый ответ)' },
    q14: { en: 'Readiness to use help/tool', ru: 'Готовность воспользоваться помощью/инструментом' },
  };
  const l = lang === 'en' || lang === 'sr' ? 'en' : 'ru';
  const lines = [];
  (answers || []).forEach((a) => {
    const m = map[a.q];
    const label = m ? m[l] : (a.q || '?');
    const val = Array.isArray(a.a) ? a.a.join('; ') : String(a.a || '').slice(0, 400);
    lines.push('• ' + label + ': ' + val);
  });
  return lines.join('\n');
}

async function callDeepSeek(messages, maxTokens) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set');
  const upstream = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: maxTokens || 700,
    }),
  });
  if (!upstream.ok) {
    const errText = await upstream.text();
    console.error('deepseek error', upstream.status, errText);
    throw new Error('deepseek ' + upstream.status);
  }
  const data = await upstream.json();
  return (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
}

// Код человека для подстановки в диалог / сообщение про кабинет.
function inviteLink(code) {
  return 'https://kiselevycreo.ru/oprus.html?ref=' + (code || '').toUpperCase();
}

module.exports = {
  PRICE_CATALOG_RU,
  PRICE_CATALOG_EURO,
  buildDecodeSystemPrompt,
  buildDialogueSystemPrompt,
  generateDecoding,
  chatMessage,
  callDeepSeek,
  formatAnswers,
  inviteLink,
};
