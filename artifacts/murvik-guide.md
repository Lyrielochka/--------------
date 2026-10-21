# Мурвiк с диалогом и реакциями

Добавлена вкладка «Спросить Мурвiка». Это локальный помощник по материалам сайта, не подключённая нейросеть. Внешние API и сервер не используются. При переходе на нейросетевой API потребуется отдельный сервер с ключом и ограничениями запросов; ключ нельзя помещать в клиентский Vite-код.

Ответы: карточки техники, досье фронтов, записи атласа, вопросы викторины и подготовленные пояснения к разделам. Контекст уточнений хранится в текущей сессии. Диалог переживает закрытие панели и переход на викторину; перезагрузка страницы начинает новую переписку. Кнопка «Новый диалог» очищает сообщения и отменяет незавершённый вывод. История вопросов викторины по-прежнему сохраняется в localStorage.

Состояния: ожидание, слушает, сверяет материалы, отвечает, радуется, не нашёл сведений. Моргание и все движения отключаются при prefers-reduced-motion. Основной рисунок сохранён. Второй кадр создан встроенным image_gen и оптимизирован в public/assets/murvik-blink.webp. Исходный PNG: public/assets/murvik-blink-original.png. В публикацию входят только рабочие WebP.

## Промпт второго кадра

Edit target: supplied mascot. Create exactly the same image, dimensions, composition, transparent alpha, pose, cap, fur, lighting, silhouette, raised paw, character placement. Change ONLY both eyes to gently fully CLOSED eyes for a natural blink animation frame. Preserve facial anatomy and eye locations; peaceful happy curved eyelids. Do not move head, nose, ears, cap, body or paws; do not change smile. This will overlay original open eyes frame, so pixel-perfect registration is critical. No text or new objects. True transparent background, retain original alpha.

## Проверки

scripts/murvik-guide-check.mjs — подбор ответов, сравнение техники, контекст уточнений, неизвестные параметры и вопросы вне темы.

scripts/murvik-chat-check.mjs — диалог, состояния, моргание, отмена вывода, история сессии, сохранение викторины при смене вкладок, ссылки на разделы, клавиатура, уменьшение движения и ширины 1440/390/320.

scripts/murvik-check.mjs и scripts/murvik-deck-check.mjs — регрессия викторины и отсутствие недавних повторов.
