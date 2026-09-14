#!/usr/bin/env bash
# Ночная проверка сайта kiselevycreo.ru на ошибки
# Проверяет: доступность, скорость, битые внутренние/внешние ссылки, title страниц
SITE="https://kiselevycreo.ru"
WORK="/tmp/kc_check_$(date +%s)"
mkdir -p "$WORK"
LOG="$WORK/report.txt"
echo "=== ПРОВЕРКА САЙТА kiselevycreo.ru ===" | tee "$LOG"
echo "Время запуска: $(date -u '+%Y-%m-%d %H:%M UTC')" | tee -a "$LOG"
echo "" | tee -a "$LOG"

echo "--- 1. Доступность главной и ключевых страниц ---" | tee -a "$LOG"
check_page() {
  local url="$1"
  local code time size
  code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 30 "$url")
  time=$(curl -s -o /dev/null -w "%{time_total}" -L --max-time 30 "$url")
  size=$(curl -s -L --max-time 30 "$url" | wc -c)
  printf "  %-45s HTTP=%s время=%.2fs размер=%sB\n" "$url" "$code" "$time" "$size" | tee -a "$LOG"
  # запоминаем битые
  if [ "$code" != "200" ]; then echo "  !!! ПРОБЛЕМА: $url вернул $code" | tee -a "$LOG"; fi
}

check_page "$SITE/"
check_page "$SITE/privacy.html"
check_page "$SITE/admin/login.html"
echo "" | tee -a "$LOG"

echo "--- 2. Внешние ссылки-партнёры из главной ---" | tee -a "$LOG"
for ext in "https://bagovskaia-boho.ru" "https://ludmilaskinbody.ru" "https://t.me/KISELEVY_CREO"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 25 "$ext")
  printf "  %-40s HTTP=%s\n" "$ext" "$code" | tee -a "$LOG"
done
echo "" | tee -a "$LOG"

echo "--- 3. Поиск JS/CSS, которые не загружаются ---" | tee -a "$LOG"
# качаем главную и проверяем все локальные ассеты
curl -s -L --max-time 30 "$SITE/" -o "$WORK/home.html"
assets=$(grep -oE '(src|href)="[^"]*\.(js|css)[^"]*"' "$WORK/home.html" | sed -E 's/(src|href)="//;s/"//')
if [ -z "$assets" ]; then
  echo "  Ассетов js/css в HTML не найдено (возможно грузятся скриптом)" | tee -a "$LOG"
else
  echo "$assets" | sort -u | while read -r a; do
    # делаем абсолютный url
    case "$a" in
      http*) u="$a";;
      /*) u="$SITE$a";;
      *) u="$SITE/$a";;
    esac
    code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 25 "$u")
    printf "  HTTP=%s  %s\n" "$code" "$u" | tee -a "$LOG"
  done
fi
echo "" | tee -a "$LOG"

echo "--- 4. Заголовки страниц ---" | tee -a "$LOG"
for p in "" "privacy.html" "admin/login.html"; do
  t=$(curl -s -L --max-time 25 "$SITE/$p" | grep -o '<title>[^<]*</title>' | head -1)
  printf "  /%s -> %s\n" "$p" "${t:-НЕТ TITLE}" | tee -a "$LOG"
done
echo "" | tee -a "$LOG"

echo "=== ПРОВЕРКА ЗАВЕРШЕНА $(date -u '+%H:%M UTC') ===" | tee -a "$LOG"
cat "$LOG"
