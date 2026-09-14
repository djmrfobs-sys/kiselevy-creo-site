# -*- coding: utf-8 -*-
"""Генерация uslugi.html (полный каталог услуг, RU/EN/SR) из index.html."""
import re, json

src = 'index.html'
html = open(src, encoding='utf-8').read()
tr = json.load(open('/tmp/tr.json', encoding='utf-8'))
en, sr = tr['en'], tr['sr']

# ---------- полезные извлекатели ----------
def grab_section(html, start_tag, end_tag, start_n=0):
    """Возвращает HTML от начала start_tag (n-го) до конца парного end_tag (по закрытию)."""
    s = html.index(start_tag, start_n)
    # если end_tag - односложный закрывающий тег вида '<...>' - ищем по match
    return s

# 1. Вернём диапазон секции <section class="services" ...> ... </section>
s_start = html.index('<section class="services"')
# ищем парный </section> для внешн. <section class="services">
sec_level = 0
i = s_start
services_html = None
while i < len(html):
    if html.startswith('<section', i):
        sec_level += 1
        i += 8
    elif html.startswith('</section>', i):
        sec_level -= 1
        if sec_level == 0:
            s_end = i + len('</section>')
            services_html = html[s_start:s_end]
            break
        i += 10
    else:
        i += 1
assert services_html and services_html.startswith('<section class="services"'), "services sect not found"
print("services section len:", len(services_html))

# 2. Вернём header/nav-блок и style
i_style_start = html.index('<style>')
i_style_end = html.index('</style>') + len('</style>')
style_block = html[i_style_start:i_style_end]
i_head_start = html.index('<head>')

# 3. Вытащим из index's <head> title? Свой title положим. Возьмём стили + fonts & meta verif не трогаем.
# Вытащим space-grotesk link. Найдём <link rel="preconnect"...> и fonts css
def re_after(pattern):
    m = re.search(pattern, html)
    return m.group(0) if m else ''

fonts_block = ''
m_head = re.search(r'(<link rel="preconnect"[^>]*>\s*<link rel="preconnect"[^>]*>\s*<link href="https://fonts\.googleapis\.com[^>]*>)', html)
if m_head:
    fonts_block = m_head.group(1)

# аналитика gtag + метрика в head index
# 4. Соберём nav-разметку из index (до </nav>), но переделаем под активную Услуги + укажем ссылки во все разделы главной.
nav_start = html.index('<header>')
nav_end = html.index('</header>') + len('</header>')
header_block = html[nav_start:nav_end]

# ---------- Сборка ----------
def js_dict_block(pref):
    keys = sorted(k for k in en if k.startswith(('svc.','neuro.','combo.','services.','price.','nav.','cta.','contacts.','footer.','chat.sub')) or k in ('about.h2','about.lead'))
    lines = []
    for k in keys:
        v = tr[pref].get(k)
        if v is None:
            continue
        v = v.replace('\\','\\\\').replace('`','\\`')
        lines.append(f"      '{k}': `{v}`,")
    return "\n".join(lines)

# Набор доп. ключей (не-сервисных) которые будем рисовать вручную:
extra_ru = {
 'nav.services':'Услуги','price.from':'от','price.permo':'/мес',
 'services.h2':'Наши <span class="accent">услуги</span>',
 'services.intro':'Полный каталог: боты, нейропомощники, сайты, каналы, контент, маркетинг и готовые решения. Цены - в описании, финальную стоимость считаем под ваш проект.',
 'group.bots':'Боты и агенты','group.sites':'Сайты и лендинги','group.channels':'Telegram-каналы',
 'group.marketing':'Маркетинг','group.content':'Контент','group.combo':'Готовые решения',
 'sec.lead':'Все услуги'
}

# Соберём страницу: формируем словарь src-переводов (осн. en + sr полный из них), но RU в html.
# Возьмём переводы для отображаемых ключей из tr (en/sr уже дают). RU берём из HTML-якоря.

# Для простоты: соберём JS "translations" с en & sr (все нужные), а RU по умолчанию в разметке.
transl_js = "const translations = {\n  en: {\n" + js_dict_block('en') + "\n  },\n  sr: {\n" + js_dict_block('sr') + "\n  }\n};"

out = []
out.append('<!DOCTYPE html>')
out.append('<html lang="ru">')
out.append('<head>')
out.append('<meta charset="UTF-8">')
out.append('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
out.append('<title>Услуги и цены | KISELEVY CREO</title>')
out.append('<meta name="description" content="Полный каталог услуг KISELEVY CREO: боты, нейропомощники, сайты, лендинги, Telegram-каналы, контент, маркетинг и готовые решения под ключ. Цены и состав в описаниях.">')
out.append('<link rel="canonical" href="https://kiselevycreo.ru/uslugi.html">')
out.append('<meta property="og:title" content="Услуги и цены | KISELEVY CREO">')
out.append('<meta property="og:description" content="Полный каталог услуг и цен digital-бутика KISELEVY CREO.">')
out.append('<meta property="og:type" content="website">')
out.append('<meta property="og:url" content="https://kiselevycreo.ru/uslugi.html">')
out.append(fonts_block)
out.append('<style>')
# вытащить весь CSS из index (style_block содержит <style>...</style>). Впишем его же целиком
out.append(style_block.replace('</style>','').replace('<style>',''))
out.append('</style>')
out.append('</head>')
out.append('<body>')

# --- NAV (как в index, но со ссылками на главную) ---
out.append('''
<header>
  <div class="container">
    <a class="logo" href="/" style="text-decoration:none">KISELEVY&nbsp;CREO</a>
    <nav>
      <a href="#" data-i18n="nav.services">Услуги</a>
      <a href="/" data-i18n="nav.portfolio">Портфолио</a>
      <a href="/#about" data-i18n="nav.about">О нас</a>
      <a href="/#contacts" data-i18n="nav.contacts">Контакты</a>
      <span class="lang-switch">
        <button class="lang-btn" data-lang="ru" onclick="setLang('ru')">RU</button>
        <button class="lang-btn" data-lang="en" onclick="setLang('en')">EN</button>
        <button class="lang-btn" data-lang="sr" onclick="setLang('sr')">SR</button>
      </span>
    </nav>
  </div>
</header>
''')

# --- СЕКЦИЯ УСЛУГ (полная, переносим из index, но меняем заголовок-интро через data key услуг) ---
# Берём services_html целиком - в нём RU контент + data-i18n. Зададим заголовок секции.
services_html = services_html.replace('<h2 data-i18n-html="services.h2">', '<h2 data-i18n-html="services.h2">')
out.append(services_html)

# --- Контакты + футер (компактно, якорная ссылка) ---
out.append('''
<section class="contacts" id="contacts">
  <div class="container">
    <h2 data-i18n-html="contacts.h2">Свяжитесь с <span class="accent">нами</span></h2>
    <p data-i18n="contacts.text">Не нашли нужную услугу? Напишите нам - соберём решение под вашу задачу.</p>
    <div class="contact-buttons">
      <a class="btn" href="https://t.me/KISELEVY_CREO" target="_blank" rel="noopener" data-i18n="contacts.btn">Написать в Telegram</a>
      <a class="btn btn-outline" href="tel:+79284321276" rel="noopener">📞 +7-928-432-12-76</a>
      <a class="btn btn-outline" href="mailto:kiselevy.creo@gmail.com">✉️ kiselevy.creo@gmail.com</a>
      <a class="btn btn-outline" href="https://t.me/Kiselevy_Creo_digital" target="_blank" rel="noopener" data-i18n="contacts.channel">Подписаться на канал</a>
    </div>
  </div>
</section>

<footer>
  <div class="container">
    <p><a class="footer-link" href="/" data-i18n="nav.home">На главную</a></p>
    <p><a class="footer-link" href="https://t.me/Kiselevy_Creo_digital" target="_blank" rel="noopener">KISELEVY CREO в Telegram</a></p>
    <p><a class="footer-link" href="privacy.html" data-i18n="footer.privacy">Политика обработки персональных данных</a></p>
    <p>© KISELEVY CREO, 2026</p>
  </div>
</footer>
''')

out.append('<button class="scroll-top-btn" id="scrollTopBtn" onclick="scrollToTop()" aria-label="Наверх">↑</button>')

# --- Скрипты: i18n (копия из index, объект translations :: заменён) + scroll top ---
out.append('<script>')
out.append(transl_js)
out.append('''
  const I18N_ORIGINALS = [];
  function initI18n(){
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      I18N_ORIGINALS.push({el:el, key: el.getAttribute('data-i18n'), kind:'text', original: el.textContent});
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function(el){
      I18N_ORIGINALS.push({el:el, key: el.getAttribute('data-i18n-html'), kind:'html', original: el.innerHTML});
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
      I18N_ORIGINALS.push({el:el, key: el.getAttribute('data-i18n-placeholder'), kind:'placeholder', original: el.getAttribute('placeholder')});
    });
  }
  function setLang(lang){
    document.querySelectorAll('.lang-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.lang===lang); });
    I18N_ORIGINALS.forEach(function(entry){
      const dict = translations[lang];
      const val = (lang==='ru' || !dict || !dict[entry.key]) ? entry.original : dict[entry.key];
      if(entry.kind==='text') entry.el.textContent = val;
      else if(entry.kind==='html') entry.el.innerHTML = val;
      else if(entry.kind==='placeholder') entry.el.setAttribute('placeholder', val);
    });
    document.querySelectorAll('[data-rub]').forEach(function(el){
      if(lang==='ru') el.textContent = el.dataset.rub;
      else if(lang==='en') el.textContent = el.dataset.eurEn;
      else if(lang==='sr') el.textContent = el.dataset.eurSr;
    });
    document.documentElement.lang = lang;
    try{ localStorage.setItem('site_lang', lang); }catch(e){}
  }
  document.addEventListener('DOMContentLoaded', function(){
    initI18n();
    let saved='ru'; try{ saved = localStorage.getItem('site_lang')||'ru'; }catch(e){}
    setLang(saved);
  });

  function scrollToTop(){ window.scrollTo({top:0,behavior:'smooth'}); }
  (function(){
    const btn=document.getElementById('scrollTopBtn');
    function t(){ if(btn) btn.classList.toggle('visible', window.scrollY>400); }
    window.addEventListener('scroll', t, {passive:true}); t();
  })();
''')
out.append('</script>')
out.append('</body></html>')

open('uslugi.html','w',encoding='utf-8').write('\n'.join(out))
print("uslugi.html написан", __import__('os').path.getsize('uslugi.html'), "байт")
