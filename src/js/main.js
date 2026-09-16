// Client-side interactive script
(() => {
  console.log("Defy the Odds site loaded");

  const initHeader = () => {
    // Scroll-linked header: moves at the same speed as the scroll,
    // so scrolling up a little only reveals a bit of the header.
    // No animation — header translateY tracks scrollY 1:1.
    const header = document.getElementById("site-header");
    if (!header) return false;

    let headerHeight = header.offsetHeight || 80;
    // 0 = fully visible, -headerHeight = fully hidden
    let headerOffset = 0;
    let lastScrollY = window.scrollY;

    // Offset body content so fixed header doesn't cover it.
    // Header height varies (wraps on mobile, logo loads late), so measure it.
    const measure = () => {
      const h = header.offsetHeight;
      if (h > 0) headerHeight = h;
      document.body.style.paddingTop = `${headerHeight}px`;
      // Keep offset clamped if height changed (e.g. rotate/resize/logo load)
      headerOffset = Math.max(-headerHeight, Math.min(0, headerOffset));
      header.style.transform = `translateY(${headerOffset}px)`;
    };

    // Init offset from current scroll position so reload mid-page
    // starts hidden (instead of wrongly visible until next scroll).
    const syncInitialState = () => {
      measure();
      lastScrollY = window.scrollY;
      if (lastScrollY > headerHeight) {
        headerOffset = -headerHeight;
      } else if (lastScrollY > 0) {
        headerOffset = -lastScrollY;
      } else {
        headerOffset = 0;
      }
      header.style.transform = `translateY(${headerOffset}px)`;
    };

    syncInitialState();

    // Re-measure when anything can change header height. This fixes the
    // "works half the time" race where measure() ran before the logo
    // image / fonts loaded (cached = worked, uncached = wrong height).
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    window.addEventListener("load", syncInitialState);
    // Back/forward cache restores scroll without firing scroll events
    window.addEventListener("pageshow", syncInitialState);
    if ("ResizeObserver" in window) {
      new ResizeObserver(measure).observe(header);
    }
    const logo = document.getElementById("headerlogo");
    if (logo) {
      if (!logo.complete) logo.addEventListener("load", measure, { once: true });
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    let ticking = false;
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;

      if (currentY <= 0) {
        // At the very top: snap fully visible
        headerOffset = 0;
      } else if (delta !== 0) {
        // Move exactly with the scroll: down hides, up reveals, 1:1
        headerOffset -= delta;
        if (headerOffset < -headerHeight) headerOffset = -headerHeight;
        if (headerOffset > 0) headerOffset = 0;
      }

      header.style.transform = `translateY(${headerOffset}px)`;

      lastScrollY = currentY;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true }
    );
    return true;
  };

  // Script is loaded at end of <body>, so header usually exists already.
  // Run now, and retry on DOMContentLoaded as fallback.
  if (!initHeader()) {
    document.addEventListener("DOMContentLoaded", initHeader);
  }
})();
