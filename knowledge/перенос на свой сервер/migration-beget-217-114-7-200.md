# Перенос kiselevycreo.ru с Vercel на выделенный сервер (2026-09-04)

## Причина
152-ФЗ, локализация персональных данных на территории РФ (ч.5 ст.18, с 01.07.2025).
Vercel/Vercel Blob - серверы не в РФ.

## Новый сервер
- Провайдер: Beget Cloud, сервер называется "Expert Oleg"
- IP: 217.114.7.200, Ubuntu 26.04, 2 CPU / 4GB RAM / 40GB NVMe
- SSH: root, ключ агента ~/.ssh/kiselevycreo_217_114_7_200 (добавлен в authorized_keys)
- Код: /var/www/kiselevycreo/ (server.js - Express, api/, public/, data/, uploads/, .env)
- Сервис: systemd kiselevycreo-web.service (слушает 127.0.0.1:4300), автозапуск/автоперезапуск
- nginx: /etc/nginx/sites-available/kiselevycreo.ru, reverse proxy на 4300, SSL certbot (Let's Encrypt, автопродление)
- Отдельный сервер от общего "Vivacious Ori" (5.35.84.175, тот же хост что и песочница агента) - разделили специально, см. диалог 2026-09-04.

## Архитектура до/после
Было: Vercel serverless functions (api/*.js) + @vercel/blob для хранения (testimonials/portfolio/leads/visits + загруженные фото).
Стало: обычный Express-сервер (server.js монтирует все api/*.js как роуты), хранилище - локальные JSON-файлы в data/ и фото в uploads/ (api/_lib/store.js переписан под fs, сигнатуры функций не менялись, остальной код api/ не трогали).

## Секреты (в /var/www/kiselevycreo/.env на новом сервере)
- DEEPSEEK_API_KEY, LEAD_TELEGRAM_CHAT_ID, SITE_BOT_TOKEN - перенесены как есть (вытащены через `vercel env pull`)
- ADMIN_USERNAME=fobs (как было), ADMIN_PASSWORD - сгенерирован новый (Vercel не отдаёт Sensitive-значения через API/CLI), отправлен Артуру в чат один раз
- ADMIN_SESSION_SECRET, TELEGRAM_WEBHOOK_SECRET, PORTFOLIO_BOT_TOKEN - сгенерированы новые (Vercel их тоже не отдаёт, они внутренние - не страшно перевыпустить)

## Синхронизировано с VPS 23.88.127.11 (бот @Site_Kiselevy_Creo_bot)
- /root/kiselevy_creo_bot/site_projects_bot.py: SITE_API_BASE и SITE_URL переключены с kiselevycreositecurrent.vercel.app на https://kiselevycreo.ru
- PORTFOLIO_BOT_TOKEN обновлён в vault (/root/workspace/fobs_projects/security/vault.py, set_secret)
- site-projects-bot.service перезапущен, полный цикл (POST+DELETE портфолио) проверен - работает

## DNS (Рег.ру, аккаунт stargalaxy45@yandex.ru)
A-записи kiselevycreo.ru и www.kiselevycreo.ru -> 217.114.7.200 (Артур сам прописал, у агента нет доступа к Рег.ру).

## Что сделано при cutover 2026-09-04
1. SSL certbot --nginx -d kiselevycreo.ru -d www.kiselevycreo.ru - успешно
2. Вебхук Telegram нейропомощника (api/setup-webhook) переключён на https://kiselevycreo.ru/api/group-reply
3. Бот-загрузчик портфолио на VPS 23.88.127.11 переключён и проверен
4. privacy.html - убрано упоминание Vercel/Supabase, добавлено "собственный сервер на территории РФ"
5. Vercel-проект kiselevy_creo_site_current НЕ удалён (просто больше не обслуживает домен) - можно снести отдельным шагом, если Артур попросит

## Следующий проект (по договорённости с Артуром)
Тем же способом перенести ludmilaskinbody.ru - сейчас крутится на Hetzner VPS 23.88.127.11 (Falkenstein, Германия, не РФ) через ludmila-web.service + ludmila-bot.service. Нужно решить: тот же сервер 217.114.7.200 (места и ресурсов достаточно) или отдельный - не обсуждали ещё.
