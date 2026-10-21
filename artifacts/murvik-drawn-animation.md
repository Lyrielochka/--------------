# Дорисованная анимация Мурвика

Использован встроенный image_gen, режим identity-preserve, исходный персонаж: public/assets/murvik.webp.

16 дорисованных кадров: public/assets/murvik-frames/00.webp — 15.webp.
Исходный лист: artifacts/murvik-drawn-sheet.png. Просмотр всех подготовленных кадров: artifacts/murvik-drawn-preview.png.
Подготовка: node scripts/prepare-murvik-frames.mjs. Воспроизведение: src/MurvikMotion.jsx.

Кадры действительно перерисованы. Две последовательности: приветствие лапой и любопытный наклон головы с морганием. Между нарисованными позами рассчитывается движение через двунаправленные optical-flow поля; WebGL воспроизводит промежуточные состояния через requestAnimationFrame. Исходные рисунки остаются неизменными. В крайних точках жест плавно замедляется, поворот лапы ускоряется постепенно. Удалены лишние смены почти одинаковых поз из последовательности взмаха. Между действиями 6.5–10 секунд; нажатие вызывает следующий жест. В скрытой вкладке и вне экрана анимация останавливается. Системная настройка reduced motion и отсутствие WebGL оставляют статичный оригинал.

Поля движения: public/assets/murvik-flow/*.bin, 12 файлов по 17280 байт. Воспроизведение: src/murvikMotionRenderer.js. Повторный расчёт: scripts/prepare-murvik-flow.py (требует OpenCV и NumPy; установлены во временную папку murvik-motion-tools).

## Итоговый промпт генерации

Use case: identity-preserve. Create a production animation SPRITE SHEET for the EXACT lynx kitten Murvik in the supplied edit target. Preserve his original painterly realistic cute fur rendering, spotted golden coat, green military officer cap with red band and gold star, amber eyes, proportions, sitting pose. Output one transparent PNG sheet, precisely 4 columns by 4 rows, 16 equally sized rectangular cells, ideally total 1536 x 2048. Every cell contains ONE complete full-body kitten at EXACTLY the same scale and registration, grounded paws at the same baseline, cap top same height. Transparent gutters inside each cell, NO grid, NO labels, NO text. Camera fixed. Do NOT duplicate or add limbs. Original tail and all feet visible. Each frame must be hand-redrawn coherent anatomical animation, not warped image. Read left to right top to bottom. Frames 1-8 (top two rows): gentle greeting with his raised left forepaw (viewer RIGHT): 1 reference resting raised paw; 2 forearm lifts slightly from elbow; 3 paw tilts outward; 4 outward apex with visible pads; 5 paw eases to centre; 6 paw tilts inward; 7 inward apex; 8 eases to original raised position. Modest 15-degree wave arc, supple wrist, natural elbow, consistent shoulder. Frames 9-16 (bottom two rows): curiosity and blink: 9 original head, 10 slight head tilt toward viewer left, 11 a little deeper tilt and ears perk, 12 gentle closed-eye blink at apex, 13 eyes opening, 14 easing head upright, 15 tiny ear twitch, 16 original pose again. Body, cap, feet should register precisely so sequential playback has NO jitter. Tail gives tiny accompanying movement. Favor on-model matching and temporal consistency over embellishment. No background, no shadow rectangle. All sixteen images equally sized and evenly spaced in exact 4x4 layout.

## Проверка

MURVIK_SMOOTH: PASS — distinct transition positions within 300ms, painted endpoints, desktop/mobile, reduced motion, restart, cleanup, no JS errors.
Скриншоты 1440×900, 390×844 и 320×568: artifacts/murvik-motion-*.png.
