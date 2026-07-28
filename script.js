/* Гарантированное скрытие загрузчика — сработает в любом случае */
!function(){
  var t = setInterval(function(){ 
    var el = document.getElementById('siteLoader');
    if(!el){ clearInterval(t); return; }
    el.classList.add('hide');
    el.style.display = 'none';
    clearInterval(t);
  }, 600);
  setTimeout(function(){
    var el = document.getElementById('siteLoader');
    if(el){ el.classList.add('hide'); el.style.display = 'none'; }
  }, 2500);
}();

/* ==============================================
   BILINGUAL RU / EN
   ============================================== */
window.__KC_DEBUG = {};
window.onerror = function(msg, url, line) {
  window.__KC_ERR = {msg, url, line};
  console.warn('KC caught: ', msg, line);
  return true;
};

const LANG = {
  ru: {
    site_title: 'Kiselevy_creo — автоматизация, чат-боты, AI, продюсирование, маркетинг',
    site_desc: 'Kiselevy_creo — портфолио проектов по автоматизации, чат-ботам, AI-системам, продюсированию и маркетингу.',
    nav_home: 'Главная',
    nav_services: 'Услуги',
    nav_portfolio: 'Портфолио',
    nav_about: 'О нас',
    nav_faq: 'FAQ',
    nav_tasks: 'Задачи',
    nav_contact: 'Контакты',
    hero_title: 'Автоматизация, AI, чат-боты, маркетинг — под ключ',
    hero_subtitle: 'Превращаем идеи в готовые цифровые продукты команда KISELEVY CREO',
    hero_cta: 'Обсудить проект',
    hero_secondary: 'Посмотреть работы',
    services_title: 'Что мы делаем',
    services_subtitle: 'Наши компетенции — от идеи до запуска',
    work_title: 'Наши работы',
    work_subtitle: 'Проекты, которыми гордимся',
    about_title: 'О нас',
    about_subtitle: 'Команда KISELEVY CREO',
    faq_title: 'Часто задаваемые вопросы',
    faq_subtitle: 'Ответы на то, что нас чаще всего спрашивают',
    tasks_title: 'Список задач',
    tasks_subtitle: 'Оставьте свою задачу — мы найдём решение',
    tasks_placeholder: 'Опишите вашу задачу или идею...',
    tasks_btn: 'Отправить задачу',
    contact_title: 'Связаться с нами',
    contact_subtitle: 'Напишите нам — мы на связи',
    contact_name: 'Ваше имя',
    contact_msg: 'Ваше сообщение',
    contact_btn: 'Отправить',
    calendar_title: 'Записаться на созвон',
    calendar_step1: 'Шаг 1 · Выберите день',
    calendar_step2: 'Шаг 2 · Выберите время',
    calendar_step3: 'Шаг 3 · Контакты',
    calendar_name: 'Ваше имя',
    calendar_contact: 'Telegram, телефон или email',
    calendar_btn: 'Подтвердить запись',
    theme_light: '☀️',
    theme_dark: '🌙',
    lang_ru: 'RU',
    lang_en: 'EN',
    chat_placeholder: 'Напишите сообщение...',
    chat_btn: 'Отправить',
    chat_welcome: 'Привет! Я помощник KISELEVY CREO. Чем могу помочь?',
    all_projects: 'Все проекты',
    filter_all: 'Все',
    portfolio_title: 'Наши работы',
    portfolio_subtitle: 'Проекты, которыми гордимся',
    portfolio_empty: 'Проекты скоро появятся',

    achiev_title: 'Цифры и факты',
    achiev_subtitle: 'То, чем мы гордимся',
    achiev_1: 'Запущенных проектов',
    achiev_2: 'Довольных клиентов',
    achiev_3: 'Ниш и направлений',
    achiev_4: 'Года на рынке',
    logobar_title: 'Нам доверяют',
    team_title: 'Кто мы',
    team_subtitle: 'Команда, которая превращает идеи в продукты',
    team_artur_name: 'Артур',
    team_artur_role: 'AI-инженер, вайбкодер',
    team_artur_desc: 'Автоматизирую процессы, пишу ботов, строю AI-системы. Вайбкодящий инженер с любовью к элегантным решениям.',
    team_keti_name: 'Кети',
    team_keti_role: 'Маркетолог, продюсер',
    team_keti_desc: 'Стратегия, упаковка, запуски. Помогаю проектам звучать и продавать.',
    team_you_title: 'Вы?',
    team_you_role: 'Наш следующий клиент',
    team_you_desc: 'Расскажите о своей задаче — подберём решение и соберём команду под ваш проект.',
    team_you_cta: 'Связаться с нами →',
  },
  en: {
    site_title: 'Kiselevy_creo — automation, chatbots, AI, production, marketing',
    site_desc: 'Kiselevy_creo — portfolio of projects in automation, chatbots, AI systems, production and marketing.',
    nav_home: 'Home',
    nav_services: 'Services',
    nav_portfolio: 'Portfolio',
    nav_about: 'About',
    nav_faq: 'FAQ',
    nav_tasks: 'Tasks',
    nav_contact: 'Contact',
    hero_title: 'Automation, AI, chatbots, marketing — end-to-end',
    hero_subtitle: 'Turning ideas into ready digital products — KISELEVY CREO team',
    hero_cta: 'Discuss project',
    hero_secondary: 'See our work',
    services_title: 'What we do',
    services_subtitle: 'Our expertise — from idea to launch',
    work_title: 'Our work',
    work_subtitle: 'Projects we are proud of',
    about_title: 'About us',
    about_subtitle: 'KISELEVY CREO team',
    faq_title: 'Frequently Asked Questions',
    faq_subtitle: 'Answers to what we are most often asked',
    tasks_title: 'Task List',
    tasks_subtitle: 'Leave your task — we will find a solution',
    tasks_placeholder: 'Describe your task or idea...',
    tasks_btn: 'Submit task',
    contact_title: 'Contact us',
    contact_subtitle: 'Write to us — we are here',
    contact_name: 'Your name',
    contact_msg: 'Your message',
    contact_btn: 'Send',
    calendar_title: 'Book a call',
    calendar_step1: 'Step 1 · Select day',
    calendar_step2: 'Step 2 · Select time',
    calendar_step3: 'Step 3 · Contact info',
    calendar_name: 'Your name',
    calendar_contact: 'Telegram, phone or email',
    calendar_btn: 'Confirm booking',
    theme_light: '☀️',
    theme_dark: '🌙',
    lang_ru: 'RU',
    lang_en: 'EN',
    chat_placeholder: 'Type a message...',
    chat_btn: 'Send',
    chat_welcome: 'Hi! I am KISELEVY CREO assistant. How can I help?',
    all_projects: 'All projects',
    filter_all: 'All',
  
    portfolio_title: 'Our Work',
    portfolio_subtitle: 'Projects we are proud of',
    portfolio_empty: 'Projects coming soon',}
};

let currentLang = localStorage.getItem('kc_lang') || 'ru';

function t(key) {
  return LANG[currentLang][key] || key;
}

function applyLang() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (key) el.placeholder = t(key);
  });
  document.title = t('site_title');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = t('site_desc');
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.textContent = currentLang === 'ru' ? 'EN' : 'RU';
  });
  // Update theme toggle text
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('.theme-toggle').forEach(el => {
    el.textContent = isDark ? t('theme_dark') : t('theme_light');
  });
}

function switchLang(lang) {
  currentLang = lang;
  localStorage.setItem('kc_lang', lang);
  applyLang();
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  applyLang();
});

  // Запускаем анимацию загрузки максимально рано, ещё до отрисовки остального контента
  (function(){
    var fill = document.getElementById('loaderBarFill');
    requestAnimationFrame(function(){ if(fill) fill.style.width = '100%'; });
  })();

/* ================================================================
   KISELEVY_CREO — ЗВУКОВЫЕ ЭФФЕКТЫ (SoundFX)
   ------------------------------------------------------------
   Современные UI-звуки генерируются на лету через Web Audio API —
   никаких mp3-файлов не нужно, сайт остаётся лёгким и работает
   без интернета. Звуки: клик по меню/фильтрам, открытие карточки
   работы, переход к новой секции при скролле, успешная отправка
   формы.

   Управление:
   - Кнопка-колонка внизу справа включает/выключает звук,
     выбор запоминается в браузере посетителя (localStorage).
   - Из-за политики браузеров звук может начать играть только
     после первого клика/нажатия клавиши на странице — это
     нормальное поведение, не баг.
   - Чтобы сделать звуки тише/громче — поменяйте значения gain
     ниже (0.05–0.15 — комфортный диапазон).
   ================================================================ */
const SoundFX = (() => {
  let ctx;
  let enabled = true;
  try{
    const saved = localStorage.getItem('kc_sound_enabled');
    if(saved !== null) enabled = JSON.parse(saved);
  }catch(e){}

  function ensureCtx(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      ctx = new AC();
    }
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone({freq=440, freqEnd=null, type='sine', duration=.12, gain=.09, filterFreq=null}={}){
    if(!enabled) return;
    const c = ensureCtx(); if(!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if(freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd,1), t0 + duration);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    let out = osc;
    if(filterFreq){
      const f = c.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = filterFreq;
      osc.connect(f); f.connect(g);
    } else {
      osc.connect(g);
    }
    g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + duration + 0.03);
  }

  function noiseBurst({duration=.2, gain=.05, filterFreq=1800}={}){
    if(!enabled) return;
    const c = ensureCtx(); if(!c) return;
    const t0 = c.currentTime;
    const size = Math.max(1, Math.floor(c.sampleRate * duration));
    const buffer = c.createBuffer(1, size, c.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<size;i++){ data[i] = (Math.random()*2-1) * (1 - i/size); }
    const src = c.createBufferSource(); src.buffer = buffer;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = filterFreq;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(t0);
  }

  return {
    click(){ tone({freq:900, type:'sine', duration:.05, gain:.07, filterFreq:5000}); },
    tick(){ tone({freq:1150, type:'triangle', duration:.045, gain:.045}); },
    whoosh(){ noiseBurst({duration:.22, gain:.045, filterFreq:1500}); tone({freq:300, freqEnd:700, type:'sine', duration:.2, gain:.05}); },
    open(){ tone({freq:440, freqEnd:920, type:'sine', duration:.16, gain:.08}); noiseBurst({duration:.1, gain:.025, filterFreq:2400}); },
    close(){ tone({freq:680, freqEnd:300, type:'sine', duration:.12, gain:.07}); },
    success(){
      tone({freq:520, type:'sine', duration:.11, gain:.08});
      setTimeout(()=> tone({freq:780, type:'sine', duration:.18, gain:.09}), 90);
    },
    error(){ tone({freq:220, type:'sawtooth', duration:.16, gain:.05, filterFreq:900}); },
    portal(){
      noiseBurst({duration:.32, gain:.05, filterFreq:2000});
      tone({freq:240, freqEnd:920, type:'sine', duration:.32, gain:.08});
      [0,1,2].forEach(i=> setTimeout(()=> tone({freq:640 + i*230, type:'triangle', duration:.09, gain:.05, filterFreq:6500}), 130 + i*80));
    },
    isEnabled(){ return enabled; },
    setEnabled(v){
      enabled = v;
      try{ localStorage.setItem('kc_sound_enabled', JSON.stringify(v)); }catch(e){}
    }
  };
})();

/* ================================================================
   KISELEVY_CREO — ФОНОВАЯ МУЗЫКА
   ------------------------------------------------------------
   Играет реальный трек (assets/kiselevy-theme.mp3), а не
   сгенерированный звук. Логика та же, что и раньше: браузеры не
   разрешают запускать звук ДО первого клика/касания/нажатия
   клавиши на странице, поэтому воспроизведение стартует в этот
   момент (см. playIntroOnce ниже) и плавно нарастает по громкости.

   Файл сжат до 96 kbps (~2.5 МБ вместо исходных ~8.5 МБ), чтобы
   сайт быстро открывался в любой точке мира и не тратил лишний
   трафик. HTML-страница при этом остаётся лёгкой: аудио грузится
   отдельным файлом, а не встроено в код страницы.

   Чтобы заменить трек на другой — положите новый mp3 рядом с этим
   файлом (в папку assets) и поменяйте путь в TRACK_SRC ниже.
   ================================================================ */
const TRACK_SRC = 'assets/kiselevy-theme.mp3';
const TRACK_VOLUME = 0.32; // громкость фона, 0–1

const AmbientMusic = (() => {
  let audioEl = null, enabled = true, playing = false, fadeRaf = null;
  try{
    const saved = localStorage.getItem('kc_music_enabled');
    if(saved !== null) enabled = JSON.parse(saved);
  }catch(e){}

  function ensureAudio(){
    if(!audioEl){
      audioEl = new Audio(TRACK_SRC);
      audioEl.loop = true;
      audioEl.preload = 'auto';
      audioEl.volume = 0;
    }
    return audioEl;
  }

  function fadeTo(target, durationMs){
    const el = ensureAudio();
    if(fadeRaf) cancelAnimationFrame(fadeRaf);
    const start = el.volume;
    const t0 = performance.now();
    function step(now){
      const p = Math.min(1, (now - t0) / durationMs);
      el.volume = start + (target - start) * p;
      if(p < 1) fadeRaf = requestAnimationFrame(step);
    }
    fadeRaf = requestAnimationFrame(step);
  }

  function start(){
    if(!enabled || playing) return;
    const el = ensureAudio();
    el.volume = 0;
    const p = el.play();
    if(p && p.then){
      p.then(()=>{
        playing = true;
        fadeTo(TRACK_VOLUME, 3500);
      }).catch(()=>{ /* автозапуск ещё заблокирован, попробуем при следующем клике */ });
    }
  }
  function stopSmoothly(){
    if(!playing || !audioEl) return;
    fadeTo(0, 1000);
    setTimeout(()=>{
      if(audioEl){ audioEl.pause(); }
      playing = false;
    }, 1050);
  }

  return {
    isEnabled(){ return enabled; },
    isPlaying(){ return playing; },
    setEnabled(v){
      enabled = v;
      try{ localStorage.setItem('kc_music_enabled', JSON.stringify(v)); }catch(e){}
      if(v) start(); else stopSmoothly();
    },
    tryStart(){ if(enabled) start(); }
  };
})();

/* ================================================================
   KISELEVY_CREO — ДАННЫЕ САЙТА
   ------------------------------------------------------------
   Чтобы добавить новую работу — просто добавьте новый объект
   в массив WORKS ниже. Ничего больше менять не нужно, карточка
   появится в галерее автоматически.

   Поля:
   title       — название работы
   category    — одна из: 'video', 'design', 'brand', 'motion'
   description — короткое описание проекта
   image       — ссылка на картинку (если пусто — покажется
                 цветной плейсхолдер с иконкой категории)
   link        — (необязательно) ссылка на проект целиком
   ================================================================ */
/* ---------------- SCROLL REVEAL (наблюдатель создаётся здесь заранее,
   чтобы генерация галереи/страниц ниже уже могла им пользоваться) ---------------- */
const revealObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      if(e.target.classList.contains('section-head') || e.target.classList.contains('contact-box')){
        SoundFX.whoosh();
      }
      revealObserver.unobserve(e.target);
    }
  });
},{threshold:.15});

/* ---------------- СКРЫТИЕ ЭКРАНА ЗАГРУЗКИ ---------------- */
(function hideLoader(){
  const loader = document.getElementById('siteLoader');
  if(!loader) return;
  let done = false;
  function finish(){
    if(done) return;
    done = true;
    loader.classList.add('hide');
    setTimeout(()=>{ loader.remove(); }, 850);
  }
  if(document.readyState === 'complete'){
    setTimeout(finish, 500);
  } else {
    window.addEventListener('load', ()=> setTimeout(finish, 500));
  }
  setTimeout(finish, 2400); // защита: в любом случае не держим экран загрузки дольше
})();

/* ---------------- КИНЕТИЧЕСКИЙ ЗАГОЛОВОК HERO ---------------- */
(function kineticHeroTitle(){
  const h1 = document.querySelector('.hero h1');
  if(!h1) return;
  const nodes = Array.from(h1.childNodes);
  const frag = document.createDocumentFragment();
  let wordIndex = 0;
  nodes.forEach(node=>{
    if(node.nodeType === Node.TEXT_NODE){
      node.textContent.split(/(\s+)/).forEach(chunk=>{
        if(chunk.trim() === ''){ frag.appendChild(document.createTextNode(chunk)); return; }
        const span = document.createElement('span');
        span.className = 'kinetic-word';
        span.textContent = chunk;
        span.style.animationDelay = (wordIndex * 0.07) + 's';
        wordIndex++;
        frag.appendChild(span);
      });
    } else {
      node.classList.add('kinetic-word');
      node.style.animationDelay = (wordIndex * 0.07) + 's';
      wordIndex++;
      frag.appendChild(node);
    }
  });
  h1.innerHTML = '';
  h1.appendChild(frag);
})();

const CATEGORIES = {
  automation: {label:'Автоматизация', icon:'⚙', class:'ph-automation'},
  chatbot:    {label:'Чат-боты',      icon:'◔', class:'ph-chatbot'},
  ai:         {label:'AI-системы',    icon:'✦', class:'ph-ai'},
  production: {label:'Продюсирование', icon:'▶', class:'ph-production'},
  marketing:  {label:'Маркетинг',     icon:'↗', class:'ph-marketing'},
};

const WORKS = [
  {title:'Чат-бот для интернет-магазина', category:'chatbot', description:'Telegram-бот с каталогом, оплатой и уведомлениями о статусе заказа. Снял с менеджеров рутинные вопросы клиентов.', image:'', result:'−70% ручных ответов'},
  {title:'Автоматизация обработки заявок в CRM', category:'automation', description:'Связка формы сайта, CRM и мессенджеров через n8n: заявка автоматически создаёт сделку и уведомляет менеджера.', image:'', result:'−4 часа рутины в день'},
  {title:'AI-ассистент для подбора товаров', category:'ai', description:'Ассистент на базе GPT, который отвечает на вопросы о товарах и подбирает подходящие варианты по описанию клиента.', image:'', result:'+18% к конверсии'},
  {title:'Продюсирование рекламного ролика', category:'production', description:'Полный цикл: сценарий, съёмка, монтаж и цветокоррекция промо-ролика для запуска продукта.', image:'', result:'+2.1M просмотров'},
  {title:'Маркетинговая воронка для запуска продукта', category:'marketing', description:'Связка рекламы, лендинга и рассылок для запуска нового продукта — от первого клика до оплаты.', image:'', result:'+23% заявок за месяц'},
  {title:'Бот для записи клиентов в WhatsApp', category:'chatbot', description:'Автоматическая запись на услуги с напоминаниями и переносом через диалоговое меню, без участия администратора.', image:'', result:'−50% звонков админу'},
  {title:'Автоматизация email-рассылок', category:'automation', description:'Цепочки писем с триггерами по поведению пользователя: настроено один раз — работает без ручных отправок.', image:'', result:'+31% повторных продаж'},
  {title:'AI-система генерации контента', category:'ai', description:'Инструмент, который по брифу собирает черновики постов и подписей для соцсетей в фирменном тоне бренда.', image:'', result:'в 3 раза быстрее контент-план'},
  {title:'Съёмка и монтаж кейс-стади', category:'production', description:'Видео-кейс с клиентом: интервью, b-roll, монтаж и субтитры для использования в продажах.', image:'', result:'+15% к закрытию сделок'},
  {title:'Performance-реклама для мобильного приложения', category:'marketing', description:'Настройка и ведение рекламных кампаний с оптимизацией под стоимость установки и целевые действия.', image:'', result:'−27% цены установки'},
  {title:'Голосовой AI-ассистент поддержки', category:'ai', description:'Голосовой бот первой линии поддержки, который закрывает частые вопросы и передаёт сложные случаи оператору.', image:'', result:'−60% нагрузки на линию'},
  {title:'Автоворонка продаж через Telegram', category:'automation', description:'Полностью автоматизированная цепочка от подписки до оплаты внутри мессенджера, без ручного сопровождения.', image:'', result:'+40% продаж без менеджера'},
];

const SERVICES = [
  {icon:'⚙', title:'Автоматизация', text:'Настройка процессов и интеграций между сайтом, CRM и мессенджерами — без ручной рутины.'},
  {icon:'◔', title:'Чат-боты', text:'Боты для Telegram, WhatsApp и сайта: продажи, запись, поддержка, оплата.'},
  {icon:'✦', title:'AI-системы', text:'Внедрение AI-ассистентов и нейросетей в бизнес-процессы и коммуникацию с клиентами.'},
  {icon:'▶', title:'Продюсирование', text:'Съёмка и монтаж рекламных роликов, кейсов и контента для соцсетей.'},
  {icon:'↗', title:'Маркетинг', text:'Стратегии продвижения, воронки и performance-реклама, которые приводят клиентов.'},
];

const TESTIMONIALS = [
  {name:'Анна К.', role:'Владелица интернет-магазина', text:'Чат-бот забрал на себя 70% типовых вопросов — команда наконец занимается только сложными заказами.', initials:'АК'},
  {name:'Дмитрий С.', role:'Основатель сервиса услуг', text:'Автоматизация записи и напоминаний убрала половину звонков администратору. Результат виден сразу.', initials:'ДС'},
  {name:'Марина В.', role:'Маркетолог', text:'Воронка и реклама сработали сильнее, чем мы ожидали — заявки пошли уже в первую неделю запуска.', initials:'МВ'},
];

/* ================================================================
   АВТОМАТИЗАЦИЯ ФОРМЫ ОБРАТНОЙ СВЯЗИ
   ------------------------------------------------------------
   Сейчас форма ничего никуда не отправляет — только показывает
   сообщение об успехе. Чтобы заявки реально приходили вам
   (на почту, в Telegram, в Google Таблицу и т.д.), выберите один
   из вариантов:

   1) Formspree / Getform / Web3Forms — бесплатные сервисы приёма
      форм без своего сервера. Регистрируетесь, получаете URL вида
      https://formspree.io/f/xxxxxxx и вставляете его в переменную
      FORM_ENDPOINT ниже — форма заработает без единой строчки кода.

   2) Zapier / Make (Integromat) — создаёте сценарий "Webhook →
      Email/Telegram/Google Sheets", вставляете URL вебхука сюда же.

   3) Свой backend — если умеете программировать бэкенд, замените
      fetch ниже на запрос к своему API.
   ================================================================ */
const FORM_ENDPOINT = ''; // ← вставьте сюда URL формы/вебхука

/* ---------------- ГЕНЕРАЦИЯ КОНТЕНТА ---------------- */

// Marquee
const marqueeItems = ['Автоматизация','Чат-боты','AI-системы','Продюсирование','Маркетинг','No-code','Нейросети','Воронки продаж'];
const marqueeTrack = document.getElementById('marqueeTrack');
[...marqueeItems, ...marqueeItems].forEach(t=>{
  const s = document.createElement('span'); s.textContent = t; marqueeTrack.appendChild(s);
});

// Filters
function buildFilters(container, onSelect){
  container.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active'; allBtn.textContent = 'Все работы'; allBtn.dataset.filter = 'all';
  container.appendChild(allBtn);
  Object.entries(CATEGORIES).forEach(([key,val])=>{
    const b = document.createElement('button');
    b.className = 'filter-btn'; b.textContent = val.label; b.dataset.filter = key;
    container.appendChild(b);
  });
  container.addEventListener('click', e=>{
    const btn = e.target.closest('.filter-btn');
    if(!btn) return;
    SoundFX.tick();
    container.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    onSelect(btn.dataset.filter);
  });
}

function buildCard(w){
  const cat = CATEGORIES[w.category];
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-media ${w.image ? '' : cat.class}">
      ${w.image ? `<img src="${w.image}" alt="${w.title}" loading="lazy">` : `<span class="ph-icon">${cat.icon}</span>`}
      <div class="card-expand">⤢</div>
      ${w.result ? `<div class="card-result">📈 ${w.result}</div>` : ''}
    </div>
    <div class="card-body">
      <div class="card-tag">${cat.label}</div>
      <h3>${w.title}</h3>
      <p>${w.description}</p>
    </div>`;
  card.addEventListener('click', ()=> openLightbox(w));
  return card;
}

function renderWorksInto(container, filter='all', animate=true){
  container.innerHTML = '';
  WORKS.filter(w => filter==='all' || w.category===filter).forEach(w=>{
    container.appendChild(buildCard(w));
  });
  if(animate){
    container.querySelectorAll('.card').forEach((el,i)=>{
      el.style.transitionDelay = (i%6)*0.06 + 's';
      revealObserver.observe(el);
    });
  }
}

// Homepage teaser gallery
const filtersEl = document.getElementById('filters');
const galleryEl = document.getElementById('gallery');
function renderGallery(filter='all'){ renderWorksInto(galleryEl, filter); }
buildFilters(filtersEl, renderGallery);
renderGallery();

// Full Portfolio page gallery (opened from "Страницы" / mobile menu)
const portfolioPageFilters = document.getElementById('portfolioPageFilters');
const portfolioPageGrid = document.getElementById('portfolioPageGrid');
buildFilters(portfolioPageFilters, (f)=> renderWorksInto(portfolioPageGrid, f));
renderWorksInto(portfolioPageGrid, 'all');


// Services
const servicesGrid = document.getElementById('servicesGrid');
SERVICES.forEach(s=>{
  const el = document.createElement('div');
  el.className = 'service-card reveal';
  el.innerHTML = `<div class="service-icon">${s.icon}</div><h3>${s.title}</h3><p>${s.text}</p>`;
  servicesGrid.appendChild(el);
});

// Testimonials
const testiTrack = document.getElementById('testiTrack');
TESTIMONIALS.forEach(t=>{
  const el = document.createElement('div');
  el.className = 'testi-card reveal';
  el.innerHTML = `
    <div class="testi-stars">★★★★★</div>
    <p>"${t.text}"</p>
    <div class="testi-person">
      <div class="testi-avatar">${t.initials}</div>
      <div><b>${t.name}</b><span>${t.role}</span></div>
    </div>`;
  testiTrack.appendChild(el);
});

/* ---------------- КОСМИЧЕСКИЙ ФОН: частицы и высота слоя ---------------- */
const cosmicDots = document.getElementById('cosmicDots');
const cosmicField = document.getElementById('cosmicField');
function buildCosmicDots(){
  cosmicDots.innerHTML = '';
  const count = 34;
  for(let i=0;i<count;i++){
    const d = document.createElement('span');
    d.className = 'cosmic-dot';
    d.style.left = (Math.random()*100) + '%';
    d.style.top = (Math.random()*100) + '%';
    d.style.animationDelay = (Math.random()*4.5).toFixed(2) + 's';
    cosmicDots.appendChild(d);
  }
}
function fitCosmicField(){
  cosmicField.style.height = Math.max(document.body.scrollHeight, window.innerHeight) + 'px';
}
buildCosmicDots();
fitCosmicField();
window.addEventListener('load', fitCosmicField);
window.addEventListener('resize', fitCosmicField);
new ResizeObserver(fitCosmicField).observe(document.body);

/* ---------------- LIGHTBOX ---------------- */
const lightbox = document.getElementById('lightbox');
function openLightbox(w){
  SoundFX.open();
  const cat = CATEGORIES[w.category];
  document.getElementById('lightboxTag').textContent = cat.label;
  document.getElementById('lightboxTitle').textContent = w.title;
  document.getElementById('lightboxDesc').textContent = w.description;
  const resultEl = document.getElementById('lightboxResult');
  resultEl.innerHTML = w.result ? `📈 Результат: <b>${w.result}</b>` : '';
  resultEl.style.display = w.result ? 'flex' : 'none';
  const media = document.getElementById('lightboxMedia');
  if(w.image){
    media.innerHTML = `<img src="${w.image}" style="width:100%;height:100%;object-fit:cover;">`;
    media.className = 'lightbox-media';
  } else {
    media.innerHTML = `<span>${cat.icon}</span>`;
    media.className = `lightbox-media ${cat.class}`;
  }
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  SoundFX.close();
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e=>{ if(e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e=>{ if(e.key === 'Escape') closeLightbox(); });

/* ---------------- HEADER SCROLL STATE ---------------- */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', ()=>{
  header.classList.toggle('scrolled', window.scrollY > 20);
});

/* ---------------- MOBILE MENU ---------------- */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', ()=>{
  SoundFX.tick();
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{
  SoundFX.click();
  burger.classList.remove('open'); mobileMenu.classList.remove('open');
}));

document.querySelectorAll('.nav-links a, .logo').forEach(a=>{
  a.addEventListener('click', ()=> SoundFX.click());
});

/* ================================================================
   ДОПОЛНИТЕЛЬНЫЕ СТРАНИЦЫ: dropdown «Страницы», мобильные пункты,
   полноэкранные страницы «Портфолио» и «Календарь»
   ================================================================ */
function openPage(id){
  const el = document.getElementById(id);
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
  SoundFX.portal();
}
function closePage(id){
  const el = document.getElementById(id);
  el.classList.remove('open');
  document.body.style.overflow = '';
  SoundFX.close();
}
document.querySelectorAll('.page-close').forEach(btn=>{
  btn.addEventListener('click', ()=> closePage(btn.dataset.close));
});
document.addEventListener('keydown', e=>{
  if(e.key === 'Escape'){
    document.querySelectorAll('.page-overlay.open').forEach(p=> closePage(p.id));
  }
});

// Единая маршрутизация для пунктов "Страницы" (десктоп-дропдаун и мобильное меню)
function handlePageNav(key){
  burger.classList.remove('open'); mobileMenu.classList.remove('open');
  if(key === 'about' || key === 'work' || key === 'faq'){
    SoundFX.click();
    document.getElementById(key).scrollIntoView({behavior:'smooth'});
  } else if(key === 'task-page'){
    SoundFX.click();
    document.getElementById('tasks').scrollIntoView({behavior:'smooth'});
  } else if(key === 'portfolio-page'){
    openPage('portfolioPage');
  } else if(key === 'calendar-page'){
    openPage('calendarPage');
  } else if(key === 'assistant'){
    SoundFX.click();
    openChat();
  }
}
document.querySelectorAll('.mobile-page-link').forEach(btn=>{
  btn.addEventListener('click', ()=> handlePageNav(btn.dataset.nav));
});

/* ---------------- КАЛЕНДАРЬ / ЗАПИСЬ НА СОЗВОН ----------------
   Полностью работает на клиенте: даты — ближайшие 14 дней,
   время — фиксированный набор слотов. Для реальной проверки
   занятости слотов подключите Google Calendar/Calendly через
   тот же принцип, что и FORM_ENDPOINT — вебхук, который вернёт
   доступные слоты и запишет бронирование. */
const WEEKDAYS_SHORT = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
const TIME_SLOTS = ['10:00','11:30','13:00','15:00','16:30','18:00'];
let selectedDay = null, selectedTime = null;

function buildCalendar(){
  const daysEl = document.getElementById('calDays');
  const timesEl = document.getElementById('calTimes');
  daysEl.innerHTML = ''; timesEl.innerHTML = '';
  const today = new Date();
  for(let i=0;i<14;i++){
    const d = new Date(today); d.setDate(today.getDate()+i);
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'cal-day';
    btn.innerHTML = `<span class="wd">${WEEKDAYS_SHORT[d.getDay()]}</span><span class="dd">${d.getDate()}</span>`;
    btn.addEventListener('click', ()=>{
      SoundFX.tick();
      daysEl.querySelectorAll('.cal-day').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      selectedDay = d.toLocaleDateString('ru-RU', {day:'numeric', month:'long', weekday:'long'});
    });
    daysEl.appendChild(btn);
  }
  TIME_SLOTS.forEach(t=>{
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'cal-time'; btn.textContent = t;
    btn.addEventListener('click', ()=>{
      SoundFX.tick();
      timesEl.querySelectorAll('.cal-time').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      selectedTime = t;
    });
    timesEl.appendChild(btn);
  });
}
buildCalendar();

const calForm = document.getElementById('calForm');
calForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('calName').value.trim();
  const contact = document.getElementById('calContact').value.trim();
  if(!selectedDay || !selectedTime){
    SoundFX.error();
    alert('Пожалуйста, выберите день и время перед подтверждением.');
    return;
  }
  if(FORM_ENDPOINT){
    try{
      await fetch(FORM_ENDPOINT, {
        method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify({ source:'calendar_booking', name, contact, day:selectedDay, time:selectedTime })
      });
    }catch(err){}
  } else {
    console.info('Kiselevy_creo: запись поймана локально. Подключите FORM_ENDPOINT, чтобы бронирования приходили вам.');
  }
  SoundFX.success();
  calForm.style.display = 'none';
  const successEl = document.getElementById('calSuccess');
  successEl.style.display = 'flex';
  successEl.innerHTML = `✅ Готово! Записал вас на ${selectedDay}, ${selectedTime}. Подтверждение придёт в Telegram/на почту.`;
});

/* ---------------- СЛАЙДЕР ДО/ПОСЛЕ ---------------- */
(function initCompareSlider(){
  const widget = document.getElementById('compareWidget');
  if(!widget) return;
  const after = document.getElementById('compareAfter');
  const handle = document.getElementById('compareHandle');
  let dragging = false;

  function setPos(pct){
    pct = Math.min(96, Math.max(4, pct));
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = pct + '%';
  }
  function posFromClientX(clientX){
    const rect = widget.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }
  widget.addEventListener('pointerdown', e=>{
    dragging = true;
    setPos(posFromClientX(e.clientX));
    widget.setPointerCapture(e.pointerId);
  });
  widget.addEventListener('pointermove', e=>{ if(dragging) setPos(posFromClientX(e.clientX)); });
  widget.addEventListener('pointerup', ()=>{ if(dragging){ dragging = false; SoundFX.tick(); } });
  widget.addEventListener('pointerleave', ()=>{ dragging = false; });
  setPos(50);
})();

/* ---------------- ФОНОВАЯ МУЗЫКА: кнопка-переключатель ---------------- */
const musicToggle = document.getElementById('musicToggle');
function updateMusicToggleUI(){
  const on = AmbientMusic.isEnabled();
  musicToggle.textContent = on ? '🎵' : '🔈';
  musicToggle.classList.toggle('playing', AmbientMusic.isPlaying());
  musicToggle.setAttribute('aria-pressed', String(on));
  musicToggle.setAttribute('aria-label', on ? 'Выключить фоновую музыку' : 'Включить фоновую музыку');
}
updateMusicToggleUI();
musicToggle.addEventListener('click', ()=>{
  const next = !AmbientMusic.isEnabled();
  AmbientMusic.setEnabled(next);
  updateMusicToggleUI();
  SoundFX.click();
  setTimeout(updateMusicToggleUI, 200);
});

/* ---------------- ТЁМНАЯ КОСМИЧЕСКАЯ ТЕМА ---------------- */
const themeToggle = document.getElementById('themeToggle');
function getSavedTheme(){
  try{ return localStorage.getItem('kc_theme'); }catch(e){ return null; }
}
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную космическую тему');
  try{ localStorage.setItem('kc_theme', theme); }catch(e){}
}
applyTheme(getSavedTheme() === 'dark' ? 'dark' : 'light');
themeToggle.addEventListener('click', ()=>{
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  SoundFX.portal();
});

/* ---------------- SOUND TOGGLE ---------------- */
const soundToggle = document.getElementById('soundToggle');
function updateSoundToggleUI(){
  const on = SoundFX.isEnabled();
  soundToggle.textContent = on ? '🔊' : '🔇';
  soundToggle.setAttribute('aria-pressed', String(on));
  soundToggle.setAttribute('aria-label', on ? 'Выключить звуковые эффекты' : 'Включить звуковые эффекты');
}
updateSoundToggleUI();
soundToggle.addEventListener('click', ()=>{
  const next = !SoundFX.isEnabled();
  SoundFX.setEnabled(next);
  updateSoundToggleUI();
  if(next) SoundFX.click();
});

/* ---------------- SCROLL REVEAL: наблюдатель уже создан выше ---------------- */
document.querySelectorAll('.reveal').forEach(el=> revealObserver.observe(el));

/* ---------------- COUNTER ANIMATION ---------------- */
const counters = document.querySelectorAll('.stat b');
const counterObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el = entry.target;
      const target = +el.dataset.count;
      let cur = 0;
      const step = Math.max(1, Math.round(target/40));
      const tick = ()=>{
        cur += step;
        if(cur >= target){ el.textContent = target; return; }
        el.textContent = cur;
        requestAnimationFrame(tick);
      };
      tick();
      counterObserver.unobserve(el);
    }
  });
},{threshold:.5});
counters.forEach(c=> counterObserver.observe(c));

/* ---------------- МАГНИТНЫЕ КНОПКИ В HERO ---------------- */
document.querySelectorAll('.hero-actions .btn').forEach(btn=>{
  btn.addEventListener('mousemove', e=>{
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
  });
  btn.addEventListener('mouseleave', ()=>{ btn.style.transform = ''; });
});

/* ---------------- ЛЁГКИЙ 3D-НАКЛОН КАРТОЧЕК ПОД КУРСОР ---------------- */
function enableTilt(selector, strength){
  document.querySelectorAll(selector).forEach(card=>{
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('mousemove', e=>{
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${-py * strength}deg) rotateY(${px * strength}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform = ''; });
  });
}
enableTilt('.service-card', 7);
enableTilt('.founder-card', 6);
enableTilt('.testi-card', 5);

/* ---------------- OPS DASHBOARD: живые кольца, бары и счётчик ---------------- */
const opsDashboard = document.getElementById('opsDashboard');
if(opsDashboard){
  const opsObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      // кольца
      document.querySelectorAll('.ops-ring-fg').forEach(ring=>{
        const value = parseFloat(ring.dataset.value);
        const circumference = 326.7;
        const offset = circumference * (1 - value / 100);
        requestAnimationFrame(()=>{ ring.style.strokeDashoffset = offset; });
        const label = document.getElementById(ring.id + 'Val');
        if(label){
          let cur = 0;
          const step = Math.max(0.5, value / 40);
          const tick = ()=>{
            cur += step;
            if(cur >= value){ label.textContent = value + '%'; return; }
            label.textContent = cur.toFixed(1) + '%';
            requestAnimationFrame(tick);
          };
          tick();
        }
      });
      // бары
      document.querySelectorAll('.ops-bar-fill').forEach(bar=>{
        requestAnimationFrame(()=>{ bar.style.width = bar.dataset.value + '%'; });
      });
      // счётчик автоматизированных процессов
      const opsCounter = document.getElementById('opsCounter');
      if(opsCounter){
        const target = 240 + Math.floor(Math.random() * 12);
        let cur = 0;
        const step = Math.max(2, Math.round(target / 45));
        const tick = ()=>{
          cur += step;
          if(cur >= target){ opsCounter.textContent = target; return; }
          opsCounter.textContent = cur;
          requestAnimationFrame(tick);
        };
        tick();
      }
      opsObserver.unobserve(opsDashboard);
    });
  }, {threshold:.35});
  opsObserver.observe(opsDashboard);
}

/* ---------------- CONTACT FORM ---------------- */
const contactForm = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');
contactForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm).entries());

  if(!FORM_ENDPOINT){
    formMsg.textContent = 'Форма настроена локально: подключите FORM_ENDPOINT в коде, чтобы заявки приходили вам (см. комментарий).';
    formMsg.className = 'form-msg err';
    SoundFX.error();
    return;
  }

  formMsg.textContent = 'Отправляю...';
  formMsg.className = 'form-msg';
  try{
    const res = await fetch(FORM_ENDPOINT, {
      method:'POST',
      headers:{'Content-Type':'application/json', 'Accept':'application/json'},
      body: JSON.stringify(data)
    });
    if(res.ok){
      formMsg.textContent = 'Спасибо! Заявка отправлена, отвечу в течение суток.';
      formMsg.className = 'form-msg ok';
      SoundFX.success();
      contactForm.reset();
    } else {
      throw new Error('bad response');
    }
  }catch(err){
    formMsg.textContent = 'Не получилось отправить. Попробуйте написать напрямую в Telegram или на почту.';
    formMsg.className = 'form-msg err';
    SoundFX.error();
  }
});

/* ---------------- TO TOP ---------------- */
document.getElementById('toTop').addEventListener('click', ()=>{ SoundFX.tick(); window.scrollTo({top:0, behavior:'smooth'}); });

/* ---------------- ПРИВЕТСТВЕННЫЙ ЗВУК + ФОНОВАЯ МУЗЫКА ----------------
   Браузеры блокируют звук до первого действия пользователя,
   поэтому лёгкий "звук открытия сайта" и фоновый эмбиент
   запускаются одновременно при первом клике/касании/нажатии
   клавиши на странице — это самый ранний момент, когда это
   технически разрешено. */
function playIntroOnce(){
  SoundFX.whoosh();
  AmbientMusic.tryStart();
  setTimeout(updateMusicToggleUI, 200);
  document.removeEventListener('pointerdown', playIntroOnce);
  document.removeEventListener('keydown', playIntroOnce);
}
document.addEventListener('pointerdown', playIntroOnce, {once:true});
document.addEventListener('keydown', playIntroOnce, {once:true});

/* ================================================================
   KISELEVY_CREO — ЖИВОЙ ЧАТ ("НЕЙРО-ПРОДАВЕЦ")
   ------------------------------------------------------------
   Как это работает сейчас:
   Бот отвечает по базе знаний ниже (KNOWLEDGE_BASE) — ищет
   ключевые слова в вопросе клиента и подбирает подходящий ответ
   с призывом к действию. Работает мгновенно, без интернета и
   без каких-либо ключей API.

   Чтобы бот отвечал через настоящую нейросеть (GPT/Claude и т.п.):
   1) Никогда не вставляйте API-ключ прямо в этот файл — он будет
      виден всем посетителям сайта.
   2) Создайте промежуточный webhook (например, сценарий в n8n/
      Make: "Webhook → запрос к модели → ответ") и вставьте его
      адрес в переменную AI_ENDPOINT ниже.
   3) Чат сам начнёт слать туда сообщения и показывать ответ
      нейросети вместо локального сценария — база знаний ниже
      останется резервным вариантом, если запрос не удался.

   Как редактировать ответы бота:
   Добавляйте/меняйте объекты в массиве KNOWLEDGE_BASE — поле
   keywords ищется по вхождению в сообщении клиента, reply — это
   то, что ответит бот (можно несколько вариантов через массив —
   бот выберет случайный, чтобы не звучать заученно).
   ================================================================ */
const AI_ENDPOINT = ''; // ← сюда вставить адрес вебхука для настоящей нейросети (необязательно)

const KNOWLEDGE_BASE = [
  { id:'greeting', keywords:['привет','здравств','добрый день','добрый вечер','ку','хай'],
    reply:['Здравствуйте! Я консультант Kiselevy_creo. Расскажите, что нужно: автоматизация, чат-бот, AI-система, продюсирование или маркетинг, и я подскажу, как это решить.'],
    quick:['Автоматизация','Чат-боты','AI-системы','Продюсирование','Маркетинг'] },

  { id:'automation', keywords:['автоматизац','crm','воронк','интеграц','n8n','zapier','make','рутин'],
    reply:['Мы настраиваем автоматизацию процессов: связку сайта, CRM и мессенджеров, автоворонки и триггерные рассылки без ручной рутины. Обычно решение окупается за пару недель за счёт сэкономленного времени команды.'],
    quick:['Сколько стоит?','Покажите примеры','Оставить заявку'] },

  { id:'chatbot', keywords:['бот','чат-бот','telegram','телеграм','whatsapp','ватсап'],
    reply:['Мы делаем чат-ботов для Telegram, WhatsApp и сайта: продажи, запись на услуги, поддержка 24/7, приём оплаты. Бот берёт на себя типовые вопросы, а ваша команда занимается только сложными случаями.'],
    quick:['Сколько стоит?','Покажите примеры','Оставить заявку'] },

  { id:'ai', keywords:['ai','ии','искусственный интеллект','нейросет','ассистент','gpt'],
    reply:['Мы внедряем AI-ассистентов: от голосовых ботов поддержки до инструментов генерации контента и подбора товаров по описанию клиента. Модель обучается на материалах вашего бизнеса и отвечает по существу, а не общими фразами.'],
    quick:['Сколько стоит?','Покажите примеры','Оставить заявку'] },

  { id:'production', keywords:['продюс','съемк','съёмк','видео','монтаж','ролик'],
    reply:['Мы продюсируем видео полного цикла: сценарий, съёмка, монтаж, цветокоррекция. Делаем рекламные ролики, кейсы и контент для соцсетей.'],
    quick:['Сколько стоит?','Покажите примеры','Оставить заявку'] },

  { id:'marketing', keywords:['маркетинг','реклама','продвижен','smm','таргет','воронк продаж'],
    reply:['Мы строим маркетинг на цифрах: воронки, performance-реклама, стратегии продвижения. Важен измеримый результат, а не просто красивый охват.'],
    quick:['Сколько стоит?','Покажите примеры','Оставить заявку'] },

  { id:'why_us', keywords:['почему вы','чем вы отличаетесь','зачем вы нужны','сам справлюсь','почему не сам','в чём разница'],
    reply:['Честно: многое можно сделать и самому. Разница в том, что мы уже прошли это на десятках проектов и не тратим ваше время на пробы и ошибки. Артур сам пишет код и настраивает системы, Кети сама ведёт маркетинг и продюсирование. Никаких посредников между вашей задачей и результатом.'],
    quick:['Покажите примеры','Сколько стоит?','Оставить заявку'] },

  { id:'trust', keywords:['гаранти','а если не сработает','как понять что сработает','отзыв','надёжно','доверя'],
    reply:['Понимаю сомнение, это нормально перед стартом любого проекта. Мы начинаем с малого понятного этапа с чёткой целью, смотрим на результат и только потом масштабируем. Отзывы клиентов есть чуть выше на этой странице.'],
    quick:['Покажите примеры','Оставить заявку'] },

  { id:'timeline', keywords:['сколько по срокам','как быстро','когда готово','срок','сколько займёт','сколько времени'],
    reply:['Простой чат-бот или автоматизация одного процесса обычно занимает от нескольких дней до двух недель. Комплексные проекты с интеграциями идут дольше, но точный срок скажу после короткого разговора о задаче.'],
    quick:['Оставить заявку','Сколько стоит?'] },

  { id:'price', keywords:['цена','стоимост','сколько стоит','бюджет','прайс'],
    reply:['Стоимость зависит от задачи: простой чат-бот и комплексная автоматизация с интеграциями сильно отличаются по объёму работы. Расскажите пару деталей в форме ниже, и я пришлю конкретную вилку цен под ваш случай.'],
    quick:['Оставить заявку','Покажите примеры'] },

  { id:'objection_price', keywords:['дорого','дороговато','подешевле','нет бюджета','не готов столько платить'],
    reply:['Понимаю. Не обязательно стартовать с большого проекта: можно начать с одной конкретной задачи, например бота или одной автоматизации, увидеть результат и уже потом решать про расширение. Так риск для вас минимальный.'],
    quick:['Оставить заявку','Покажите примеры'] },

  { id:'portfolio', keywords:['пример','кейс','портфолио','работы','что делали'],
    reply:['Примеры проектов есть в разделе "Избранные проекты" чуть выше: чат-боты, автоворонки, AI-ассистенты, продюсирование и маркетинговые кампании. Откройте любую карточку, там описание и результат в цифрах.'],
    quick:['Автоматизация','Чат-боты','Оставить заявку'] },

  { id:'contact', keywords:['связат','созвон','встреч','заявк','контакт','написать'],
    reply:['Отлично! Оставьте, пожалуйста, имя и удобный способ связи, и я отвечу в течение суток.'],
    quick:[], lead:true },

  { id:'off_topic', keywords:['погода','анекдот','гороскоп','футбол','политик','как дела','кто ты по знаку','сколько тебе лет'],
    reply:['Я здесь, чтобы помочь с автоматизацией, чат-ботами, AI, продюсированием и маркетингом для вашего бизнеса. Расскажите, какая задача у вас сейчас, и я подскажу решение.'],
    quick:['Автоматизация','Чат-боты','AI-системы','Продюсирование','Маркетинг'] },
];

const FALLBACK_REPLIES = [
  'Уточните, пожалуйста: вопрос про автоматизацию, чат-ботов, AI, продюсирование или маркетинг?',
  'Не совсем уловил вопрос. Могу рассказать про автоматизацию процессов, ботов, AI-системы, продюсирование видео или маркетинг. Что вам ближе?',
];

function normalize(text){
  return text.toLowerCase().replace(/[.,!?;:()"']/g, ' ').replace(/\s+/g,' ').trim();
}

function classifyLocal(userText){
  const norm = normalize(userText);
  let best = null, bestScore = 0;
  KNOWLEDGE_BASE.forEach(item=>{
    let score = 0;
    item.keywords.forEach(k=>{ if(norm.includes(k)) score++; });
    if(score > bestScore){ bestScore = score; best = item; }
  });
  if(best){
    const replies = Array.isArray(best.reply) ? best.reply : [best.reply];
    return { text: replies[Math.floor(Math.random()*replies.length)], quick: best.quick || [], lead: !!best.lead };
  }
  return { text: FALLBACK_REPLIES[Math.floor(Math.random()*FALLBACK_REPLIES.length)], quick:['Автоматизация','Чат-боты','AI-системы','Продюсирование','Маркетинг'], lead:false };
}

async function getBotReply(userText){
  if(AI_ENDPOINT){
    try{
      const res = await fetch(AI_ENDPOINT, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message:userText })
      });
      if(res.ok){
        const data = await res.json();
        if(data && data.reply) return { text:data.reply, quick:data.quick || [], lead:!!data.lead };
      }
    }catch(e){ /* тихо переходим на локальный сценарий */ }
  }
  return classifyLocal(userText);
}


<!-- ================= ЧАТ-ВИДЖЕТ ================= -->
<div class="chat-widget" id="chatWidget">
  <button class="chat-toggle" id="chatToggle" aria-label="Чат">💬</button>
  <div class="chat-panel" id="chatPanel">
    <div class="chat-header">
      <span>🤖 KISELEVY CREO Assistant</span>
      <button class="chat-close" id="chatClose">✕</button>
    </div>
    <div class="chat-messages" id="chatMessages" style="flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px;">
      <div class="chat-msg bot"><p data-i18n="chat_welcome">Привет! Я помощник KISELEVY CREO. Чем могу помочь?</p></div>
    </div>
    <form class="chat-input-area" id="chatForm" style="display:flex; gap:8px; padding:10px 14px; border-top:1px solid var(--line);">
      <input type="text" id="chatInput" class="chat-input" data-i18n-placeholder="chat_placeholder" placeholder="Напишите сообщение..." style="flex:1; border:1px solid var(--line); border-radius:var(--radius-sm); padding:8px 12px; font:inherit; font-size:14px; background:var(--cream); color:var(--ink);">
      <button type="submit" class="btn btn-primary" style="padding:8px 16px; font-size:14px; border-radius:var(--radius-sm);" data-i18n="chat_btn">Отправить</button>
    </form>
  </div>
</div>


<script>
/* ==============================================
   FAQ — accordion
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
});

/* ==============================================
   Chat widget
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('chatToggle');
  const panel = document.getElementById('chatPanel');
  const close = document.getElementById('chatClose');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');

  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
  });
  if (close) {
    close.addEventListener('click', (e) => {
      e.preventDefault();
      panel.classList.remove('open');
    });
  }
  
  // Закрытие при клике вне панели
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') &&
        !panel.contains(e.target) &&
        !toggle.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
  
  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      panel.classList.remove('open');
    }
  });
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      // Add user message
      const userMsg = document.createElement('div');
      userMsg.className = 'chat-msg user';
      userMsg.innerHTML = '<p>' + text.replace(/</g,'&lt;') + '</p>';
      messages.appendChild(userMsg);
      input.value = '';
      messages.scrollTop = messages.scrollHeight;

      // Send to bot
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-msg bot';
      botMsg.innerHTML = '<p>⏳</p>';
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;

      try {
        const resp = await fetch('https://api.telegram.org/bot8809949759:AAF1j1PUXs1IPS6TEcQ4chxVZWz5KyL5Eak/sendMessage', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            chat_id: '199790247',
            text: `💬 Чат с сайта:\n\n${text}`
          })
        });
        botMsg.innerHTML = '<p>✅ Сообщение отправлено! Мы ответим в ближайшее время.</p>';
      } catch(err) {
        botMsg.innerHTML = '<p>❌ Ошибка отправки. Попробуйте позже.</p>';
      }
      messages.scrollTop = messages.scrollHeight;
    });
  }
});

/* ==============================================
   Task form
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('taskInput');
  const taskBtn = document.querySelector('.task-submit');
  const taskSuccess = document.getElementById('taskSuccess');

  if (!taskBtn || !taskForm) return;

  taskBtn.addEventListener('click', async () => {
    const text = taskForm.value.trim();
    if (!text) return;

    try {
      await fetch('https://api.telegram.org/bot8809949759:AAF1j1PUXs1IPS6TEcQ4chxVZWz5KyL5Eak/sendMessage', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          chat_id: '199790247',
          text: `📋 Новая задача с сайта:\n\n${text}`
        })
      });
      taskSuccess.textContent = '✅ Задача отправлена! Мы свяжемся с вами.';
      taskSuccess.style.display = 'block';
      taskForm.value = '';
    } catch(err) {
      taskSuccess.textContent = '❌ Ошибка. Попробуйте позже.';
      taskSuccess.style.display = 'block';
    }
  });

  // Also handle Enter key
  taskForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      taskBtn.click();
    }
  });
});

/* ==============================================
   INTERACTIVE HERO — mouse orbs
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  const orbs = hero.querySelectorAll('.cosmic-orb');
  if (orbs.length === 0) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const centerX = x - 0.5;
    const centerY = y - 0.5;
    
    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 15;
      const moveX = centerX * factor;
      const moveY = centerY * factor * 0.6;
      const scale = 1 + (0.5 - Math.abs(centerX)) * 0.15;
      orb.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
    });
  });

  hero.addEventListener('mouseleave', () => {
    orbs.forEach(orb => {
      orb.style.transform = 'translate(0, 0) scale(1)';
    });

    trust_heading: 'TRUSTED BY',
    trust_ai: 'AI Projects',
    trust_bots: 'Chatbots',
    trust_automation: 'Automation',
    trust_dev: 'Web Development',
    trust_marketing: 'Marketing',
    trust_production: 'Production',
    how_title: 'How We Work',
    how_subtitle: 'From idea to ready product — 4 simple steps',
    how_step1_title: 'Request & Brief',
    how_step1_desc: 'Describe your task — we clarify details and timeline',
    how_step2_title: 'Planning',
    how_step2_desc: 'Architecture, design, technology selection',
    how_step3_title: 'Development',
    how_step3_desc: 'Building the product with stage-by-stage previews',
    how_step4_title: 'Launch & Support',
    how_step4_desc: 'Deployment, testing, ongoing maintenance',
  });
});

/* ==============================================
   ANIMATED STATISTICS
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Animate ring percentage counters
  const ringVals = document.querySelectorAll('[id$="Val"]');
  const ringCircles = document.querySelectorAll('.ops-ring-fg');
  const barFills = document.querySelectorAll('.ops-bar-fill');

  function animateCounters() {
    // Rings
    ringVals.forEach((el, i) => {
      const circle = ringCircles[i];
      const target = parseFloat(circle?.dataset.value || 0);
      const radius = 52;
      const circumference = 2 * Math.PI * radius;
      if (circle) {
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference;
      }
      let current = 0;
      const step = target / 60;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = Math.round(current) + '%';
        if (circle) {
          const offset = circumference - (current / 100) * circumference;
          circle.style.strokeDashoffset = offset;
        }
      }, 25);
    });

    // Bars
    barFills.forEach(bar => {
      const target = parseFloat(bar.dataset.value || 0);
      let current = 0;
      const step = target / 30;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        bar.style.width = current + '%';
      }, 30);
    });
  }

  // Trigger when visible
  const opsSection = document.querySelector('.ops-section, .ops-grid');
  if (opsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(opsSection);
  } else {
    // Fallback: animate after delay
    setTimeout(animateCounters, 1000);
  }
});

/* ==============================================
   PORTFOLIO — filters + cards
   ============================================== */
const projects = [
  // ⬇️ ТУТ ТЫ ДОБАВЛЯЕШЬ СВОИ ПРОЕКТЫ ⬇️
  // Формат добавления в боте:
  // /addproject название | категория | описание | ссылка | ссылка_на_фото
  // Категории: site, bot, ai, marketing, design
  
  // Примеры (замени на свои!)
  {
    id: 'proj-1',
    title_ru: 'Чат-бот для доставки',
    title_en: 'Delivery Chatbot',
    category: 'bot',
    desc_ru: 'Автоматический бот для приёма заказов с интеграцией в Telegram и CRM',
    desc_en: 'Automatic order bot with Telegram and CRM integration',
    image: '',
    link: 'https://t.me/your_bot',
    link_label_ru: 'Посмотреть бота →',
    link_label_en: 'View bot →',
  },
  {
    id: 'proj-2',
    title_ru: 'Сайт для студии йоги',
    title_en: 'Yoga Studio Website',
    category: 'site',
    desc_ru: 'Одностраничный сайт с записью на занятия, интеграцией календаря',
    desc_en: 'Single-page site with booking and calendar integration',
    image: '',
    link: '#',
    link_label_ru: 'Смотреть сайт →',
    link_label_en: 'View site →',
  },
  {
    id: 'proj-3',
    title_ru: 'AI-помощник для маркетинга',
    title_en: 'AI Marketing Assistant',
    category: 'ai',
    desc_ru: 'Нейросеть для генерации контента, анализа аудитории и авто-постинга',
    desc_en: 'Neural network for content generation, audience analysis, auto-posting',
    image: '',
    link: '#',
    link_label_ru: 'Узнать больше →',
    link_label_en: 'Learn more →',
  },
];

// Try to load additional projects from localStorage (added via bot)
function loadProjects() {
  try {
    const stored = localStorage.getItem('kc_projects');
    if (stored) {
      const extra = JSON.parse(stored);
      return [...projects, ...extra];
    }
  } catch(e) {}
  return [...projects];
}

function renderPortfolio(filter = 'all') {
  const grid = document.getElementById('portfolioGrid');
  const empty = document.getElementById('portfolioEmpty');
  const allProjects = loadProjects();
  
  const filtered = filter === 'all' ? allProjects : allProjects.filter(p => p.category === filter);
  
  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  
  grid.innerHTML = filtered.map(p => {
    const title = t ? (currentLang === 'en' ? (p.title_en || p.title_ru) : p.title_ru) : p.title_ru;
    const desc = t ? (currentLang === 'en' ? (p.desc_en || p.desc_ru) : p.desc_ru) : p.desc_ru;
    const linkLabel = t ? (currentLang === 'en' ? (p.link_label_en || p.link_label_ru) : p.link_label_ru) : p.link_label_ru;
    
    const imgHtml = p.image 
      ? `<img class="portfolio-card-img" src="${p.image}" alt="${title}" loading="lazy">`
      : `<div class="portfolio-card-img" style="display:flex;align-items:center;justify-content:center;font-size:48px;color:var(--ink-soft);background:var(--ice);">${title[0]}</div>`;
    
    const categoryLabels = {site:'Сайт', bot:'Бот', ai:'AI', marketing:'Маркетинг', design:'Дизайн'};
    
    return `
      <div class="portfolio-card" data-category="${p.category}">
        <a href="${p.link}" target="_blank" rel="noopener">
          ${imgHtml}
        </a>
        <div class="portfolio-card-body">
          <span class="portfolio-card-tag">${categoryLabels[p.category] || p.category}</span>
          <h3>${title}</h3>
          <p>${desc}</p>
          <a href="${p.link}" target="_blank" rel="noopener" class="portfolio-card-link">${linkLabel}</a>
        </div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  // Init portfolio
  renderPortfolio();
  
  // Filter buttons
  const filters = document.querySelectorAll('.portfolio-filter');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPortfolio(btn.dataset.filter);
    });
  });
  
  // If language changes, re-render
  if (typeof applyLang === 'function') {
    const origApply = applyLang;
    applyLang = function() {
      origApply.apply(this, arguments);
      renderPortfolio(document.querySelector('.portfolio-filter.active')?.dataset?.filter || 'all');
    };
  }
  
  // Check if bot added new projects (poll every 30s)
  setInterval(() => {
    const activeFilter = document.querySelector('.portfolio-filter.active');
    renderPortfolio(activeFilter?.dataset?.filter || 'all');
  }, 30000);
});

/* ==============================================
   AUTO-UPDATE portfolio from GitHub
   ============================================== */
async function syncProjectsFromServer() {
  try {
    // Try to load projects.json from the current domain
    const resp = await fetch('/projects.json');
    if (!resp.ok) throw new Error('Not found');
    const serverProjects = await resp.json();
    if (!Array.isArray(serverProjects) || serverProjects.length === 0) return;
    
    // Merge with local
    const existing = JSON.parse(localStorage.getItem('kc_projects') || '[]');
    const merged = [...existing];
    for (const sp of serverProjects) {
      if (!merged.find(p => p.id === sp.id)) {
        merged.push(sp);
      }
    }
    localStorage.setItem('kc_projects', JSON.stringify(merged));
    
    // Re-render if portfolio is visible
    if (typeof renderPortfolio === 'function') {
      const activeFilter = document.querySelector('.portfolio-filter.active');
      renderPortfolio(activeFilter ? activeFilter.dataset.filter : 'all');
    }
  } catch(e) {
    // projects.json not available yet — that's fine
    console.log('KC: projects.json sync skipped (will work after Cloudflare deploy)');
  }
}

// Sync when page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(syncProjectsFromServer, 2000);
});

