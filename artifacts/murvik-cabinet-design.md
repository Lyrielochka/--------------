# Панель Мурвика: кабинет исследователя

Новая графика внедрена в действующий интерфейс. Исходный персонаж и оригинальное моргание сохранены.

- `public/assets/murvik-cabinet-map.webp`: декоративная карта, создана встроенным image_gen и оптимизирована в WebP, ширина 850 px. Это художественный фон, не историческая карта.
- `src/MurvikSymbol.jsx`: четыре оригинальные векторные пиктограммы: компас, открытие, маршрут, диалог.
- `src/murvik-studio.css`: оформление панели, действий, чата, мобильных размеров.
- `src/Murvik.jsx`: внедрение графики и карточек действий.

## Промпт фоновой иллюстрации

Use case: stylized-concept. Asset type: decorative background illustration for the left character stage of an existing WWII history museum assistant UI. Create a premium atmospheric engraved cartography artwork, portrait 2:3. Deep midnight petroleum teal, delicate aged brass contour lines, a large subtle compass rose centered behind where a mascot will stand, fine topographic contours, faint routes and tiny dots, dark forest silhouettes along bottom corners, soft warm luminous dust. Elegant museum editorial aesthetic, sophisticated detailed copperplate etching with subdued contrast. Center area calm and dark so a separate mascot remains legible. Flat front-facing artwork, edge-to-edge. No characters, no animals, no readable text, no letters, no UI, no border, no weapons, no badges, no mockup.

## Проверка

- Финальная production-сборка: PASS (`murvik-cabinet-build.log`).
- MURVIK_PANEL_OK: все 40 вопросов, подсказок, ответов и результатов на 320×568; главная, задания и чат на 1440/1280/390/320/844; без переполнений (`murvik-cabinet-panel-check.log`).
- MURVIK_CHECK_OK: верные/неверные ответы, рекорд и его сохранение, перезапуск, задания, Escape, возврат фокуса и reduced motion; без ошибок JavaScript.
- Проверка чата использовала локальные ответы; подключение Ollama в рамках визуальной переработки не проверялось.
- В `murvik-panel-check.mjs` селектор «Далее» ограничен панелью: на сайте есть одноимённая кнопка фотогалереи.
