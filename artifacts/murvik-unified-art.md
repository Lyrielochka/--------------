# Единый образ Мурвика — 6 ноября 2026

Обновлены все используемые сайтом изображения персонажа:
- Кнопка помощника: public/assets/murvik-kitten-avatar-v3.webp (384×384), исходник murvik-kitten-avatar-v3.png.
- Главное окно, чат, викторина, результат и задания: public/assets/murvik-tour/natural-v2/{sit,stand,rest,attentive}.webp.
- Экскурсия использует те же четыре позы рысёнка.

Портрет создан встроенным image_gen с утверждённым листом поз в качестве эталона. Старые оригиналы, кадры моргания и прежние последовательности остаются в проекте как исходные материалы; ссылок на них в интерфейсе больше нет. Фоновая карта и текстура панели не содержат персонажа и сохранены.

Промпт портрета: Create ONE clean avatar portrait of exactly this approved BABY LYNX KITTEN Murvik for a small website launcher button. Reference is identity and style lock. Preserve very young kitten appearance: huge rounded fluffy head, enormous round amber eyes, tiny pink nose and short muzzle, white fluffy cheeks, golden spotted baby fur, tufted ears, olive military cap with red band and gold star. Soft detailed illustrated fur, warm friendly curious expression, closed natural feline mouth. NOT adult lynx. Head and upper chest only, facing viewer with subtle tilt, centered square composition. Complete ear tufts and cap inside canvas with transparent margins. True transparent background. No paws, hands, human body, waving, text, scenery, border or shadow. Match upper-left sitting kitten from reference.

Проверки: сборка PASS; scripts/murvik-kitten-art-check.mjs PASS. Кнопка, главное меню, вопрос и ответ викторины, задание и чат проверены при 1440×900, 1280×720, 390×844, 320×568 и 844×390. Проверены загрузка, новые пути, альтернативные подписи, отсутствие движения персонажа и размещение изображений целиком внутри панели. Ошибок выполнения нет.
