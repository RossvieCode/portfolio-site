
// ============================================
// 1. PRELOADER LOGIC (With Safety Fallback)
// ============================================
let resolvePreloader;
const preloaderFinished = new Promise(res => { resolvePreloader = res; });
let preloaderHiding = false;

const hidePreloader = () => {
  if (preloaderHiding) return;
  preloaderHiding = true;
  const loader = document.getElementById('preloader');
  if (!loader) {
    resolvePreloader();
    return;
  }
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
    resolvePreloader();
  }, 800);
};

// Hide as soon as the DOM is usable; waiting for every image and font made
// the page feel slower than it is.
document.addEventListener('DOMContentLoaded', hidePreloader);
// Fallback so preloader never blocks the page
setTimeout(hidePreloader, 800);

// ============================================
// === LENIS === smooth scrolling, driven by GSAP's ticker
// ============================================
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);

if (!reduceMotion && window.Lenis && hasGsap) {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({
    duration: 1.1,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
}

// Shared by nav links, scroll-to-contact CTAs and hash-on-load.
// Lands the target just below the fixed header.
function scrollToTarget(target, onDone) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const offset = -(document.querySelector('header')?.offsetHeight || 0) - 20;
  const y = el.getBoundingClientRect().top + window.scrollY + offset;
  // Already there: some scrollers skip the callback for a zero-distance scroll.
  if (Math.abs(y - window.scrollY) < 2) {
    onDone && onDone();
    return;
  }
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset, onComplete: onDone });
  } else {
    window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    onDone && setTimeout(onDone, reduceMotion ? 0 : 600);
  }
}

// Translation helper (i18n.js); falls back to the English text if it is missing.
const tr = (key, fallback) => (window.i18n ? window.i18n.t(key, fallback) : fallback);

// ============================================
// 3. MOBILE NAVIGATION
// ============================================
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

const setMobileNav = (open) => {
  if (!hamburger || !mobileNav) return;
  hamburger.classList.toggle('open', open);
  mobileNav.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? tr('menu.close', 'close menu') : tr('menu.open', 'menu'));
  document.body.style.overflow = open ? 'hidden' : 'auto';
  if (open) window.__lenis?.stop();
  else window.__lenis?.start();
};

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    setMobileNav(!mobileNav.classList.contains('open'));
  });

  mobileNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') setMobileNav(false);
  });
}

// ============================================
// 4. SCROLL REVEALS
// GSAP when it loaded; otherwise the IntersectionObserver fallback below.
// ============================================
if (hasGsap) document.documentElement.classList.add('gsap-ready');

// --- Fallback: no GSAP ---
if (!hasGsap) {
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealElements.forEach(el => revealObserver.observe(el));
}

// ============================================
// 4b. HEADER + SCROLL FEEL (no GSAP / Lenis on the home page)
// The header hides while reading down and comes back on any scroll up.
// Scroll-linked motion is pure CSS (animation-timeline); browsers without it
// get .no-sda: a one-time rise on entry and a JS-driven progress line.
// ============================================
const siteHeader = document.querySelector("header");
if (siteHeader) {
  let lastY = scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = Math.max(0, scrollY);
    const menuOpen = document.querySelector(".mobile-nav.open");
    const atTop = y < 24;
    siteHeader.classList.toggle("is-floating", !atTop);
    // Small jitters (and the phone address bar resizing) do not toggle it.
    if (Math.abs(y - lastY) < 6) return;
    const goingDown = y > lastY;
    siteHeader.classList.toggle("is-hidden", goingDown && y > 120 && !menuOpen && !siteHeader.querySelector(":focus-visible"));
    lastY = y;
  };
  addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  // Tabbing into a hidden header brings it back.
  siteHeader.addEventListener("focusin", () => {
    if (siteHeader.querySelector(":focus-visible")) siteHeader.classList.remove("is-hidden");
  });
  update();
}

if (!hasGsap && !reduceMotion && !(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'))) {
  document.documentElement.classList.add('no-sda');
  const bar = document.querySelector('.progress');
  if (bar) {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.scale = (max > 0 ? scrollY / max : 0) + ' 1';
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
}

// ============================================
// === GSAP MOTION === reveals, title splits, hero pin/fade
// gsap.matchMedia scopes everything and reverts it when a condition flips.
// ============================================
if (hasGsap) {
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  const REVEAL_FROM = { opacity: 0, y: 28 };
  const REVEAL_TO = { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' };
  const STAGGER_GRIDS = '.svc-grid, .works-grid, .playlist, .carousel-track';

  const mm = gsap.matchMedia();
  mm.add({
    desktop: '(min-width: 769px)',
    mobile: '(max-width: 768px)',
    motion: '(prefers-reduced-motion: no-preference)'
  }, (ctx) => {
    const { desktop, mobile, motion } = ctx.conditions;

    // Reduced motion: everything visible, no triggers, no pin, no splits.
    if (!motion) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
      return;
    }

    const handled = new Set();

    // --- Staggered grids: one ScrollTrigger per grid ---
    // Cards hidden by the portfolio filter are left out of the stagger and
    // marked visible so they appear normally when a filter shows them.
    // --- Services: cards swing up out of the page as you scroll (scrubbed,
    // so they follow the scrollbar both ways), then each one "arms": its
    // glyph draws itself and the signal bar lights. ---
    document.querySelectorAll('.svc-grid').forEach(grid => {
      const cells = Array.from(grid.children);
      cells.forEach(el => { handled.add(el); el.classList.add('active'); });
      gsap.set(grid, { perspective: 1200 });
      gsap.fromTo(cells,
        { opacity: 0, y: 90, rotateX: -38, scale: 0.9, transformOrigin: '50% 100%' },
        {
          opacity: 1, y: 0, rotateX: 0, scale: 1, ease: 'power2.out',
          stagger: desktop ? 0.12 : 0,
          scrollTrigger: {
            trigger: grid, start: 'top 92%', end: desktop ? 'top 38%' : 'top 55%', scrub: 0.8
          }
        });
      cells.forEach(cell => {
        const item = cell.querySelector('.svc-item');
        const strokes = cell.querySelectorAll('.svc-glyph path, .svc-glyph rect, .svc-glyph circle');
        strokes.forEach(s => {
          const len = s.getTotalLength ? s.getTotalLength() : 100;
          gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
        });
        ScrollTrigger.create({
          trigger: cell, start: mobile ? 'top 90%' : 'top 72%', end: 'bottom 20%',
          toggleClass: { targets: item, className: 'is-armed' },
          onEnter: () => gsap.to(strokes, {
            strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.12, overwrite: true
          }),
          onEnterBack: () => gsap.to(strokes, {
            strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.12, overwrite: true
          })
        });
      });
    });

    document.querySelectorAll('.works-grid').forEach(grid => {
      const items = Array.from(grid.children);
      items.forEach(el => handled.add(el));
      const shown = items.filter(el => el.offsetParent !== null);
      items.filter(el => el.offsetParent === null).forEach(el => el.classList.add('active'));
      if (!shown.length) return;
      gsap.fromTo(shown, REVEAL_FROM, {
        ...REVEAL_TO,
        stagger: 0.08,
        scrollTrigger: { trigger: grid, start: 'top 82%', once: true }
      });
    });

    // --- Sounds player: the panel reveals, then its cards stagger in ---
    // Cards (.track), not their <li> slots: script.js owns each slot's 3D
    // transform. (The client carousel is a marquee and is not staggered.)
    document.querySelectorAll('.player.reveal').forEach(player => {
      handled.add(player);
      const rows = player.querySelectorAll('.playlist > li > .track');
      const tl = gsap.timeline({ scrollTrigger: { trigger: player, start: 'top 82%', once: true } });
      tl.fromTo(player, REVEAL_FROM, REVEAL_TO);
      if (rows.length) {
        tl.fromTo(rows, { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08 }, 0.2);
      }
    });

    // --- Individual reveals ---
    document.querySelectorAll('.reveal').forEach(el => {
      if (handled.has(el) || el.parentElement.closest(STAGGER_GRIDS)) return;
      gsap.fromTo(el, REVEAL_FROM, {
        ...REVEAL_TO,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true }
      });
    });

    // --- Section transitions (scrubbed, both ways): each section rises in as
    // it arrives, then sinks back (scale + fade) as the next one takes over.
    // Rise and sink animate different properties, so the two never fight. ---
    document.querySelectorAll('main > section:not(.hero)').forEach(sec => {
      gsap.fromTo(sec, { y: mobile ? 40 : 70 }, {
        y: 0, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 55%', scrub: true }
      });
      gsap.fromTo(sec, { scale: 1, opacity: 1 }, {
        scale: 0.94, opacity: 0.2, ease: 'none', immediateRender: false,
        transformOrigin: '50% 100%',
        scrollTrigger: { trigger: sec, start: 'bottom 30%', end: 'bottom top', scrub: true }
      });
    });

    // --- Title word reveals (SplitText keeps nested markup + a11y label) ---
    if (window.SplitText) {
      // Words-only split (no lines), so no autoSplit: it would restore the
      // original text on resize and undo a language switch. i18n.js reverts
      // and re-splits through window.__splitTitle when the language changes.
      window.__splitTitle = (el) => {
        el.__split = SplitText.create(el, {
          type: 'words', mask: 'words', aria: 'auto',
          onSplit: (self) => gsap.from(self.words, {
            yPercent: 100, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.04,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          })
        });
      };
      document.querySelectorAll('.section-title, .trusted-title, .portfolio-hero-title').forEach(el => window.__splitTitle(el));
    }

    // --- Hero ---
    if (document.querySelector('.hero')) {
      if (desktop) {
        // Pinned scrub. Targets are wrappers/children — never .hero-content,
        // which the 3D tilt owns.
        gsap.timeline({
          scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=45%', pin: true, scrub: 1 }
        })
          .to('.hero-logo-wrap', { scale: 0.85, y: -20, opacity: 0.7, rotationX: 28, transformPerspective: 900 }, 0)
          .to('.hero-content .title', { y: -30, opacity: 0 }, 0.1)
          .to('.hero-content .subtitle, .hero-credits', { y: -20, opacity: 0 }, 0.15)
          .to('.hero-actions', { y: -10, opacity: 0 }, 0.2);
      }
      if (mobile) {
        gsap.to('.hero-fade', {
          opacity: 0, y: -30, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 40%', scrub: true }
        });
        // The logo tips back in 3D as it scrolls away.
        gsap.to('.hero-logo-wrap', {
          rotationX: 32, scale: 0.9, transformPerspective: 900, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 40%', scrub: true }
        });
      }
    }
  });
}

// === LAYOUT READY === measure once fonts + preloader are done, then honour
// a hash in the URL (e.g. portfolio.html → index.html#contact).
Promise.all([preloaderFinished, document.fonts ? document.fonts.ready : null]).then(() => {
  if (hasGsap) ScrollTrigger.refresh();
  const id = decodeURIComponent(location.hash.slice(1));
  const el = id && document.getElementById(id);
  if (el) scrollToTarget(el);
});

// ============================================
// 5. AMBIENT DARK STARFIELD / DUST CANVAS (Optimized)
// ============================================
const canvas = document.getElementById('starfield');
if (canvas && canvas.getContext) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouseX = 0, mouseY = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Phones and touch screens already get the CSS star layers; a second,
  // always-running canvas loop there only costs battery while scrolling.
  const smallOrTouch = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  if (smallOrTouch) canvas.hidden = true;

  // Only run if not reduced motion
  if (!prefersReduced && !smallOrTouch) {
    let frameId = null;
    let isVisible = true;

    function resize() {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      // Avoid full particle wipe on minor mobile address bar resize
      if (particles.length > 0 && Math.abs(width - newWidth) < 20 && Math.abs(height - newHeight) < 120) {
        width = canvas.width = newWidth;
        height = canvas.height = newHeight;
        return;
      }

      width = canvas.width = newWidth;
      height = canvas.height = newHeight;
      particles = [];
      const count = Math.min(80, Math.floor((width * height) / 15000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.3,
          alpha: Math.random() * 0.4 + 0.1,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: (Math.random() - 0.5) * 0.15,
          pulseSpeed: Math.random() * 0.015 + 0.005,
          // Off-white and --signal-bright (#a3adbb): the steel palette, not the old amber.
          color: Math.random() > 0.4 ? '235, 238, 245' : '163, 173, 187'
        });
      }
    }

    // Throttled mouse move
    let mouseTimeout;
    window.addEventListener('mousemove', (e) => {
      if (!mouseTimeout) {
        mouseTimeout = requestAnimationFrame(() => {
          mouseX = (e.clientX - width / 2) * 0.035;
          mouseY = (e.clientY - height / 2) * 0.035;
          mouseTimeout = null;
        });
      }
    });

    window.addEventListener('resize', resize);

    // Pause animation when tab is hidden
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible && !frameId) {
        render();
      }
    });

    function render() {
      if (!isVisible) {
        frameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;
        p.alpha = Math.max(0.08, Math.min(0.65, p.alpha));

        if (p.x < 0) p.x += width;
        if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height;
        if (p.y > height) p.y -= height;

        const drawX = p.x - mouseX * (p.radius * 0.6);
        const drawY = p.y - mouseY * (p.radius * 0.6);

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();
      }

      frameId = requestAnimationFrame(render);
    }

    resize();
    render();
  }
}

// ============================================
// 5b. AUDIO BUS — only one sound on the page at a time
// Each player registers a controller with a pause() method and calls
// claim() before it starts. Declared here so block 7 can pause everything
// when a video opens.
// ============================================
const AudioBus = {
  current: null,
  claim(ctrl) {
    if (this.current && this.current !== ctrl) this.current.pause();
    this.current = ctrl;
  },
  release(ctrl) {
    if (this.current === ctrl) this.current = null;
  },
  pauseAll() {
    if (this.current) this.current.pause();
    this.current = null;
  }
};

// Shared m:ss formatter for the players below.
const formatTime = (sec) => {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
};

// ============================================
// 6. PORTFOLIO AUDIO LOGIC
// ============================================
const audioPlayers = document.querySelectorAll('.audio-item');
let currentAudio = null;

audioPlayers.forEach(item => {
  const audio = item.querySelector('audio');
  const span = item.querySelector('.overlay span');

  if (audio) {
    item.addEventListener('click', () => {
      if (audio.paused) {
        if (currentAudio && currentAudio !== audio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio.parentElement.querySelector('.overlay span').textContent = 'play';
        }
        audio.play();
        span.textContent = 'pause';
        currentAudio = audio;
      } else {
        audio.pause();
        span.textContent = 'play';
        currentAudio = null;
      }
    });

    audio.addEventListener('ended', () => {
      span.textContent = 'play';
      currentAudio = null;
    });
  }
});

// ============================================
// 7. YOUTUBE VIDEO MODAL (WORK CARDS & VIDEO ITEMS)
// ============================================
const modal = document.getElementById('video-modal');
const modalIframe = modal ? modal.querySelector('iframe') : null;
const closeModal = modal ? modal.querySelector('.close-modal') : null;
let modalReturnFocus = null;

// Function to open video modal
function openVideoModal(videoId) {
  // Stop any playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.parentElement.querySelector('.overlay span').textContent = 'play';
    currentAudio = null;
  }
  AudioBus.pauseAll();

  if (modal && modalIframe) {
    modalReturnFocus = document.activeElement;
    modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    if (closeModal) closeModal.focus();
  }
}

// Function to close video modal
function closeVideoModal() {
  if (modal && modalIframe && modal.classList.contains('open')) {
    modal.classList.remove('open');
    modalIframe.src = '';
    document.body.style.overflow = 'auto';
    window.__lenis?.start();
    if (modalReturnFocus && modalReturnFocus.focus) modalReturnFocus.focus();
    modalReturnFocus = null;
  }
}

// Close modal with × button
if (closeModal) {
  closeModal.addEventListener('click', closeVideoModal);
}

// Close modal on outside click
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeVideoModal();
  });
}

// Handle work-card clicks (Mix & Master videos)
document.querySelectorAll('.work-card').forEach(item => {
  item.addEventListener('click', () => {
    const videoId = item.getAttribute('data-video');
    if (videoId) {
      openVideoModal(videoId);
    }
  });
});

// Handle video-item clicks (Film Sound videos)
document.querySelectorAll('.video-item').forEach(item => {
  item.addEventListener('click', () => {
    const videoId = item.getAttribute('data-video');
    if (videoId) {
      openVideoModal(videoId);
    }
  });
});

// ============================================
// 8. COVER ART MODAL
// ============================================
function openCoverModal(imageSrc, title, artist) {
  let coverModal = document.getElementById('cover-modal');

  // Create modal if it doesn't exist
  if (!coverModal) {
    coverModal = document.createElement('div');
    coverModal.id = 'cover-modal';
    coverModal.className = 'modal';
    coverModal.setAttribute('role', 'dialog');
    coverModal.setAttribute('aria-modal', 'true');
    coverModal.setAttribute('aria-label', tr('cover.art', 'cover art'));
    coverModal.setAttribute('data-lenis-prevent', '');
    coverModal.innerHTML = `
      <div class="modal-content" style="max-width: 580px; aspect-ratio: auto; background: transparent; display: flex; flex-direction: column; align-items: center; position: relative; border: none; box-shadow: none;">
        <button type="button" aria-label="close" class="close-modal" id="cover-close-btn" style="position: absolute; top: -42px; right: 4px; color: var(--text-secondary); font-size: 2.2rem; cursor: pointer; z-index: 10; opacity: 0.8; transition: opacity 0.2s, color 0.2s;">&times;</button>
        <img id="cover-modal-img" src="" alt="Cover Art" style="width: 100%; height: auto; border-radius: 18px; box-shadow: 0 12px 40px rgba(0,0,0,0.75); border: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="text-align: center; margin-top: 1.4rem; color: var(--text-primary);">
          <h3 id="cover-modal-title" style="font-size: 1.35rem; font-weight: 500; letter-spacing: 0; margin-bottom: 0.25rem; font-family: inherit; color: var(--text-primary);">Title</h3>
          <p id="cover-modal-artist" style="font-size: 0.92rem; color: var(--text-muted); font-family: inherit;">Artist</p>
        </div>
      </div>
    `;
    document.body.appendChild(coverModal);

    // Close on outside click
    coverModal.addEventListener('click', function (e) {
      if (e.target === coverModal) {
        closeCoverModal();
      }
    });

    // Close with × button
    document.getElementById('cover-close-btn')?.addEventListener('click', function () {
      closeCoverModal();
    });
  }

  // Update modal content
  const img = document.getElementById('cover-modal-img');
  const titleEl = document.getElementById('cover-modal-title');
  const artistEl = document.getElementById('cover-modal-artist');

  if (img) img.src = imageSrc;
  if (titleEl) titleEl.textContent = title;
  if (artistEl) artistEl.textContent = artist;

  // Open modal
  coverReturnFocus = document.activeElement;
  coverModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  window.__lenis?.stop();
  document.getElementById('cover-close-btn')?.focus();
}

let coverReturnFocus = null;

function closeCoverModal() {
  const coverModal = document.getElementById('cover-modal');
  if (coverModal && coverModal.classList.contains('open')) {
    coverModal.classList.remove('open');
    document.body.style.overflow = 'auto';
    window.__lenis?.start();
    if (coverReturnFocus && coverReturnFocus.focus) coverReturnFocus.focus();
    coverReturnFocus = null;
  }
}

// Bind to window for global inline onclick support
window.openCoverModal = openCoverModal;
window.closeCoverModal = closeCoverModal;
window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;

// ============================================
// 9. CLOSE MODALS WITH ESCAPE KEY
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeVideoModal();
    closeCoverModal();
    if (mobileNav && mobileNav.classList.contains('open')) {
      setMobileNav(false);
      hamburger.focus();
    }
  }
});

// === SOCIAL PLACEHOLDERS ===
// Never ship a broken link: hide any button whose href is still a placeholder.
document.querySelectorAll('a[href*="REPLACE_WITH"]').forEach(a => { a.hidden = true; });
// A row left with nothing to show should not hold empty space.
document.querySelectorAll('.social-row, .footer-socials').forEach(row => {
  if (!row.querySelector('a:not([hidden])')) row.hidden = true;
});

// === HEAR MY WORK ===
document.addEventListener('click', (e) => {
  if (!isPlainClick(e)) return;
  // Start the before/after comparison inside the tap itself (mobile browsers only
  // allow audio from a direct tap), while the page scrolls to it.
  if (!e.target.closest('[data-play-featured]')) return;
  const abPlay = document.querySelector('.ab-play');
  if (abPlay && !abPlay.disabled && !document.querySelector('.ab.is-playing')) abPlay.click();
});

// === WHATSAPP DOCK (phones) === visible once the hero's own buttons are gone,
// hidden again while the contact section's button is on screen.
const waDock = document.querySelector('.wa-dock');
const heroEl = document.querySelector('.hero');
const contactEl = document.getElementById('contact');
if (waDock && heroEl && contactEl && 'IntersectionObserver' in window) {
  let pastHero = false, atContact = false;
  const sync = () => {
    const show = pastHero && !atContact;
    waDock.classList.toggle('is-visible', show);
    // Out of the tab order and the accessibility tree while hidden.
    waDock.setAttribute('aria-hidden', String(!show));
    waDock.tabIndex = show ? 0 : -1;
  };
  new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting; sync(); }, { threshold: 0.15 }).observe(heroEl);
  new IntersectionObserver(([en]) => { atContact = en.isIntersecting; sync(); }).observe(contactEl);
}

// ============================================
// 11. IN-PAGE ANCHORS → scrollToTarget()
// Delegated. The skip link is left native so it moves keyboard focus.
// ============================================
const isPlainClick = (e) =>
  !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

document.addEventListener('click', (e) => {
  if (!isPlainClick(e)) return;
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.matches('.skip-link')) return;
  const id = decodeURIComponent(a.getAttribute('href').slice(1));
  const target = id && document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  if (mobileNav && mobileNav.classList.contains('open')) setMobileNav(false);
  scrollToTarget(target);
});

// ============================================
// 13. KEYBOARD ACCESS FOR CLICKABLE CARDS
// Video tiles and cover tiles are <div>/<article> elements with click
// handlers or inline onclick. Make them focusable and operable with
// Enter / Space without rewriting the card markup.
// ============================================
document.querySelectorAll('.work-card[data-video], [onclick*="openCoverModal"]').forEach(card => {
  if (card.tagName === 'A' || card.tagName === 'BUTTON') return;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  if (!card.hasAttribute('aria-label')) {
    const heading = card.querySelector('h4, .work-title');
    const img = card.querySelector('img');
    const name = (heading && heading.textContent.trim()) || (img && img.alt) || '';
    card.setAttribute('aria-label', (card.dataset.video ? tr('card.video', 'play video: ') : tr('card.cover', 'view cover: ')) + name);
  }
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

// ============================================
// 14. SCROLL-SPY — highlight the nav link of the section in view
// ============================================
const spyLinks = document.querySelectorAll('nav a[href^="#"]');
if (spyLinks.length && 'IntersectionObserver' in window) {
  const linkFor = new Map();
  spyLinks.forEach(link => {
    const sec = document.querySelector(link.getAttribute('href'));
    if (sec) linkFor.set(sec, link);
  });

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      spyLinks.forEach(l => l.removeAttribute('aria-current'));
      const link = linkFor.get(entry.target);
      if (link) link.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  document.querySelectorAll('main > section').forEach(sec => spy.observe(sec));
}

// ============================================
// 15. "SOUNDS I'VE PRODUCED" PLAYER
// One <audio>, a main transport, and a playlist of .track buttons.
// Each track is defined by data-audio / data-title / data-meta / data-year.
// Missing files are detected up front and their rows disabled.
// ============================================
const playerEl = document.querySelector('[data-player]');
if (playerEl) {
  const audio = new Audio();
  audio.preload = 'metadata';

  const toggle = playerEl.querySelector('.player-toggle');
  const titleEl = playerEl.querySelector('.now-title');
  const metaEl = playerEl.querySelector('.now-meta');
  const seek = playerEl.querySelector('.seek');
  const tCur = playerEl.querySelector('.t-cur');
  const tDur = playerEl.querySelector('.t-dur');
  const status = playerEl.querySelector('[data-player-status]');
  const tracks = Array.from(playerEl.querySelectorAll('.track'));
  const playlistEl = playerEl.querySelector('.playlist');
  const slots = tracks.map(t => t.closest('li'));
  const nowCover = playerEl.querySelector('.now-cover');
  const ambient = playerEl.querySelector('.player-ambient');
  const dotsEl = playerEl.querySelector('.player-dots');
  // Page dots double as a track picker.
  const dots = tracks.map((t, j) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', t.dataset.title || 'track ' + (j + 1));
    if (dotsEl) dotsEl.appendChild(d);
    return d;
  });
  const skipBtns = Array.from(playerEl.querySelectorAll('.player-skip'));

  let index = -1;     // loaded track
  let view = 0;       // centred card (differs from index only while browsing an empty playlist)
  let pending = tracks.length;
  let available = 0;
  const ctrl = { pause: () => audio.pause() };

  // --- Artwork: only tracks with a data-cover get an image ---
  const coverImg = (src) => {
    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.src = src;
    return img;
  };
  tracks.forEach(btn => {
    if (btn.dataset.cover) btn.querySelector('.track-cover')?.appendChild(coverImg(btn.dataset.cover));
    // Big play / pause glyph on the centre card: shows the card itself is the play button.
    const glyph = document.createElement('span');
    glyph.className = 'track-play';
    glyph.setAttribute('aria-hidden', 'true');
    glyph.innerHTML = playerEl.querySelector('.player-toggle').innerHTML;
    btn.appendChild(glyph);
  });
  const showCover = (btn) => {
    const src = btn && btn.dataset.cover;
    if (nowCover) {
      nowCover.querySelector('img')?.remove();
      if (src) nowCover.appendChild(coverImg(src));
    }
    // The glow crossfades: the old cover fades out under the new one.
    if (ambient) {
      const current = ambient.querySelector('img:not(.is-out)');
      if (current && current.getAttribute('src') === src) return;
      if (current) {
        current.classList.add('is-out');
        setTimeout(() => current.remove(), 700);
      }
      if (src) ambient.appendChild(coverImg(src));
    }
  };

  // --- Carousel: a native horizontal scroller (snap points, the phone's own
  // momentum). Each card's distance from the centre, in cards, drives the 3D
  // tilt via --offset / --abs; the card a swipe settles on becomes the track.
  // Prev / next and autoplay still wrap from the last track to the first. ---
  const n = tracks.length;
  const wrap = (j) => ((j % n) + n) % n;

  // Next playable track in a direction, wrapping around; never the track itself.
  const availableFrom = (from, dir) => {
    for (let k = 1; k < n; k++) {
      const j = wrap(from + dir * k);
      if (!tracks[j].disabled) return j;
    }
    return -1;
  };

  const browsing = () => available === 0 || index === -1;

  // Scroll position that centres card j, and the distance between card centres
  // (cards overlap, so that's less than a card width).
  const scrollFor = (j) => slots[j].offsetLeft + slots[j].offsetWidth / 2 - playlistEl.clientWidth / 2;
  const pitch = () => (n > 1 ? slots[1].offsetLeft - slots[0].offsetLeft : 1) || 1;
  // Fractional index of the card currently in the centre.
  const centredAt = () => (playlistEl.scrollLeft - scrollFor(0)) / pitch();
  const nearest = () => Math.max(0, Math.min(n - 1, Math.round(centredAt())));

  const layoutCards = () => {
    const pos = centredAt();
    slots.forEach((li, j) => {
      const offset = j - pos;
      const abs = Math.abs(offset);
      li.style.setProperty('--offset', offset.toFixed(3));
      li.style.setProperty('--abs', Math.min(abs, 3).toFixed(3));
      const zi = String(10 - Math.round(abs));
      if (li.style.zIndex !== zi) li.style.zIndex = zi;
    });
    const c = nearest();
    dots.forEach((d, j) => {
      d.classList.toggle('is-active', j === c);
      if (j === c) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  };

  // The strip never scrolls natively: script.js owns its scrollLeft, so a
  // swipe can't fight the browser's snapping or momentum. Moves between cards
  // are an eased glide redrawn every frame.
  let tweenId = 0;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const glideTo = (x) => {
    cancelAnimationFrame(tweenId);
    const from = playlistEl.scrollLeft;
    const dist = x - from;
    if (reduceMotion || Math.abs(dist) < 1) {
      playlistEl.scrollLeft = x;
      layoutCards();
      return;
    }
    const ms = Math.min(620, 360 + Math.abs(dist) * 0.25);
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      playlistEl.scrollLeft = from + dist * easeOut(t);
      layoutCards();
      if (t < 1) tweenId = requestAnimationFrame(tick);
    };
    tweenId = requestAnimationFrame(tick);
  };

  // Bring the `view` card to the centre.
  const positionCards = (smooth = true) => {
    if (!slots[view]) return;
    if (smooth) {
      glideTo(scrollFor(view));
    } else {
      cancelAnimationFrame(tweenId);
      playlistEl.scrollLeft = scrollFor(view);
      layoutCards();
    }
  };

  // <audio> stays the source of truth. Playback eases the playhead; user
  // seeks and reduced motion set it instantly.
  const setProgress = (t, d, smooth) => {
    const pct = (d > 0 ? (t / d) * 100 : 0) + '%';
    if (smooth && hasGsap && !reduceMotion) {
      gsap.to(seek, { '--progress': pct, duration: 0.15, ease: 'none', overwrite: true });
    } else if (hasGsap) {
      gsap.set(seek, { '--progress': pct, overwrite: true });
    } else {
      seek.style.setProperty('--progress', pct);
    }
    tCur.textContent = formatTime(t);
  };

  const markUnavailable = (btn) => {
    if (btn.classList.contains('is-unavailable')) return;
    btn.classList.add('is-unavailable');
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    const meta = btn.querySelector('.track-meta');
    if (meta) { meta.dataset.i18n = 'player.soon'; meta.textContent = tr('player.soon', 'coming soon'); }
  };

  const nextAvailable = (from) => {
    for (let j = from + 1; j < tracks.length; j++) {
      if (!tracks[j].disabled) return j;
    }
    return -1;
  };

  // Lock screen / notification controls on phones.
  const updateMediaSession = (btn) => {
    if (!('mediaSession' in navigator) || !window.MediaMetadata) return;
    const [artist, title] = (btn.dataset.title || '').split(' — ');
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || artist || '',
      artist: title ? artist : 'Ocompos',
      album: 'by Ocompos',
      artwork: btn.dataset.cover
        ? [{ src: new URL(btn.dataset.cover, location.href).href, sizes: '512x512', type: 'image/webp' }]
        : []
    });
  };

  // Every track is credited the same way: mixed & mastered by Ocompos.
  const metaFor = (btn) => btn.dataset.meta || tr('player.by', 'Mixed & mastered by Ocompos');
  document.addEventListener('langchange', () => { if (index !== -1) metaEl.textContent = metaFor(tracks[index]); });

  const load = (i) => {
    index = i;
    const btn = tracks[i];
    audio.src = btn.dataset.audio;
    titleEl.textContent = btn.dataset.title || '';
    metaEl.textContent = metaFor(btn);
    tracks.forEach((t, j) => {
      t.classList.toggle('is-active', j === i);
      if (j === i) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
    seek.value = 0;
    setProgress(0, 0);
    tDur.textContent = formatTime(parseFloat(btn.dataset.duration));
    toggle.disabled = false;
    seek.disabled = false;
    playerEl.classList.remove('is-empty');
    view = i;
    showCover(btn);
    positionCards();
    updateMediaSession(btn);
  };

  const play = () => {
    AudioBus.claim(ctrl);
    audio.play().catch(() => { });
  };

  const showEmpty = () => {
    playerEl.classList.add('is-empty');
    titleEl.textContent = tr('player.empty', 'tracks coming soon');
    metaEl.textContent = tr('player.emptyMeta', 'new releases are being added');
    toggle.disabled = true;
    seek.disabled = true;
  };

  const probeDone = () => {
    pending--;
    if (pending > 0) return;
    if (available === 0) showEmpty();
    else if (index === -1) load(nextAvailable(-1));
    positionCards();
  };

  // Probe every file once so missing ones show as disabled rather than failing on click.
  // Each probe is torn down after reading metadata so it doesn't keep downloading
  // the whole file and holding a connection the other players need.
  tracks.forEach(btn => {
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.addEventListener('loadedmetadata', () => {
      btn.dataset.duration = probe.duration;
      available++;
      if (tracks[index] === btn) tDur.textContent = formatTime(probe.duration);
      probe.removeAttribute('src');
      probe.load();
      probeDone();
    }, { once: true });
    probe.addEventListener('error', () => {
      if (btn.dataset.duration) return;   // teardown above, not a missing file
      markUnavailable(btn);
      probeDone();
    }, { once: true });
    probe.src = btn.dataset.audio;
  });

  tracks.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      if (i === index) {
        if (audio.paused) play();
        else audio.pause();
      } else {
        load(i);
        play();
      }
    });
  });

  toggle.addEventListener('click', () => {
    if (index === -1) return;
    if (audio.paused) play();
    else audio.pause();
  });

  // Prev / next: jump to the neighbouring playable track, keeping playback
  // going if it was already playing. With nothing playable, just browse cards.
  const step = (dir) => {
    if (browsing()) {
      view = wrap(view + dir);
      positionCards();
      return;
    }
    const j = availableFrom(index, dir);
    if (j === -1) return;
    const wasPlaying = !audio.paused;
    load(j);
    if (wasPlaying) play();
  };

  // Jump straight to a track (dots); keeps playing if it was playing.
  const goTo = (j) => {
    if (browsing() || tracks[j].disabled) {
      view = j;
      positionCards();
      return;
    }
    if (j === index) return;
    const wasPlaying = !audio.paused;
    load(j);
    if (wasPlaying) play();
  };

  dots.forEach((d, j) => d.addEventListener('click', () => goTo(j)));

  skipBtns.forEach(b => b.addEventListener('click', () => step(parseInt(b.dataset.step, 10))));

  if ('mediaSession' in navigator) {
    const on = (action, fn) => {
      try { navigator.mediaSession.setActionHandler(action, fn); } catch (e) { /* unsupported action */ }
    };
    on('play', play);
    on('pause', () => audio.pause());
    on('previoustrack', () => step(-1));
    on('nexttrack', () => step(1));
  }

  if (playlistEl) {
    playlistEl.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
      const centre = tracks[view];
      if (centre && !centre.disabled) centre.focus({ preventScroll: true });
    });

    // --- Swipe: one card per gesture, in either direction. Vertical moves
    // belong to the page (touch-action: pan-y), so scrolling past the
    // player never drags it. The card a swipe lands on becomes the track,
    // and playback carries on with it if it was playing. ---
    const clampCard = (j) => Math.max(0, Math.min(n - 1, j));
    const selectCard = (j) => {
      j = clampCard(j);
      if (browsing() || tracks[j].disabled || j === index) {
        if (browsing() || tracks[j].disabled) view = j;
        positionCards();
        return;
      }
      const wasPlaying = !audio.paused;
      load(j);              // also glides the card to the centre
      if (wasPlaying) play();
    };

    let drag = null;
    let swallowClick = false;

    playlistEl.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.pointerType === 'mouse') e.preventDefault();   // no text selection or image ghost-drag
      cancelAnimationFrame(tweenId);
      const now = performance.now();
      drag = { id: e.pointerId, x: e.clientX, left: playlistEl.scrollLeft, lastX: e.clientX, lastT: now, v: 0, moved: false };
    });

    window.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 8) return;
        drag.moved = true;
        playlistEl.classList.add('is-dragging');
        try { playlistEl.setPointerCapture(e.pointerId); } catch (err) { /* already released */ }
      }
      const now = performance.now();
      const v = (e.clientX - drag.lastX) / Math.max(1, now - drag.lastT);
      drag.v = drag.v * 0.6 + v * 0.4;          // smoothed px/ms, for flicks
      drag.lastX = e.clientX;
      drag.lastT = now;
      playlistEl.scrollLeft = drag.left - dx;
      layoutCards();
    });

    const endDrag = (e, cancelled) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      playlistEl.classList.remove('is-dragging');
      if (!d.moved) return;                       // a tap: the card's own click handles it
      const start = clampCard(Math.round((d.left - scrollFor(0)) / pitch()));
      const dx = d.lastX - d.x;
      const far = Math.abs(dx) > pitch() * 0.18;
      const flick = Math.abs(d.v) > 0.35 && performance.now() - d.lastT < 120;
      let target = start;
      if (!cancelled && (far || flick)) target = start + ((far ? -dx : -d.v) > 0 ? 1 : -1);
      selectCard(target);
      // The drag also ends in a click on the card under the pointer; drop it.
      swallowClick = true;
      setTimeout(() => { swallowClick = false; }, 0);
    };
    window.addEventListener('pointerup', (e) => endDrag(e, false));
    window.addEventListener('pointercancel', (e) => endDrag(e, true));

    playlistEl.addEventListener('click', (e) => {
      if (!swallowClick) return;
      swallowClick = false;
      e.preventDefault();
      e.stopPropagation();
    }, true);

    // Trackpad / horizontal wheel: one card per gesture.
    let wheelAcc = 0;
    let wheelLock = 0;
    playlistEl.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;   // vertical: let the page scroll
      e.preventDefault();
      const now = performance.now();
      if (now < wheelLock) return;
      wheelAcc += e.deltaX;
      if (Math.abs(wheelAcc) < 40) return;
      const dir = wheelAcc > 0 ? 1 : -1;
      wheelAcc = 0;
      wheelLock = now + 480;
      selectCard(view + dir);
    }, { passive: false });

    // Focus moving to an off-centre card (Tab) can shift the strip; keep the tilt in step.
    playlistEl.addEventListener('scroll', () => { if (!drag) layoutCards(); }, { passive: true });

    // Card widths follow the viewport; keep the current card centred.
    let resizeFrame = 0;
    window.addEventListener('resize', () => {
      if (!resizeFrame) resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; positionCards(false); });
    });
  }

  positionCards(false);

  seek.addEventListener('input', () => {
    const t = parseFloat(seek.value);
    audio.currentTime = t;
    setProgress(t, audio.duration);
  });

  audio.addEventListener('loadedmetadata', () => {
    seek.max = audio.duration;
    tDur.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    seek.value = audio.currentTime;
    setProgress(audio.currentTime, audio.duration, true);
  });

  audio.addEventListener('play', () => {
    playerEl.classList.add('is-playing');
    toggle.setAttribute('aria-label', tr('player.pause', 'pause'));
    if (status) status.textContent = tr('player.playing', 'playing') + ' ' + (tracks[index]?.dataset.title || '');
  });

  audio.addEventListener('pause', () => {
    playerEl.classList.remove('is-playing');
    toggle.setAttribute('aria-label', tr('player.play', 'play'));
    if (status) status.textContent = tr('player.paused', 'paused');
  });

  // The playlist loops: after the last track it carries on from the first.
  audio.addEventListener('ended', () => {
    const next = availableFrom(index, 1);
    if (next !== -1) {
      load(next);
      play();
    } else {
      AudioBus.release(ctrl);
      audio.currentTime = 0;
    }
  });

  // A file that probed fine but fails at play time: disable it and move on.
  audio.addEventListener('error', () => {
    if (index === -1 || !audio.getAttribute('src')) return;
    markUnavailable(tracks[index]);
    const next = nextAvailable(index);
    if (next !== -1) load(next);
    else showEmpty();
    positionCards();
  });
}

// ============================================
// 16. BEFORE / AFTER (A/B) COMPARISON
// Each pair (raw + final) is decoded with Web Audio and played sample-locked;
// the Before/After switch crossfades two gain nodes. See the block comment.
// ============================================
const abEl = document.querySelector('[data-ab]');
if (abEl) {
  // Web Audio engine: both files are decoded once, then started on the same
  // audio-clock tick, so they stay sample-locked. Before/After is a short gain
  // crossfade, so switching is instant and click-free. This replaces two
  // <audio> elements kept in sync by seeking, which iOS Safari would not load
  // before a tap and could not keep in step.
  const BAR_COUNT = 64;
  const FADE = 0.012; // seconds: crossfade time constant

  const pairs = Array.from(abEl.querySelectorAll('.ab-pair'));
  const tabsEl = abEl.querySelector('.ab-tabs');
  const stage = abEl.querySelector('.ab-stage');
  const playBtn = abEl.querySelector('.ab-play');
  const seek = abEl.querySelector('.seek');
  const tCur = abEl.querySelector('.t-cur');
  const tDur = abEl.querySelector('.t-dur');
  const label = abEl.querySelector('.ab-label');
  const barsEl = abEl.querySelector('.ab-bars');
  const visual = abEl.querySelector('.ab-visual');
  const timeTag = abEl.querySelector('.ab-time');
  const captionTitle = abEl.querySelector('.ab-caption-title');
  const abAmbient = abEl.querySelector('.ab-ambient');
  const opts = Array.from(abEl.querySelectorAll('.ab-opt'));
  const note = abEl.querySelector('[data-ab-status]');

  let side = 'raw';
  let active = null;
  let rafId = null;
  let playedBars = 0;
  // The sweep is feedback for a user's own A/B switch only — never on load,
  // scroll-in, or programmatic state changes.
  let userHasInteracted = false;

  // ---- Audio graph (created lazily; the context can decode while suspended) ----
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let gainRaw = null;
  let gainFin = null;
  const getCtx = () => {
    if (ctx || !AC) return ctx;
    // iOS: Web Audio follows the ring/silent switch unless the session is
    // "playback" (Safari 16.4+). Without this a phone on silent hears nothing.
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* unsupported */ }
    ctx = new AC();
    gainRaw = ctx.createGain();
    gainFin = ctx.createGain();
    gainRaw.connect(ctx.destination);
    gainFin.connect(ctx.destination);
    gainRaw.gain.value = side === 'raw' ? 1 : 0;
    gainFin.gain.value = side === 'final' ? 1 : 0;
    return ctx;
  };

  // Waveform-style bars: seeded so the shape is the same on every load.
  let seed = 11;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const envelope = 0.45 + 0.55 * Math.sin((i / BAR_COUNT) * Math.PI);
    const h = Math.max(0.12, Math.min(1, envelope * (0.45 + rand() * 0.55)));
    const bar = document.createElement('span');
    bar.className = 'ab-bar';
    bar.style.setProperty('--h', h.toFixed(3));
    bar.style.setProperty('--d', (-rand() * 0.9).toFixed(2) + 's');
    barsEl.appendChild(bar);
    bars.push(bar);
  }

  const setPlayedBars = (ratio) => {
    const n = Math.round(ratio * BAR_COUNT);
    if (n === playedBars) return;
    const [lo, hi] = n > playedBars ? [playedBars, n] : [n, playedBars];
    for (let i = lo; i < hi; i++) bars[i].classList.toggle('is-played', i < n);
    playedBars = n;
  };

  const states = pairs.map((el, i) => ({
    el,
    i,
    title: el.dataset.title || 'Track ' + (i + 1),
    ok: null,          // null = not loaded yet / loading, true = decoded, false = missing
    loading: null,     // Promise while fetching + decoding
    bufRaw: null,
    bufFin: null,
    duration: 0,
    offset: 0,         // position (s) while paused
    startedAt: 0,      // ctx time that maps to position 0 while playing
    playing: false,
    srcs: null,        // the two live AudioBufferSourceNodes
    tab: null
  }));

  const position = (st) => {
    if (!st) return 0;
    if (st.playing && ctx) return Math.min(st.duration, Math.max(0, ctx.currentTime - st.startedAt));
    return st.offset;
  };

  // Live "m:ss / m:ss"
  const updateTimeTag = (st) => {
    if (!timeTag) return;
    const ready = st && st.ok === true;
    timeTag.textContent = ready
      ? formatTime(position(st)) + ' / ' + formatTime(st.duration)
      : '0:00 / –:––';
  };

  const updateTimes = (st) => {
    const d = st && st.ok === true ? st.duration : 0;
    const t = position(st);
    seek.value = t;
    seek.style.setProperty('--progress', (d > 0 ? (t / d) * 100 : 0) + '%');
    tCur.textContent = formatTime(t);
    setPlayedBars(d > 0 ? t / d : 0);
    updateTimeTag(st);
  };

  const sweep = (toFinal) => {
    if (!userHasInteracted || reduceMotion || !visual) return;
    visual.classList.remove('is-sweeping');
    visual.classList.toggle('is-reverse', !toFinal);
    void visual.offsetWidth; // restart the animation
    visual.classList.add('is-sweeping');
  };
  if (visual) {
    visual.addEventListener('animationend', (e) => {
      if (e.animationName === 'ab-sweep') visual.classList.remove('is-sweeping');
    });
  }

  const renderControls = () => {
    const st = active;
    // Play stays enabled until a file is known to be missing: the first tap
    // both unlocks audio (required on iOS) and loads the pair if needed.
    playBtn.disabled = !st || st.ok === false || !AC;
    seek.disabled = !st || st.ok !== true;
    abEl.classList.toggle('is-unavailable', !!st && (st.ok === false || !AC));
    abEl.classList.toggle('is-loading', !!st && !!st.loading && st.ok === null);
    if (!st || (st.ok === null && st.loading)) note.textContent = tr('ab.loading', 'loading…');
    else if (st.ok === false || !AC) note.textContent = tr('ab.unavailable', 'this comparison is not available yet');
    else note.textContent = tr('ab.hint', 'switch A / B while it plays: same moment, instantly.');
    if (st && st.ok === true) {
      seek.max = st.duration;
      tDur.textContent = formatTime(st.duration);
    } else {
      tDur.textContent = '0:00';
    }
    if (st) updateTimes(st);
  };

  // Language switch (i18n.js): re-render the strings this block writes itself.
  document.addEventListener('langchange', () => {
    if (label) label.textContent = side === 'raw' ? tr('ab.raw', 'RAW / ORIGINAL') : tr('ab.final', 'MIXED / MASTERED');
    if (note) renderControls();
    states.forEach(st => {
      const n = st.ok === false && st.tab && st.tab.querySelector('.ab-tab-note');
      if (n) n.textContent = tr('ab.soon', 'soon');
    });
  });

  const applySide = () => {
    abEl.dataset.side = side;
    label.textContent = side === 'raw' ? tr('ab.raw', 'RAW / ORIGINAL') : tr('ab.final', 'MIXED / MASTERED');
    opts.forEach(o => o.setAttribute('aria-pressed', String(o.dataset.side === side)));
    if (!ctx) return;
    const t = ctx.currentTime;
    gainRaw.gain.cancelScheduledValues(t);
    gainFin.gain.cancelScheduledValues(t);
    gainRaw.gain.setTargetAtTime(side === 'raw' ? 1 : 0, t, FADE);
    gainFin.gain.setTargetAtTime(side === 'final' ? 1 : 0, t, FADE);
  };

  const markPairUnavailable = (st) => {
    if (st.ok === false) return;
    st.ok = false;
    st.loading = null;
    st.tab.classList.add('is-unavailable');
    st.tab.querySelector('.ab-tab-note').textContent = tr('ab.soon', 'soon');
    if (st === active) renderControls();
  };

  // Safari < 14.1 only has the callback form of decodeAudioData.
  const decode = (c, data) => new Promise((resolve, reject) => {
    const p = c.decodeAudioData(data, resolve, reject);
    if (p && p.then) p.then(resolve, reject);
  });

  const loadPair = (st) => {
    if (st.ok === true) return Promise.resolve(true);
    if (st.ok === false || !AC) return Promise.resolve(false);
    if (st.loading) return st.loading;
    const c = getCtx();
    const fetchBuf = (url) => fetch(url).then(r => {
      if (!r.ok) throw new Error(r.status + ' ' + url);
      return r.arrayBuffer();
    }).then(data => decode(c, data));
    st.loading = Promise.all([fetchBuf(st.el.dataset.before), fetchBuf(st.el.dataset.after)])
      .then(([raw, fin]) => {
        st.bufRaw = raw;
        st.bufFin = fin;
        // Raw is the reference length; the final may differ by a few ms.
        st.duration = Math.min(raw.duration, fin.duration);
        st.ok = true;
        st.loading = null;
        if (st === active) renderControls();
        return true;
      })
      .catch(() => {
        markPairUnavailable(st);
        return false;
      });
    if (st === active) renderControls();
    return st.loading;
  };

  const stopLoop = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  };

  const tick = () => {
    const st = active;
    if (!st || !st.playing) {
      rafId = null;
      return;
    }
    updateTimes(st);
    rafId = requestAnimationFrame(tick);
  };

  const setPlayingUI = (on) => {
    abEl.classList.toggle('is-playing', on);
    playBtn.setAttribute('aria-label', on ? tr('player.pause', 'pause') : tr('player.play', 'play'));
  };

  const stopSources = (st) => {
    if (!st.srcs) return;
    st.srcs.forEach(s => {
      s.onended = null;
      try { s.stop(); } catch (e) { /* already stopped */ }
      s.disconnect();
    });
    st.srcs = null;
  };

  const pausePair = (st) => {
    if (!st) return;
    st.wantPlay = false;
    if (st.playing) st.offset = position(st);
    st.playing = false;
    stopSources(st);
    if (st === active) {
      stopLoop();
      setPlayingUI(false);
      updateTimes(st);
    }
  };

  const ctrl = { pause: () => pausePair(active) };

  const onEnded = (st) => {
    pausePair(st);
    st.offset = 0;
    AudioBus.release(ctrl);
    if (st === active) updateTimes(st);
  };

  // Start both buffers on the same audio-clock instant, from `from` seconds.
  const startSources = (st, from) => {
    stopSources(st);
    const c = ctx;
    const when = c.currentTime + 0.03;
    const mk = (buf, gain) => {
      const s = c.createBufferSource();
      s.buffer = buf;
      s.connect(gain);
      s.start(when, from);
      return s;
    };
    const raw = mk(st.bufRaw, gainRaw);
    const fin = mk(st.bufFin, gainFin);
    raw.onended = () => { if (st.srcs && st.srcs[0] === raw) onEnded(st); };
    st.srcs = [raw, fin];
    st.startedAt = when - from;
    st.playing = true;
  };

  const playPair = (st) => {
    if (!st || st.ok === false) return;
    const c = getCtx();
    if (!c) return;
    AudioBus.claim(ctrl);
    st.wantPlay = true;
    // resume() must be called inside the tap itself to unlock audio on iOS.
    const resumed = c.state === 'running' ? Promise.resolve() : c.resume();
    setPlayingUI(true);
    Promise.all([resumed, loadPair(st)]).then(([, ok]) => {
      // Paused, switched track, or failed while loading.
      if (!ok || !st.wantPlay || st !== active) {
        if (st === active && !st.playing) setPlayingUI(false);
        return;
      }
      if (st.offset >= st.duration - 0.05) st.offset = 0;
      startSources(st, st.offset);
      if (!rafId) rafId = requestAnimationFrame(tick);
    }).catch(() => pausePair(st));
  };

  const seekTo = (st, t) => {
    if (!st || st.ok !== true) return;
    t = Math.max(0, Math.min(st.duration - 0.05, t));
    st.offset = t;
    if (st.playing) startSources(st, t);
    updateTimes(st);
  };

  const select = (st, focus) => {
    if (active && active !== st) pausePair(active);
    active = st;
    playedBars = 0;
    bars.forEach(b => b.classList.remove('is-played'));
    states.forEach(s => {
      const on = s === st;
      s.tab.setAttribute('aria-selected', String(on));
      s.tab.tabIndex = on ? 0 : -1;
    });
    if (focus) st.tab.focus();
    if (captionTitle) captionTitle.textContent = st.title;
    // The pair's cover, if any, tints the glow behind the glass.
    if (abAmbient) {
      abAmbient.querySelector('img')?.remove();
      if (st.el.dataset.cover) {
        const img = new Image();
        img.alt = '';
        img.decoding = 'async';
        img.src = st.el.dataset.cover;
        abAmbient.appendChild(img);
      }
    }
    positionInk();
    renderControls();
    // Already near the section: fetch this pair now so play starts instantly.
    if (nearView) loadPair(st);
  };

  // Sliding active underline for the segmented tabs (transform only).
  const ink = document.createElement('span');
  ink.className = 'ab-tabs-ink';
  ink.setAttribute('aria-hidden', 'true');
  const positionInk = () => {
    const tab = active && active.tab;
    if (!tab) return;
    // Pill highlight behind the active chip: size snaps, only the move animates.
    ink.style.width = tab.offsetWidth + 'px';
    ink.style.height = tab.offsetHeight + 'px';
    ink.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
  };

  // Build tabs
  stage.id = stage.id || 'ab-stage';
  stage.setAttribute('role', 'tabpanel');
  states.forEach(st => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'ab-tab';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', stage.id);
    tab.innerHTML = '<span class="ab-tab-title"></span><span class="ab-tab-note"></span>';
    tab.querySelector('.ab-tab-title').textContent = st.title;
    tab.addEventListener('click', () => select(st));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      select(states[(st.i + dir + states.length) % states.length], true);
    });
    tabsEl.appendChild(tab);
    st.tab = tab;
  });
  tabsEl.appendChild(ink);
  tabsEl.classList.toggle('is-single', states.length < 2);
  // Chips change width when a "soon" note is added; keep the pill fitted.
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(positionInk);
    ro.observe(tabsEl);
    states.forEach(st => ro.observe(st.tab));
  }

  // Download + decode only when the section comes near the viewport
  // (~1.2 MB per pair), not on page load.
  let nearView = false;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      nearView = true;
      if (active) loadPair(active);
    }, { rootMargin: '600px 0px' });
    io.observe(abEl);
  } else {
    nearView = true;
  }

  playBtn.addEventListener('click', () => {
    if (!active) return;
    if (active.wantPlay) pausePair(active);
    else playPair(active);
  });

  seek.addEventListener('input', () => seekTo(active, parseFloat(seek.value)));

  // The waveform is the visible progress bar: click a point to jump there.
  barsEl.addEventListener('click', (e) => {
    if (!active || active.ok !== true) return;
    const r = barsEl.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    seekTo(active, ratio * active.duration);
  });

  // Buttons fire click for Enter/Space too, so this covers keyboard toggles.
  opts.forEach(o => o.addEventListener('click', () => {
    userHasInteracted = true;
    if (o.dataset.side === side) return;
    side = o.dataset.side;
    applySide();
    if (active) updateTimeTag(active);
    sweep(side === 'final');
  }));

  // Pause when the tab is hidden (phone locked, app switched): an
  // AudioContext would otherwise keep playing in the background.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && active && active.playing) pausePair(active);
  });

  applySide();
  if (states.length) select(states[0]);
}

// ============================================
// 17. CONSOLE LOG (optional)
// ============================================
console.log('🎵 ByOcompos - Audio Engineer');
console.log('📧 contact@byocompos.com');

// ============================================
// 16. SCROLL AWAY = STOP
// Leaving a player's section (down to the next one, or back up) pauses
// whatever it is playing, so music never follows the visitor down the page.
// ============================================
if ('IntersectionObserver' in window) {
  const stopWhenLeft = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.intersectionRatio < 0.25 && en.target.classList.contains('is-playing')) AudioBus.pauseAll();
    });
  }, { threshold: [0, 0.25] });
  document.querySelectorAll('[data-player], [data-ab]').forEach((el) => stopWhenLeft.observe(el));
}
