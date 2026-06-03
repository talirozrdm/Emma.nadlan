(() => {
  const html = document.documentElement;
  const storageKey = "emma-nadlan-accessibility";
  const textSizes = ["small", "default", "large", "larger"];
  const defaultSettings = {
    textSize: "default",
    highContrast: false,
    highlightLinks: false,
    reduceMotion: false
  };

  const toggle = document.querySelector(".accessibility-toggle");
  const panel = document.getElementById("accessibility-panel");
  const controls = panel?.querySelector(".accessibility-controls");

  if (toggle && panel && controls) {
    let settings = { ...defaultSettings };

    try {
      settings = { ...settings, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
    } catch (error) {
      settings = { ...defaultSettings };
    }

    const saveSettings = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(settings));
      } catch (error) {
        // The controls still work when browser storage is unavailable.
      }
    };

    const applySettings = () => {
      html.dataset.textSize = settings.textSize;
      html.classList.toggle("a11y-high-contrast", settings.highContrast);
      html.classList.toggle("a11y-highlight-links", settings.highlightLinks);
      html.classList.toggle("a11y-reduce-motion", settings.reduceMotion);

      panel.querySelector('[data-accessibility-action="high-contrast"]')?.setAttribute("aria-pressed", String(settings.highContrast));
      panel.querySelector('[data-accessibility-action="highlight-links"]')?.setAttribute("aria-pressed", String(settings.highlightLinks));
      panel.querySelector('[data-accessibility-action="reduce-motion"]')?.setAttribute("aria-pressed", String(settings.reduceMotion));
    };

    const setPanelOpen = (isOpen, returnFocus = false) => {
      panel.hidden = !isOpen;
      toggle.setAttribute("aria-expanded", String(isOpen));

      if (isOpen) {
        panel.querySelector("button")?.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", () => {
      setPanelOpen(panel.hidden);
    });

    controls.addEventListener("click", (event) => {
      const button = event.target.closest("[data-accessibility-action]");
      if (!button) return;

      const action = button.dataset.accessibilityAction;
      const currentTextIndex = textSizes.indexOf(settings.textSize);

      if (action === "increase-text") {
        settings.textSize = textSizes[Math.min(currentTextIndex + 1, textSizes.length - 1)];
      }
      if (action === "decrease-text") {
        settings.textSize = textSizes[Math.max(currentTextIndex - 1, 0)];
      }
      if (action === "high-contrast") {
        settings.highContrast = !settings.highContrast;
      }
      if (action === "highlight-links") {
        settings.highlightLinks = !settings.highlightLinks;
      }
      if (action === "reduce-motion") {
        settings.reduceMotion = !settings.reduceMotion;
      }
      if (action === "reset") {
        settings = { ...defaultSettings };
      }

      applySettings();
      saveSettings();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) {
        setPanelOpen(false, true);
      }
    });

    applySettings();
  }

  document.querySelectorAll(".accordion-button").forEach((button) => {
    button.addEventListener("click", () => {
      const content = document.getElementById(button.getAttribute("aria-controls"));
      if (!content) return;
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      content.hidden = isOpen;
    });
  });

  const deepLinkHash = window.location.hash;
  const deepLinkedContent = deepLinkHash ? document.querySelector(deepLinkHash) : null;
  if (deepLinkedContent && deepLinkedContent.classList.contains("accordion-content")) {
    const deepLinkedButton = document.querySelector('[aria-controls="' + deepLinkedContent.id + '"]');
    if (deepLinkedButton) {
      deepLinkedButton.setAttribute("aria-expanded", "true");
      deepLinkedContent.hidden = false;
    }
  }

  const lightbox = document.getElementById("testimonial-lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const lightboxClose = lightbox?.querySelector(".lightbox-close");
  let lightboxTrigger = null;

  if (lightbox && lightboxImage && lightboxClose) {
    const closeLightbox = () => {
      lightbox.hidden = true;
      lightboxImage.src = "";
      document.body.classList.remove("modal-open");
      if (lightboxTrigger) lightboxTrigger.focus();
    };

    document.querySelectorAll(".testimonial-open").forEach((button) => {
      button.addEventListener("click", () => {
        const thumbnail = button.querySelector("img");
        lightboxTrigger = button;
        lightboxImage.src = button.dataset.testimonialSrc;
        lightboxImage.alt = thumbnail?.alt || "תצוגה מוגדלת של המלצת לקוח על אמה נדל״ן";
        lightbox.hidden = false;
        document.body.classList.add("modal-open");
        lightboxClose.focus();
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !lightbox.hidden) {
        closeLightbox();
      }
      if (event.key === "Tab" && !lightbox.hidden) {
        event.preventDefault();
        lightboxClose.focus();
      }
    });
  }
})();
