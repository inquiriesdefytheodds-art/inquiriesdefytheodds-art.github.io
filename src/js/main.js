// Header: scroll-linked hide/show (moves 1:1 with scroll, no animation)
// + mobile menu toggle. Script loads at end of <body>, so #site-header exists.
const header = document.getElementById("site-header");

if (header) {
  let headerHeight = header.offsetHeight || 80;
  // 0 = fully visible, -headerHeight = fully hidden
  let headerOffset = 0;
  let lastScrollY = window.scrollY;

  const measure = () => {
    if (header.offsetHeight > 0) headerHeight = header.offsetHeight;
    // Fixed header: offset body so it doesn't cover content
    document.body.style.paddingTop = `${headerHeight}px`;
    headerOffset = Math.max(-headerHeight, Math.min(0, headerOffset));
    header.style.transform = `translateY(${headerOffset}px)`;
  };

  // Start hidden if reloaded mid-page (there is no scroll history to replay).
  const sync = () => {
    measure();
    lastScrollY = window.scrollY;
    headerOffset = lastScrollY <= 0 ? 0 : -Math.min(lastScrollY, headerHeight);
    header.style.transform = `translateY(${headerOffset}px)`;
  };
  sync();

  // ResizeObserver catches height changes (logo/font load, menu open,
  // rotation); resize covers viewport changes; pageshow covers back/forward.
  window.addEventListener("resize", measure);
  window.addEventListener("pageshow", sync);
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(header);

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        headerOffset =
          y <= 0 ? 0 : Math.max(-headerHeight, Math.min(0, headerOffset - (y - lastScrollY)));
        header.style.transform = `translateY(${headerOffset}px)`;
        lastScrollY = y;
        ticking = false;
      });
    },
    { passive: true }
  );

}
