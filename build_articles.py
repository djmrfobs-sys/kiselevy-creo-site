#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генератор страниц статей (блога) KISELEVY CREO.
Читает _articles_content.json и рендерит HTML в стиле сайта.

Использование:
    python3 build_articles.py            # собрать все статьи + индекс
    python3 build_articles.py --check    # только проверить, что нет плейсхолдеров

Добавить статью:
    1. Скопировать блок в _articles_content.json (см. _articles_content.json)
    2. python3 build_articles.py
    3. Добавить URL в sitemap.xml и ссылку в blog.html (генерируется автоматически)
"""
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(BASE, "_article_template.html")
CONTENT = os.path.join(BASE, "_articles_content.json")

CSS = """
  :root{
    --bg:#0a0a0b;--panel:#151210;--panel-border:#2e2521;
    --lilac-pale:#f0e9dc;--lavender:#e8ddcb;--amethyst:#c4a3a6;
    --lavender-dim:#2b211f;--text:#ede7dd;--text-dim:#b7a99b;--ink:#171310;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    font-family:'Inter','Segoe UI',Roboto,Arial,sans-serif;
    background:radial-gradient(ellipse 1400px 900px at 50% -8%,rgba(184,154,156,0.05) 0%,transparent 65%),var(--bg);
    color:var(--text);line-height:1.7;
  }
  a{color:inherit;text-decoration:none}
  .container{max-width:820px;margin:0 auto;padding:0 24px}
  header{position:sticky;top:0;z-index:10;background:rgba(10,10,12,0.88);backdrop-filter:blur(6px);border-bottom:1px solid var(--panel-border)}
  header .container{display:flex;align-items:center;justify-content:space-between;padding-top:16px;padding-bottom:16px;max-width:1000px}
  .logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.1rem;letter-spacing:0.5px;color:var(--amethyst)}
  nav a{margin-left:22px;font-size:0.92rem;opacity:0.8}
  nav a:hover{opacity:1;color:var(--amethyst)}
  @media (max-width:760px){nav a{margin-left:14px;font-size:0.84rem}nav a.hide-sm{display:none}}

  .back-row{padding-top:26px}
  .back-link{
    display:inline-flex;align-items:center;gap:8px;
    font-size:0.88rem;color:var(--text-dim);
    border:1px solid var(--panel-border);border-radius:999px;
    padding:8px 18px;transition:border-color 0.18s ease,color 0.18s ease;
  }
  .back-link:hover{border-color:var(--amethyst);color:var(--amethyst)}
  .article-head{padding:30px 0 8px}
  .eyebrow{display:block;font-size:0.78rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--amethyst);margin-bottom:14px}
  h1{font-family:'Space Grotesk',sans-serif;font-size:2.2rem;line-height:1.16;color:var(--lilac-pale);margin-bottom:16px}
  .meta{font-size:0.86rem;color:var(--text-dim);margin-bottom:26px}
  .lead{font-size:1.08rem;color:var(--lavender);border-left:3px solid var(--amethyst);padding-left:18px;margin-bottom:34px}

  article h2{font-family:'Space Grotesk',sans-serif;font-size:1.5rem;line-height:1.2;color:var(--lilac-pale);margin:38px 0 14px}
  article h3{font-family:'Space Grotesk',sans-serif;font-size:1.12rem;color:var(--lilac-pale);margin:26px 0 10px}
  article p{margin-bottom:16px;color:var(--text)}
  article ul,article ol{margin:0 0 18px 22px;color:var(--text)}
  article li{margin-bottom:8px}
  article strong{color:var(--lilac-pale)}
  article a{color:var(--amethyst);border-bottom:1px solid rgba(196,163,166,0.35)}
  article a:hover{border-bottom-color:var(--amethyst)}
  .note{background:var(--lavender-dim);border-left:3px solid var(--amethyst);border-radius:10px;padding:16px 20px;font-size:0.94rem;color:var(--lavender);margin:22px 0}
  table{width:100%;border-collapse:collapse;margin:20px 0;font-size:0.92rem}
  th,td{border:1px solid var(--panel-border);padding:10px 12px;text-align:left}
  th{background:var(--panel);color:var(--lilac-pale);font-family:'Space Grotesk',sans-serif}

  .final-cta{background:linear-gradient(180deg,rgba(196,163,166,0.07),rgba(196,163,166,0.02));border:1px solid var(--panel-border);border-radius:20px;padding:38px 30px;text-align:center;margin:44px 0 10px}
  .final-cta h2{margin:0 0 12px}
  .final-cta p{color:var(--text-dim);max-width:560px;margin:0 auto 24px}
  .btn{display:inline-block;background:var(--amethyst);color:var(--ink);font-weight:700;font-size:1rem;padding:15px 32px;border-radius:999px;box-shadow:0 8px 26px rgba(196,163,166,0.22);transition:transform 0.15s ease}
  .btn:hover{transform:translateY(-2px)}
  .btn-outline{background:transparent;color:var(--lavender);border:1px solid var(--panel-border);box-shadow:none;margin-left:12px}
  .btn-outline:hover{border-color:var(--amethyst);color:var(--amethyst)}

  .related{margin:40px 0 20px}
  .related h2{font-size:1.2rem}
  .related ul{margin-left:20px}

  footer{border-top:1px solid var(--panel-border);padding:34px 0;text-align:center;color:var(--text-dim);font-size:0.86rem;margin-top:40px}
  footer p{margin-bottom:8px}
  footer a:hover{color:var(--amethyst)}
"""


def render_article(a):
    """Собирает HTML одной статьи."""
    jsonld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                "headline": a["h1"],
                "description": a["desc"],
                "datePublished": a["date"],
                "dateModified": a["date"],
                "inLanguage": "ru-RU",
                "author": {
                    "@type": "Person",
                    "name": "Артур Киселёв",
                    "jobTitle": "Основатель KISELEVY CREO",
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "KISELEVY CREO",
                    "url": "https://kiselevycreo.ru/",
                },
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": f"https://kiselevycreo.ru/{a['slug']}.html",
                },
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": f["q"],
                        "acceptedAnswer": {"@type": "Answer", "text": f["a_plain"]},
                    }
                    for f in a.get("faq", [])
                ],
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Главная", "item": "https://kiselevycreo.ru/"},
                    {"@type": "ListItem", "position": 2, "name": "Статьи", "item": "https://kiselevycreo.ru/blog.html"},
                    {"@type": "ListItem", "position": 3, "name": a["h1"], "item": f"https://kiselevycreo.ru/{a['slug']}.html"},
                ],
            },
        ],
    }

    faq_html = "\n".join(
        f'    <div class="faq-item"><h3>{f["q"]}</h3><p>{f["a"]}</p></div>' for f in a.get("faq", [])
    )
    related_html = "\n".join(
        f'      <li><a href="/{r["slug"]}.html">{r["title"]}</a></li>' for r in a.get("related", [])
    )

    html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{a['title']}</title>
<meta name="description" content="{a['desc']}">
<meta name="keywords" content="{a['keywords']}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Артур Киселёв">
<link rel="canonical" href="https://kiselevycreo.ru/{a['slug']}.html">
<meta property="og:title" content="{a['title']}">
<meta property="og:description" content="{a['desc']}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://kiselevycreo.ru/{a['slug']}.html">
<meta property="og:site_name" content="KISELEVY CREO">
<meta property="og:locale" content="ru_RU">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<style>{CSS}</style>
</head>
<body>

<header>
  <div class="container">
    <a class="logo" href="/">KISELEVY&nbsp;CREO</a>
    <nav>
      <a href="/uslugi.html">Услуги</a>
      <a href="/blog.html">Статьи</a>
      <a href="/portfolio.html" class="hide-sm">Портфолио</a>
      <a href="/#contacts" class="hide-sm">Контакты</a>
      <a href="https://t.me/Kiselevy_Creo_digital" target="_blank" rel="noopener" class="nav-tg hide-sm">Канал</a>
    </nav>
  </div>
</header>

<div class="container back-row">
  <a class="back-link" href="/blog.html">&#8592; Все статьи</a>
</div>

<div class="container article-head">
  <span class="eyebrow">Статьи · KISELEVY CREO</span>
  <h1>{a['h1']}</h1>
  <p class="meta">Автор: Артур Киселёв · {a['date_human']} · {a['read_min']} мин чтения</p>
  <p class="lead">{a['lead']}</p>
</div>

<div class="container">
  <article>
{a['body']}

    <div class="final-cta">
      <h2>{a['cta_h2']}</h2>
      <p>{a['cta_text']}</p>
      <div>
        <a class="btn" href="https://t.me/Site_Kiselevy_Creo_bot" target="_blank" rel="noopener">Написать в Telegram</a>
        <a class="btn btn-outline" href="/oprosnik.html">Пройти опрос - 3 минуты</a>
      </div>
    </div>

    <h2>Частые вопросы</h2>
{faq_html}
  </article>

  <div class="related">
    <h2>Читайте также</h2>
    <ul>
{related_html}
      <li><a href="/{a['service_slug']}.html">{a['service_title']}</a></li>
    </ul>
  </div>
</div>

<footer>
  <div class="container">
    <p><a href="/">На главную</a> &nbsp;·&nbsp; <a href="/blog.html">Все статьи</a> &nbsp;·&nbsp; <a href="/uslugi.html">Услуги и цены</a></p>
    <p><a href="/privacy.html">Политика обработки персональных данных</a></p>
    <p>© KISELEVY CREO, 2026</p>
  </div>
</footer>

<script type="application/ld+json">
{json.dumps(jsonld, ensure_ascii=False, indent=2)}
</script>

</body>
</html>
"""
    return html


def build_blog_index(articles):
    """Собирает blog.html - список статей."""
    items = "\n".join(
        f"""      <a class="post" href="/{a['slug']}.html">
        <h3>{a['h1']}</h3>
        <p>{a['desc']}</p>
        <span class="post-meta">{a['date_human']} · {a['read_min']} мин чтения</span>
      </a>"""
        for a in articles
    )
    jsonld = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Статьи KISELEVY CREO",
            "url": "https://kiselevycreo.ru/blog.html",
            "inLanguage": "ru-RU",
            "publisher": {"@type": "Organization", "name": "KISELEVY CREO"},
        },
        ensure_ascii=False,
        indent=2,
    )
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Статьи о ботах, сайтах и автоматизации | KISELEVY CREO</title>
<meta name="description" content="Практические статьи: сколько стоит Telegram-бот, зачем бизнесу нейропомощник, как автоматизировать заявки и рутину. Без воды, с ценами и примерами.">
<meta name="keywords" content="статьи про автоматизацию бизнеса, телеграм бот для бизнеса, нейропомощник, разработка сайтов, сколько стоит бот">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="https://kiselevycreo.ru/blog.html">
<meta property="og:title" content="Статьи о ботах, сайтах и автоматизации | KISELEVY CREO">
<meta property="og:description" content="Практические статьи с ценами и примерами: боты, сайты, нейропомощники, автоматизация.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://kiselevycreo.ru/blog.html">
<meta property="og:site_name" content="KISELEVY CREO">
<meta property="og:locale" content="ru_RU">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<style>{CSS}
  .hero-blog{{padding:70px 0 10px;text-align:center}}
  .hero-blog h1{{font-family:'Space Grotesk',sans-serif;font-size:2.4rem;color:var(--lilac-pale);margin-bottom:16px}}
  .hero-blog p{{color:var(--text-dim);max-width:620px;margin:0 auto}}
  .posts{{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;padding:40px 0 20px}}
  .post{{display:block;background:var(--panel);border:1px solid var(--panel-border);border-radius:16px;padding:26px;transition:border-color 0.18s ease,transform 0.18s ease}}
  .post:hover{{border-color:var(--amethyst);transform:translateY(-3px)}}
  .post h3{{font-family:'Space Grotesk',sans-serif;font-size:1.1rem;color:var(--lilac-pale);margin-bottom:10px}}
  .post:hover h3{{color:var(--amethyst)}}
  .post p{{font-size:0.92rem;color:var(--text-dim);margin-bottom:14px}}
  .post-meta{{font-size:0.82rem;color:var(--text-dim);opacity:0.8}}
</style>
</head>
<body>

<header>
  <div class="container" style="max-width:1000px">
    <a class="logo" href="/">KISELEVY&nbsp;CREO</a>
    <nav>
      <a href="/uslugi.html">Услуги</a>
      <a href="/blog.html">Статьи</a>
      <a href="/portfolio.html" class="hide-sm">Портфолио</a>
      <a href="/#contacts" class="hide-sm">Контакты</a>
      <a href="https://t.me/Kiselevy_Creo_digital" target="_blank" rel="noopener" class="nav-tg hide-sm">Канал</a>
    </nav>
  </div>
</header>

<div class="container hero-blog">
  <span class="eyebrow">KISELEVY CREO · блог</span>
  <h1>Статьи о цифровых инструментах для бизнеса</h1>
  <p>Без воды: сколько что стоит, что реально работает, чего не делать. Пишу из практики.</p>
</div>

<div class="container">
  <div class="posts">
{items}
  </div>
</div>

<footer>
  <div class="container">
    <p><a href="/">На главную</a> &nbsp;·&nbsp; <a href="/uslugi.html">Услуги и цены</a> &nbsp;·&nbsp; <a href="/portfolio.html">Портфолио</a></p>
    <p><a href="/privacy.html">Политика обработки персональных данных</a></p>
    <p>© KISELEVY CREO, 2026</p>
  </div>
</footer>

<script type="application/ld+json">
{jsonld}
</script>

</body>
</html>
"""


def main():
    check_only = "--check" in sys.argv

    if not os.path.exists(CONTENT):
        sys.exit(f"Нет файла контента: {CONTENT}")

    with open(CONTENT, encoding="utf-8") as f:
        data = json.load(f)

    articles = data["articles"]
    print(f"Статей в контенте: {len(articles)}")

    slugs = set()
    generated = []
    for a in articles:
        if a["slug"] in slugs:
            sys.exit(f"ДУБЛЬ slug: {a['slug']}")
        slugs.add(a["slug"])
        html = render_article(a)
        leftovers = re.findall(r"__[A-Z_]+__", html)
        if leftovers:
            sys.exit(f"{a['slug']}: не заменены плейсхолдеры {set(leftovers)}")
        if check_only:
            print(f"  ok {a['slug']}.html")
            continue
        out = os.path.join(BASE, f"{a['slug']}.html")
        with open(out, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  записан {a['slug']}.html ({len(html)} байт)")
        generated.append(a)

    if not check_only:
        blog = build_blog_index(articles)
        with open(os.path.join(BASE, "blog.html"), "w", encoding="utf-8") as f:
            f.write(blog)
        print(f"  записан blog.html ({len(blog)} байт)")

    print("Готово.")


if __name__ == "__main__":
    main()
