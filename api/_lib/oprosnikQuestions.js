// РАСШИФРОВКА ОТВЕТОВ ОПРОСНИКА (25 вопросов, 6 блоков).
//
// Зачем: бот получает ответы человека массивом (значение за значением, по порядку).
// Чтобы он понимал, что именно ответил человек (а не гадал по тексту), здесь лежит карта
// "индекс вопроса -> что за вопрос -> на какой блок воронки он отвечает".
//
// Порядок ВАЖЕН и совпадает с oprosnik.html: BLOCKS -> q[]. Если там вопрос переставят,
// здесь нужно поправить. Один вопрос - одна строка.
//
// Используется в clientSystemPrompt: ответы склеиваются с вопросами в понятный список.

// Индекс -> тема вопроса (короткая метка для промпта).
const QUESTION_TOPICS_RU = [
  'Чем занимается (дело, ниша)',
  'Работает сам или с командой',
  'Кто клиенты и как находят',
  'На чём зарабатывает (услуга/продукт/курс/канал)',
  'Что мешает больше всего (что съедает силы)',
  'Какая рутина выматывает',
  'Где теряются люди, кто не купил',
  'Что переложил бы на помощника в первую очередь',
  'Цель на 3-6 месяцев',
  'Как поймёт, что получилось',
  'Что важнее: время / продажи / порядок / другое',
  'Что уже есть (сайт, бот, канал, CRM)',
  'Чем пользуется сейчас (блокнот, таблицы, сервисы)',
  'Пробовал ли автоматизацию или ИИ',
  'Как с контентом (сам/не хватает времени/не знает о чём)',
  'Как быстро хочет начать',
  'Есть ли бюджет, примерный диапазон',
  'Что важнее при выборе: результат/цена/скорость/надёжность',
  'Что съедает день (планирование, напоминания, переписка, быт)',
  'Что помощник должен помнить (даты, привычки, цели, люди)',
  'Чем живёт вне работы (семья, спорт, увлечения)',
  'Стиль общения (по-дружески / строго / тепло)',
  'Текст или голос, нужны ли языки',
  'В какие часы и как часто напоминать',
  'Что должно быть в помощнике, что бы ему доверил',
];

const QUESTION_TOPICS_EN = [
  'What they do (business, niche)',
  'Works alone or with a team',
  'Who the clients are and how they find them',
  'What they earn from (service/product/course/channel)',
  'What bothers them most (what drains them)',
  'Which routine wears them out',
  'Where people get lost, who never bought',
  'What they would hand over to an assistant first',
  'Goal for the next 3-6 months',
  'How they will know it worked',
  'What matters more: time / sales / order / other',
  'What they already have (site, bot, channel, CRM)',
  'What they use now (notebook, spreadsheets, services)',
  'Whether they tried automation or AI',
  'Content situation (do it themselves / no time / do not know what to write)',
  'How fast they want to start',
  'Whether there is a budget, rough range',
  'What matters most when choosing: result/price/speed/reliability',
  'What eats their day (planning, reminders, messaging, chores)',
  'What an assistant should remember (dates, habits, goals, people)',
  'What they live for outside work (family, sport, hobbies)',
  'Communication style (friendly / strictly / warm)',
  'Text or voice, languages needed',
  'Which hours and how often to remind',
  'What the assistant must have, what they would trust it with',
];

// Собирает человекочитаемый список "вопрос: ответ" из массива ответов.
// answers - массив значений по порядку. lang - 'ru' или иное (берём EN).
function describeAnswers(answers, lang) {
  if (!Array.isArray(answers) || !answers.length) return '';
  const topics = lang === 'ru' ? QUESTION_TOPICS_RU : QUESTION_TOPICS_EN;
  const lines = [];
  answers.forEach((val, i) => {
    const v = String(val || '').trim();
    if (!v) return;
    const topic = topics[i] || ('Вопрос ' + (i + 1));
    lines.push('- ' + topic + ': ' + v);
  });
  return lines.join('\n');
}

module.exports = {
  QUESTION_TOPICS_RU,
  QUESTION_TOPICS_EN,
  describeAnswers,
};
