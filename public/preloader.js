(() => {
  const loader = document.getElementById('operation-loader');
  const rootReady = () => document.getElementById('root')?.childElementCount > 0;
  const messages = [
    'Разворачиваем для вас оперативные карты…',
    'Готовим технику к выдвижению…',
    'Собираем архивные документы и истории…',
    'Прокладываем ваш маршрут по операции…',
    'Завершаем подготовку экспедиции…',
  ];
  const started = performance.now();
  const progress = loader.querySelector('[role="progressbar"]');
  const message = document.getElementById('loader-message');
  let previousStep = 0;
  document.documentElement.classList.add('operation-loading');
  const tick = setInterval(() => {
    const elapsed = performance.now() - started;
    const step = Math.min(Math.floor(elapsed / 2000), messages.length - 1);
    if (step !== previousStep) {
      message.textContent = messages[step];
      message.getAnimations().forEach(animation => animation.cancel());
      message.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350 });
      previousStep = step;
    }
    const ready = rootReady() && document.readyState === 'complete';
    const percent = Math.min(ready ? 100 : 96, Math.floor(elapsed / 7000 * 100));
    document.getElementById('loader-fill').style.width = `${percent}%`;
    document.getElementById('loader-percent').textContent = `${String(percent).padStart(2, '0')}%`;
    progress.setAttribute('aria-valuenow', percent);
    if (elapsed >= 7000 && ready || elapsed >= 15000) {
      clearInterval(tick);
      loader.classList.add('is-complete');
      document.documentElement.classList.remove('operation-loading');
      setTimeout(() => {
        loader.remove();
        window.dispatchEvent(new Event('operation:loaded'));
      }, 700);
    }
  }, 100);
})();
