/* ═══════════════════════════════════════════════════════════════
   Script.js — Arindam Ruidas Portfolio (Merged & Enhanced)
   ─────────────────────────────────────────────────────────────
   Merged from both script versions. Added:
   • Constellation cursor (particle trail with connecting lines)
   • Cipher text decode (sci-fi character scramble on reveal)
   • Magnetic 3D card tilt (perspective hover)
   • Procedural film-grain generator
   ═══════════════════════════════════════════════════════════════ */

"use strict";

(function () {
  /* ─── Utilities ─────────────────────────────────────────── */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const getEmailAddress = () =>
    String.fromCharCode(
      97, 114, 105, 110, 100, 97, 109, 114, 117, 105, 100, 97,
      115, 56, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109
    );

  $$('[data-email-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = `mailto:${getEmailAddress()}`;
    });
  });

  /* ═══════════════════════════════════════════════════════════
     MOBILE NAVIGATION
     Best of both: proper close function, Escape key, aria labels,
     body scroll lock
     ═══════════════════════════════════════════════════════════ */
  const menuToggle = $("#menu-toggle");
  const primaryNav = $("#primary-navigation");

  function closeNavigation() {
    if (!primaryNav || !menuToggle) return;
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
      document.body.classList.toggle("menu-open", isOpen);
    });

    $$("a", primaryNav).forEach((link) =>
      link.addEventListener("click", closeNavigation)
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNavigation();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     HEADER SCROLL STATE
     From Script 1: class-based toggle, passive listener
     ═══════════════════════════════════════════════════════════ */
  const siteHeader = $("#site-header");

  if (siteHeader) {
    const updateHeader = () =>
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 20);
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  /* ═══════════════════════════════════════════════════════════
     PROJECT FILTERING
     From Script 1: uses hidden attribute (better a11y)
     ═══════════════════════════════════════════════════════════ */
  const filterButtons = $$(".filter-button");
  const projectCards = $$(".project-card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      projectCards.forEach((card) => {
        card.hidden = !(filter === "all" || card.dataset.category === filter);
      });
    });
  });

  /* ═══════════════════════════════════════════════════════════
     SCROLL REVEAL — Blur-Materialize
     From Script 1: shared observer, prefers-reduced-motion,
     observeReveal for dynamic elements, cipher decode trigger
     ═══════════════════════════════════════════════════════════ */
  let revealObserver = null;

  if (prefersReducedMotion) {
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
  } else {
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");

          // Trigger cipher decode on data-cipher children
          entry.target
            .querySelectorAll("[data-cipher]")
            .forEach((el) => cipherDecode(el));

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    $$(".reveal").forEach((el) => revealObserver.observe(el));
  }

  /** Observe a single new element for the reveal animation */
  function observeReveal(element) {
    if (prefersReducedMotion) {
      element.classList.add("is-visible");
    } else if (revealObserver) {
      revealObserver.observe(element);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     CIPHER TEXT DECODE
     Sci-fi character scramble — glyphs cycle until the real
     character "locks in" from left to right
     ═══════════════════════════════════════════════════════════ */
  function cipherDecode(element) {
    if (prefersReducedMotion || element.dataset.cipherDone) return;
    element.dataset.cipherDone = "true";

    const originalText = element.textContent;
    const glyphs = "▓░▒█◆◇○●⬡△▲◁▷⊕⊗⊙✦✧⬢";
    let iteration = 0;

    const interval = setInterval(() => {
      element.textContent = originalText
        .split("")
        .map((char, i) => {
          if (char === " " || char === "\n") return char;
          if (i < iteration) return originalText[i];
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        })
        .join("");

      iteration += 1.5;

      if (iteration >= originalText.length) {
        clearInterval(interval);
        element.textContent = originalText;
      }
    }, 25);
  }

  /* ═══════════════════════════════════════════════════════════
     CONTACT FORM
     From Script 1: FormData → mailto redirect with reset
     ═══════════════════════════════════════════════════════════ */
  const contactForm = $("#contact-form");
  const formStatus = $("#form-status");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(contactForm);
      const name = data.get("name");
      const email = data.get("email");
      const message = data.get("message");

      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      );

      formStatus.textContent =
        "Your email app should open with this message addressed to me. Review it and press Send. If it does not open, use the Email me link.";
      window.location.href = `mailto:${getEmailAddress()}?subject=${subject}&body=${body}`;

      setTimeout(() => {
        formStatus.textContent = "";
      }, 5000);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     FOOTER YEAR
     ═══════════════════════════════════════════════════════════ */
  const yearEl = $("#current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ═══════════════════════════════════════════════════════════
     FEEDBACK SYSTEM
     From Script 1: localStorage, star rating, XSS sanitization,
     dynamic card rendering with observeReveal()
     ═══════════════════════════════════════════════════════════ */
  (function initFeedback() {
    const STORAGE_KEY = "ar_portfolio_feedback";
    const wall = $("#feedback-wall");
    const noFeedback = $("#no-feedback");
    const form = $("#feedback-form");
    const status = $("#fb-status");
    const starsContainer = $("#star-rating");
    let selectedRating = 0;

    if (!form || !wall || !starsContainer) return;

    /** Sanitize user input to prevent XSS via localStorage */
    function sanitize(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    /* ── Star rating interaction ── */
    starsContainer.addEventListener("click", (e) => {
      const star = e.target.closest(".star");
      if (!star) return;
      selectedRating = parseInt(star.dataset.value, 10);
      updateStars();
    });

    function updateStars() {
      $$(".star", starsContainer).forEach((s) => {
        s.classList.toggle(
          "active",
          parseInt(s.dataset.value, 10) <= selectedRating
        );
      });
    }

    /* ── Load & save feedback ── */
    function loadFeedback() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch {
        return [];
      }
    }

    function saveFeedback(list) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    /* ── Render feedback cards ── */
    function renderFeedback() {
      const list = loadFeedback();
      wall.innerHTML = "";

      if (list.length === 0) {
        noFeedback.style.display = "block";
        return;
      }

      noFeedback.style.display = "none";

      list.forEach((fb) => {
        const card = document.createElement("div");
        card.className = "feedback-card reveal";

        const rating = Math.max(0, Math.min(5, fb.rating || 0));
        const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
        const initials = sanitize(
          fb.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
        );

        card.innerHTML = `
          <div class="fb-stars">${stars}</div>
          <p class="fb-text">"${sanitize(fb.message)}"</p>
          <div class="fb-author">
            <span class="fb-avatar">${initials}</span>
            <div>
              <span class="fb-name">${sanitize(fb.name)}</span>
              ${
                fb.role
                  ? `<span class="fb-role">${sanitize(fb.role)}</span>`
                  : ""
              }
            </div>
          </div>
        `;

        wall.appendChild(card);

        // Register for magnetic tilt (runs after card is in DOM)
        registerMagneticTilt(card);

        observeReveal(card);
      });
    }

    renderFeedback();

    /* ── Handle form submit ── */
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.querySelector("#fb-name").value.trim();
      const role = form.querySelector("#fb-role").value.trim();
      const message = form.querySelector("#fb-message").value.trim();

      if (!name || !message) return;

      const list = loadFeedback();
      list.unshift({
        name,
        role,
        message,
        rating: selectedRating || 5,
        date: new Date().toISOString(),
      });
      saveFeedback(list);
      renderFeedback();

      form.reset();
      selectedRating = 0;
      updateStars();

      if (status) {
        status.textContent = "Thank you for your feedback! ✦";
        setTimeout(() => {
          status.textContent = "";
        }, 4000);
      }
    });
  })();

  /* ═══════════════════════════════════════════════════════════
     DOT-AND-RING CURSOR
     ═══════════════════════════════════════════════════════════ */
  if (
    !prefersReducedMotion &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    const orb = $("#cursor-orb");
    if (orb) {
      const pointer = { x: -100, y: -100 };
      const position = { x: -100, y: -100 };

      document.addEventListener("pointermove", (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        orb.classList.add("is-active");
      });

      document.addEventListener("pointerover", (event) => {
        const target =
          event.target instanceof Element
            ? event.target.closest("a, button")
            : null;
        orb.classList.toggle("is-link", Boolean(target?.tagName === "A"));
        orb.classList.toggle("is-hovering", Boolean(target));
      });

      document.addEventListener("pointerleave", () => {
        orb.classList.remove("is-active", "is-link", "is-hovering");
      });

      function animateCursor() {
        position.x += (pointer.x - position.x) * 0.22;
        position.y += (pointer.y - position.y) * 0.22;
        orb.style.left = `${position.x}px`;
        orb.style.top = `${position.y}px`;
        requestAnimationFrame(animateCursor);
      }

      animateCursor();

      $$(".button, .filter-button, .menu-toggle").forEach((button) => {
        let bounds;

        button.addEventListener("pointerenter", () => {
          bounds = button.getBoundingClientRect();
        });

        button.addEventListener("pointermove", (event) => {
          if (!bounds) return;
          const offsetX = (event.clientX - (bounds.left + bounds.width / 2)) * 0.12;
          const offsetY = (event.clientY - (bounds.top + bounds.height / 2)) * 0.12;
          button.style.setProperty("--magnetic-x", `${offsetX}px`);
          button.style.setProperty("--magnetic-y", `${offsetY}px`);
        });

        button.addEventListener("pointerleave", () => {
          bounds = null;
          button.style.removeProperty("--magnetic-x");
          button.style.removeProperty("--magnetic-y");
        });
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     MAGNETIC 3D CARD TILT
     Cards tilt toward the cursor with perspective, creating
     a physical depth feel. Smooth snap-back on mouse leave.
     ═══════════════════════════════════════════════════════════ */
  function registerMagneticTilt(card) {
    if (prefersReducedMotion) return;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transition = "none";
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transition = "transform 0.5s cubic-bezier(.25,.46,.45,.94)";
      card.style.transform = "";
    });
  }

  if (!prefersReducedMotion) {
    $$(".project-card, .strength-item, .case-study-block").forEach(
      registerMagneticTilt
    );
  }

  /* ═══════════════════════════════════════════════════════════
     PROCEDURAL GRAIN TEXTURE
     Generates a canvas-based noise pattern and sets it as the
     grain overlay background — no external assets needed.
     ═══════════════════════════════════════════════════════════ */
  (function initGrain() {
    const grainEl = $(".grain-overlay");
    if (!grainEl) return;

    const size = 200;
    const grainCanvas = document.createElement("canvas");
    grainCanvas.width = size;
    grainCanvas.height = size;
    const gCtx = grainCanvas.getContext("2d");

    const imageData = gCtx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.random() * 255;
      imageData.data[i] = v;
      imageData.data[i + 1] = v;
      imageData.data[i + 2] = v;
      imageData.data[i + 3] = 55; // semi-transparent noise
    }
    gCtx.putImageData(imageData, 0, 0);

    grainEl.style.backgroundImage = `url(${grainCanvas.toDataURL()})`;
  })();
})();
