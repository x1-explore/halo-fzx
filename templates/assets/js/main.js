/**
 * FZX Theme · 方舟星系
 * Main JavaScript — Starfield, Interactions & Animations
 */

(function () {
  'use strict';

  const COLOR_STORAGE_KEY = 'fzx-color-scheme';
  const COLOR_SOURCE_KEY = 'fzx-color-scheme-source';

  /* ============================================================
     Color Scheme Toggle (Light / Dark)
   ============================================================ */
  function initColorScheme() {
    const toggles = document.querySelectorAll('[data-fzx-theme-toggle]');
    if (!toggles.length) return;

    const doc = document.documentElement;

    const getStoredScheme = () => {
      try {
        const saved = localStorage.getItem(COLOR_STORAGE_KEY);
        const source = localStorage.getItem(COLOR_SOURCE_KEY);
        if (source === 'user' && (saved === 'light' || saved === 'dark')) {
          return saved;
        }
        // Clean legacy value only when key exists but source is missing/null
        if (!source && saved) {
          localStorage.removeItem(COLOR_STORAGE_KEY);
        }
      } catch (err) {
        console.warn('Unable to read theme preference', err);
      }
      return null;
    };

    const rememberUserChoice = (value) => {
      try {
        localStorage.setItem(COLOR_STORAGE_KEY, value);
        localStorage.setItem(COLOR_SOURCE_KEY, 'user');
      } catch (err) {
        console.warn('Unable to persist theme', err);
      }
    };

    const getDefaultScheme = () => {
      const preset = (doc.dataset.defaultTheme || 'light').toLowerCase();
      if (preset === 'system') {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
      if (preset === 'dark') return 'dark';
      return 'light';
    };

    const applyScheme = (mode, persist = true) => {
      const value = mode === 'light' ? 'light' : 'dark';
      doc.setAttribute('data-theme', value);
      doc.classList.toggle('fzx-theme-light', value === 'light');
      doc.classList.toggle('fzx-theme-dark', value !== 'light');
      if (persist) {
        rememberUserChoice(value);
      }
      toggles.forEach((btn) => btn.setAttribute('data-active-mode', value));
    };

    const saved = getStoredScheme();
    applyScheme(saved || getDefaultScheme(), false);

    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = doc.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        applyScheme(next);
      });
    });

    if (window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: light)');
      mql.addEventListener('change', (e) => {
        // Only react to system change when user did not explicitly choose
        if (!getStoredScheme()) {
          applyScheme(e.matches ? 'light' : 'dark', false);
        }
      });
    }
  }

  /* ============================================================
     Starfield Canvas Animation
  ============================================================ */
  function initStarfield() {
    const canvas = document.getElementById('fzx-starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let rafId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function randomBetween(a, b) {
      return a + Math.random() * (b - a);
    }

    const STAR_COLORS = [
      // [color template, weight]
      ['rgba(226,232,240,{a})', 40],
      ['rgba(148,163,184,{a})', 30],
      ['rgba(129,140,248,{a})', 14],
      ['rgba(167,139,250,{a})', 8],
      ['rgba(34,211,238,{a})',  5],
      ['rgba(244,114,182,{a})', 3],
    ];

    const STAR_COLORS_LIGHT = [
      ['rgba(99,102,241,{a})', 40],
      ['rgba(129,140,248,{a})', 30],
      ['rgba(167,139,250,{a})', 14],
      ['rgba(236,72,153,{a})',  8],
      ['rgba(8,145,178,{a})',   5],
      ['rgba(251,191,36,{a})',  3],
    ];

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

    function pickColor() {
      const palette = isLight() ? STAR_COLORS_LIGHT : STAR_COLORS;
      const totalW = palette.reduce((s, [, w]) => s + w, 0);
      let r = Math.random() * totalW;
      for (const [tpl, w] of palette) {
        r -= w;
        if (r <= 0) return tpl;
      }
      return palette[0][0];
    }

    function createStars() {
      stars = [];
      const density = Math.floor((canvas.width * canvas.height) / 3800);

      for (let i = 0; i < density; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: randomBetween(0.3, 1.8),
          speed: randomBetween(0.05, 0.35),
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: randomBetween(0.008, 0.025),
          colorTpl: pickColor(),
          bright: false,
        });
      }

      // Bright accent stars
      for (let i = 0; i < 18; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: randomBetween(1.5, 2.8),
          speed: randomBetween(0.03, 0.12),
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: randomBetween(0.015, 0.04),
          colorTpl: pickColor(),
          bright: true,
        });
      }
    }

    function drawStar(s) {
      s.phase += s.phaseSpeed;
      const opacity = 0.25 + Math.abs(Math.sin(s.phase)) * 0.75;
      const color = s.colorTpl.replace('{a}', opacity.toFixed(3));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (s.bright) {
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 5);
        grd.addColorStop(0, color);
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Drift upward
      s.y -= s.speed;
      if (s.y < -s.size * 6) {
        s.y = canvas.height + s.size * 6;
        s.x = Math.random() * canvas.width;
      }
    }

    function drawNebula() {
      // Subtle background nebula glow — rendered once on top of clear
      const cx = canvas.width * 0.7;
      const cy = canvas.height * 0.3;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400);
      grd.addColorStop(0, 'rgba(129,140,248,0.04)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx2 = canvas.width * 0.2;
      const cy2 = canvas.height * 0.7;
      const grd2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 350);
      grd2.addColorStop(0, 'rgba(244,114,182,0.025)');
      grd2.addColorStop(1, 'transparent');
      ctx.fillStyle = grd2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let frameCount = 0;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Redraw nebula every 120 frames
      if (frameCount % 120 === 0) drawNebula();
      frameCount++;

      for (const s of stars) drawStar(s);

      rafId = requestAnimationFrame(animate);
    }

    /* Shooting stars */
    function spawnShootingStar() {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height * 0.5;
      const angleDeg = randomBetween(15, 50);
      const rad = (angleDeg * Math.PI) / 180;
      const length = randomBetween(80, 180);
      const speed = randomBetween(0.015, 0.03);
      let t = 0;

      function draw() {
        if (t > 1) return;
        const x1 = startX + Math.cos(rad) * length * Math.max(0, t - 0.3);
        const y1 = startY + Math.sin(rad) * length * Math.max(0, t - 0.3);
        const x2 = startX + Math.cos(rad) * length * t;
        const y2 = startY + Math.sin(rad) * length * t;
        const opacity = (1 - t) * 0.9;

        const grd = ctx.createLinearGradient(x1, y1, x2, y2);
        grd.addColorStop(0, 'transparent');
        grd.addColorStop(1, `rgba(255,255,255,${opacity})`);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        t += speed;
        requestAnimationFrame(draw);
      }

      draw();
    }

    function scheduleShootingStar() {
      const delay = randomBetween(3000, 9000);
      setTimeout(() => {
        spawnShootingStar();
        scheduleShootingStar();
      }, delay);
    }

    resize();
    createStars();
    animate();
    scheduleShootingStar();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      createStars();
    });
    resizeObserver.observe(document.body);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        animate();
      }
    });
  }

  /* ============================================================
     Scrolled Header
  ============================================================ */
  function initHeader() {
    const header = document.querySelector('.fzx-header');
    if (!header) return;

    const update = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ============================================================
     Reading Progress Bar
  ============================================================ */
  function initReadingProgress() {
    const bar = document.getElementById('fzx-reading-progress');
    if (!bar) return;

    const update = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return;
      bar.style.width = Math.min(100, (window.scrollY / docH) * 100) + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
  }

  /* ============================================================
     Mobile Menu
  ============================================================ */
  function initMobileMenu() {
    const toggleBtn = document.getElementById('fzx-menu-toggle');
    const menu = document.getElementById('fzx-mobile-menu');
    const closeBtn = document.getElementById('fzx-mobile-close');

    if (!toggleBtn || !menu) return;

    const open = () => {
      menu.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      menu.classList.remove('open');
      document.body.style.overflow = '';
    };

    toggleBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);

    menu.addEventListener('click', (e) => {
      if (e.target === menu) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) close();
    });
  }

  /* ============================================================
     Search Overlay
  ============================================================ */
  function initSearch() {
    const btn = document.getElementById('fzx-search-btn');
    const overlay = document.getElementById('fzx-search-overlay');
    const input = document.getElementById('fzx-search-input');
    const resultsBox = document.getElementById('fzx-search-results');

    if (!btn || !overlay) return;

    const open = () => {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input && input.focus(), 80);
    };

    const close = () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      if (resultsBox) resultsBox.innerHTML = '';
      if (input) input.value = '';
    };

    btn.addEventListener('click', open);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Live search as user types
    if (input && resultsBox) {
      let searchTimer;
      input.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          const q = input.value.trim().toLowerCase();
          if (!q) { resultsBox.innerHTML = ''; return; }

          const posts = window.__fzxPosts || [];
          const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          const matches = posts.filter((p) => p.t && p.t.toLowerCase().includes(q)).slice(0, 8);

          if (!matches.length) {
            resultsBox.innerHTML = '<p class="fzx-search-empty">未找到相关文章</p>';
          } else {
            resultsBox.innerHTML = matches
              .map((p) => {
                const safe = p.t
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
                const hl = safe.replace(re, (m) => `<mark>${m}</mark>`);
                const safeUrl = p.u.replace(/"/g, '%22').replace(/'/g, '%27');
                return `<a class="fzx-search-result-item" href="${safeUrl}">${hl}</a>`;
              })
              .join('');
          }
        }, 180);
      });

      // Arrow key navigation from input into results
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const first = resultsBox.querySelector('.fzx-search-result-item');
          if (first) first.focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const form = input.closest('form');
          if (!form) return;
          if (form.requestSubmit) {
            form.requestSubmit();
          } else if (form.checkValidity()) {
            form.submit();
          }
        }
      });

      // Arrow key navigation within results
      resultsBox.addEventListener('keydown', (e) => {
        const items = [...resultsBox.querySelectorAll('.fzx-search-result-item')];
        const idx = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (idx < items.length - 1) items[idx + 1].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (idx > 0) items[idx - 1].focus();
          else input.focus();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
    });
  }


  /* ============================================================
     Back to Top
  ============================================================ */
  function initBackToTop() {
    const btn = document.getElementById('fzx-back-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ============================================================
     Table of Contents (auto-generate in post)
  ============================================================ */
  function initTOC() {
    const tocEl = document.querySelector('.fzx-toc-scroll');
    const content = document.getElementById('fzx-post-content');

    if (!tocEl || !content) return;

    const headings = content.querySelectorAll('h1, h2, h3, h4');

    if (headings.length < 2) {
      const widget = document.querySelector('.fzx-toc-widget');
      if (widget) widget.style.display = 'none';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'fzx-toc-list';

    headings.forEach((h, i) => {
      const id = h.id || `fzx-h-${i}`;
      h.id = id;

      const li = document.createElement('li');
      const tag = h.tagName.toLowerCase();
      li.className = `fzx-toc-item fzx-toc-${tag}`;

      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = h.textContent;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      li.appendChild(a);
      ul.appendChild(li);
    });

    tocEl.appendChild(ul);

    // Highlight active heading
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const a = tocEl.querySelector(`a[href="#${entry.target.id}"]`);
          if (!a) continue;
          tocEl.querySelectorAll('a').forEach((x) => x.classList.remove('active'));
          a.classList.add('active');
          break;
        }
      }
    }, { rootMargin: '-15% 0px -70% 0px' });

    headings.forEach((h) => io.observe(h));
  }

  /* ============================================================
     Copy Code Button
  ============================================================ */
  function initCopyCode() {
    document.querySelectorAll('.fzx-prose pre').forEach((pre) => {
      const btn = document.createElement('button');
      btn.className = 'fzx-copy-btn';
      btn.textContent = '复制';

      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code');
        const text = code ? code.textContent : pre.textContent;

        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = '已复制!';
          btn.style.cssText += 'color:#22d3ee;border-color:rgba(34,211,238,0.4)';
        } catch {
          btn.textContent = '失败';
        }

        setTimeout(() => {
          btn.textContent = '复制';
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2200);
      });

      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  /* ============================================================
     Scroll Reveal (Intersection Observer)
  ============================================================ */
  function initScrollReveal() {
    const els = document.querySelectorAll('.fzx-reveal');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    els.forEach((el) => io.observe(el));
  }

  /* ============================================================
     Image Lightbox
  ============================================================ */
  function initLightbox() {
    const prose = document.querySelector('.fzx-prose');
    if (!prose) return;

    // Reuse the lightbox element injected by layout.html
    const lightbox = document.getElementById('fzx-lightbox');
    if (!lightbox) return;

    const img = document.createElement('img');
    lightbox.appendChild(img);

    prose.querySelectorAll('img').forEach((source) => {
      source.style.cursor = 'zoom-in';
      source.addEventListener('click', () => {
        img.src = source.src;
        img.alt = source.alt || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ============================================================
     Hero Mouse Parallax (subtle cursor glow)
  ============================================================ */
  function initHeroParallax() {
    const hero = document.querySelector('.fzx-hero');
    if (!hero) return;

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 20;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 10;
      hero.querySelector('.fzx-hero-content').style.transform =
        `translate(${x}px, ${y}px)`;
    });

    hero.addEventListener('mouseleave', () => {
      const el = hero.querySelector('.fzx-hero-content');
      if (el) el.style.transform = '';
    });
  }

  /* ============================================================
     Post Card — full-area click navigation
  ============================================================ */
  function initCardNavigation() {
    document.querySelectorAll('.fzx-post-card[data-href]').forEach((card) => {
      const href = card.dataset.href;
      if (!href) return;

      // Mouse click: support modifier keys for open-in-new-tab
      card.addEventListener('click', (e) => {
        // Let natural link clicks (category badges, tag links) work normally
        if (e.target.closest('a')) return;
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
          window.open(href, '_blank', 'noopener');
          return;
        }
        window.location.assign(href);
      });

      // Middle-mouse click: open in new tab (auxclick fires reliably for button 1)
      card.addEventListener('auxclick', (e) => {
        if (e.button !== 1) return;
        if (e.target.closest('a')) return;
        e.preventDefault();
        window.open(href, '_blank', 'noopener');
      });

      // Keyboard: activate on Enter or Space when the card itself is focused
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            window.open(href, '_blank', 'noopener');
          } else {
            window.location.assign(href);
          }
        }
      });
    });
  }

  /* ============================================================
     Init
  ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initColorScheme();
    initStarfield();
    initHeader();
    initReadingProgress();
    initMobileMenu();
    initSearch();
    initBackToTop();
    initTOC();
    initCopyCode();
    initScrollReveal();
    initLightbox();
    initHeroParallax();
    initCardNavigation();
  });
})();
