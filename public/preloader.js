(() => {
  const loader = document.getElementById('operation-loader');
  if (!loader) return;
  const progress = loader.querySelector('[role="progressbar"]');
  const message = document.getElementById('loader-message');
  const fill = document.getElementById('loader-fill');
  const percent = document.getElementById('loader-percent');
  const ready = { page: false, app: false, cover: false, fonts: false };
  let preparing = false;
  let finished = false;
  document.documentElement.classList.add('operation-loading');

  // Percentages count completed readiness stages, not time or downloaded bytes.
  const update = () => {
    const value = Object.values(ready).filter(Boolean).length * 25;
    fill.style.width = `${value}%`;
    percent.textContent = `${String(value).padStart(2, '0')}%`;
    progress.setAttribute('aria-valuenow', value);
    message.textContent = !ready.app ? 'Загружаем сайт…'
      : !ready.cover ? 'Загружаем обложку…'
      : !ready.fonts ? 'Загружаем шрифты…'
      : !ready.page ? 'Завершаем загрузку…' : 'Сайт готов';
    if (value !== 100 || finished) return;
    finished = true;
    observer.disconnect();
    window.removeEventListener('load', pageLoaded);
    requestAnimationFrame(() => {
      loader.classList.add('is-complete');
      document.documentElement.classList.remove('operation-loading');
      const remove = () => {
        if (!loader.isConnected) return;
        loader.remove();
        window.dispatchEvent(new Event('operation:loaded'));
      };
      loader.addEventListener('transitionend', event => {
        if (event.target === loader && event.propertyName === 'opacity') remove();
      });
      // Only the exit animation has a timeout; loading itself has no time limit.
      setTimeout(remove, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200);
    });
  };
  const pageLoaded = () => { ready.page = true; update(); };
  const prepare = () => {
    const hero = document.querySelector('#root #hero');
    if (!hero || preparing) return;
    preparing = true;
    ready.app = true;
    update();
    // Explicitly load/decode the first screen's CSS background.
    const coverUrl = getComputedStyle(hero).getPropertyValue('--hero-image')
      .trim().match(/^url\(["']?(.*?)["']?\)$/)?.[1];
    const cover = new Image();
    const coverReady = async () => {
      try { if (cover.naturalWidth) await cover.decode(); } catch {}
      ready.cover = true;
      update();
    };
    if (coverUrl) {
      cover.onload = coverReady;
      cover.onerror = coverReady;
      cover.src = coverUrl;
    } else ready.cover = true;
    // Request cover fonts even while #root is hidden.
    const fontLoads = document.fonts ? [...hero.querySelectorAll('h1, p, strong, span')]
      .map(element => {
        const style = getComputedStyle(element);
        return document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, element.textContent);
      }) : [];
    Promise.allSettled(fontLoads).then(() => document.fonts?.ready).then(() => {
      ready.fonts = true;
      update();
    });
  };
  const observer = new MutationObserver(prepare);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', pageLoaded, { once: true });
  ready.page = document.readyState === 'complete';
  prepare();
  update();
})();
