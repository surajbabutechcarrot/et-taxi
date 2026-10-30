(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smooth in-page navigation
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#" || id === "#ar") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  const formatCount = (value, decimals) => {
    if (decimals > 0) return value.toFixed(decimals);
    return String(Math.round(value));
  };

  const setCountValue = (el, value) => {
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const decimals = Number(el.getAttribute("data-decimals") || 0);
    el.textContent = `${prefix}${formatCount(value, decimals)}${suffix}`;
  };

  const animateCount = (el, duration = 1600) => {
    const target = Number(el.getAttribute("data-count"));
    if (!Number.isFinite(target)) return;

    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCountValue(el, target * eased);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setCountValue(el, target);
      }
    };

    requestAnimationFrame(tick);
  };

  const startStatCounts = (statEl) => {
    const valueEl = statEl.querySelector(".stat__value[data-count]");
    if (!valueEl || valueEl.dataset.counted === "true") return;
    valueEl.dataset.counted = "true";
    animateCount(valueEl);
  };

  const revealEls = document.querySelectorAll("[data-animate]");
  const showFinalCounts = () => {
    document.querySelectorAll(".stat__value[data-count]").forEach((el) => {
      setCountValue(el, Number(el.getAttribute("data-count")));
      el.dataset.counted = "true";
    });
  };

  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("is-in"));
    showFinalCounts();
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
    showFinalCounts();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = Number(el.getAttribute("data-delay") || 0);
        window.setTimeout(() => {
          el.classList.add("is-in");
          if (el.classList.contains("stat")) startStatCounts(el);
        }, delay);
        observer.unobserve(el);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealEls.forEach((el) => observer.observe(el));
})();
