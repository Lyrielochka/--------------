# Моргание Мурвика

Кадры созданы встроенным image_gen как правка утверждённых рисунков. Сохраняются поза, размер, расположение, окраска, фуражка и прозрачность; закрываются только глаза.

Файлы: public/assets/murvik-tour/natural-v2/{sit,stand,rest,attentive}-blink.webp; исходный лист poses-blink.png. Для кнопки: public/assets/murvik-kitten-avatar-v3-blink.webp и исходник .png.

Промпт: Precise eye-only edit for a blinking animation. Keep the ENTIRE input image identical: same canvas size and aspect, character size and placement, pose, ears, fur, whiskers, cap, face shape, colors and transparency. Change ONLY eyelids: close BOTH eyes gently and completely in a relaxed natural feline blink for EVERY kitten shown. Eyelids form softly curved thin closed-eye lines at existing eye positions. Do not squint, smile, change expression or tilt head. No iris or pupil visible. Nothing except eyes changes.

Режим: глаза закрываются на 170 мс раз в 4,8 секунды. Общий компонент применяется к кнопке, помощнику и экскурсии. Кадр предварительно загружается; при его недоступности сохраняется открытый взгляд. При скрытии страницы, смене позы и закрытии окна таймер очищается. Системная настройка уменьшения движения учитывается. Ходьбы, покачивания и перемещения персонажа нет.
