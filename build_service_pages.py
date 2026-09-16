#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Генератор посадочных страниц услуг KISELEVY CREO.
Берёт _service_page_template.html и подставляет контент из SERVICES.
Запуск: python3 build_service_pages.py
"""
import json
import re
import pathlib

BASE = pathlib.Path(__file__).parent
TEMPLATE = (BASE / '_service_page_template.html').read_text(encoding='utf-8')

CARD = """      <div class="card">
        <h3>{title}</h3>
        <div class="price">{price}</div>
        <p>{desc}</p>
        <ul>{points}</ul>
        {pain}
      </div>"""

STEP = """      <div class="step">
        <div class="step-num">{num}</div>
        <div class="step-body">
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      </div>"""

FAQ = """      <div class="faq-item">
        <div class="faq-q">{q}</div>
        <div class="faq-a">{a}</div>
      </div>"""


def cards(items):
    out = []
    for it in items:
        points = ''.join(f'<li>{p}</li>' for p in it.get('points', []))
        pain = f'<div class="pain">{it["pain"]}</div>' if it.get('pain') else ''
        out.append(CARD.format(
            title=it['title'], price=it.get('price', ''),
            desc=it['desc'], points=points, pain=pain,
        ))
    return '\n'.join(out)


def steps(items):
    return '\n'.join(
        STEP.format(num=i + 1, title=s['title'], text=s['text'])
        for i, s in enumerate(items)
    )


def faq(items):
    return '\n'.join(FAQ.format(q=f['q'], a=f['a']) for f in items)


OTHER = {
    'bots': ('/razrabotka-telegram-botov.html', 'Разработка Telegram-ботов'),
    'sites': ('/sozdanie-saytov.html', 'Сайты и лендинги'),
    'neuro': ('/neyropomoshchniki.html', 'Нейропомощники и ИИ-ассистенты'),
    'auto': ('/avtomatizaciya-biznesa.html', 'Автоматизация бизнеса'),
}


def other_links(slug):
    items = [
        f'<a href="{url}">{label}</a>'
        for key, (url, label) in OTHER.items()
        if key != slug
    ]
    items.append('<a href="/uslugi.html">Все услуги и цены</a>')
    return '\n        '.join(items)


def jsonld(page):
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": page['jsonld_name'],
        "serviceType": page['jsonld_name'],
        "description": page['desc'],
        "url": f"https://kiselevycreo.ru/{page['slug']}.html",
        "areaServed": {"@type": "Country", "name": "Россия"},
        "availableChannel": {
            "@type": "ServiceChannel",
            "serviceUrl": "https://kiselevycreo.ru",
            "servicePhone": "+7-928-432-12-76",
        },
        "provider": {
            "@type": "ProfessionalService",
            "@id": "https://kiselevycreo.ru/#organization",
            "name": "KISELEVY CREO",
            "url": "https://kiselevycreo.ru/",
            "founder": [
                {"@type": "Person", "name": "Артур Киселёв"},
                {"@type": "Person", "name": "Кети Киселёва"},
            ],
        },
        "offers": [
            {
                "@type": "Offer",
                "name": o['title'],
                "price": o['price_value'],
                "priceCurrency": "RUB",
            }
            for o in page['offers']
        ],
        "mainEntity": [
            {
                "@type": "Question",
                "name": f['q'],
                "acceptedAnswer": {"@type": "Answer", "text": f['a']},
            }
            for f in page['faq']
        ],
    }, ensure_ascii=False, indent=2)


def render(page):
    html = TEMPLATE
    repl = {
        '__TITLE__': page['title'],
        '__DESC__': page['desc'],
        '__KEYWORDS__': page['keywords'],
        '__SLUG__': page['slug'],
        '__H1__': page['h1'],
        '__HERO_SUB__': page['hero_sub'],
        '__WHY_H2__': page['why_h2'],
        '__WHY_LEAD__': page['why_lead'],
        '__WHY_CARDS__': cards(page['why_cards']),
        '__SERVICES_H2__': page['services_h2'],
        '__SERVICES_LEAD__': page['services_lead'],
        '__SERVICE_CARDS__': cards(page['service_cards']),
        '__STEPS_H2__': page['steps_h2'],
        '__STEPS_LEAD__': page['steps_lead'],
        '__STEPS__': steps(page['steps']),
        '__FAQ_H2__': page['faq_h2'],
        '__FAQ__': faq(page['faq']),
        '__CTA_H2__': page['cta_h2'],
        '__CTA_TEXT__': page['cta_text'],
        '__OTHER_LINKS__': other_links(page['slug']),
        '__JSONLD__': jsonld(page),
    }
    for k, v in repl.items():
        html = html.replace(k, v)
    left = re.findall(r'__[A-Z_]+__', html)
    if left:
        raise SystemExit(f'Остались незаполненные плейсхолдеры: {set(left)}')
    return html


SERVICES = json.loads((BASE / '_services_content.json').read_text(encoding='utf-8'))

for p in SERVICES:
    out = BASE / f"{p['slug']}.html"
    out.write_text(render(p), encoding='utf-8')
    print(f"OK {out.name}")
print(f"сгенерировано страниц: {len(SERVICES)}")
