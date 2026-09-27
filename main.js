/* =====================================================================
   Mahathir Mohamed — Portfolio interactions
   ---------------------------------------------------------------------
   Plain JavaScript, no libraries. Each feature is its own small function,
   and they are all started at the bottom of this file.

   1.  Page loader
   2.  Profile photo fallback
   3.  Navigation (scroll style, mobile menu, active section indicator)
   4.  Scroll-reveal animations
   5.  Hero: mouse parallax on the 3D stage
   6.  Hero: floating data points (canvas)
   7.  Card tilt effect
   8.  Skills filter
   9.  Domain network highlight
   10. Project case-study modal
   11. Journey timeline (progress line + expand/collapse)
   12. Copy email button
   ===================================================================== */

// Does the visitor prefer less motion? (a setting in their operating system)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Is this a device with a real mouse? (tilt/parallax are skipped on touch screens)
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;


/* ---------------------------------------------------------------------
   1. PAGE LOADER — fades out once the page has loaded
   --------------------------------------------------------------------- */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const hide = () => loader.classList.add('is-hidden');

  if (prefersReducedMotion) { hide(); return; }
  if (document.readyState === 'complete') setTimeout(hide, 250);
  else window.addEventListener('load', () => setTimeout(hide, 250));

  // Safety net: never keep the loader longer than 2.5 seconds
  setTimeout(hide, 2500);
}


/* ---------------------------------------------------------------------
   2. PROFILE PHOTO FALLBACK — shows "MM" initials if the photo is missing
   --------------------------------------------------------------------- */
function initPhotoFallback() {
  const frame = document.getElementById('photoFrame');
  if (!frame) return;
  const img = frame.querySelector('img');

  const showFallback = () => frame.classList.add('is-missing');
  img.addEventListener('error', showFallback);
  // In case the error happened before this script ran
  if (img.complete && img.naturalWidth === 0) showFallback();
}


/* ---------------------------------------------------------------------
   3. NAVIGATION
   --------------------------------------------------------------------- */
function initNavigation() {
  const header = document.getElementById('header');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const links = document.querySelectorAll('.nav__link');
  const indicator = document.querySelector('.nav__indicator');

  // a) Add a background to the header after scrolling a little
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // b) Mobile menu open / close
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  links.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 960) setMenu(false); });

  // c) Highlight the link for the section currently on screen.
  //    Each <section> has data-nav="..." telling us which link it belongs to.
  const moveIndicator = (link) => {
    if (!indicator || !link) return;
    indicator.style.width = `${link.offsetWidth - 28}px`;
    indicator.style.transform = `translateX(${link.offsetLeft + 14}px)`;
    indicator.classList.add('is-ready');
  };

  const setActive = (name) => {
    links.forEach((link) => {
      const isActive = link.dataset.link === name;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
        moveIndicator(link);
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const sections = document.querySelectorAll('section[data-nav]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.dataset.nav);
    });
  }, { rootMargin: '-45% 0px -50% 0px' }); // a thin line across the middle of the screen
  sections.forEach((section) => observer.observe(section));

  window.addEventListener('resize', () => moveIndicator(document.querySelector('.nav__link.is-active')));
  // Fonts can change link widths after loading
  if (document.fonts) document.fonts.ready.then(() => moveIndicator(document.querySelector('.nav__link.is-active')));
}


/* ---------------------------------------------------------------------
   4. SCROLL-REVEAL — adds "is-visible" to .reveal elements as they appear
   --------------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target); // animate only once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el) => observer.observe(el));
}


/* ---------------------------------------------------------------------
   5. HERO PARALLAX — the photo stage tilts slightly and each layer
      moves by its own data-depth when the mouse moves over the hero.
   --------------------------------------------------------------------- */
function initHeroParallax() {
  const hero = document.getElementById('home');
  const stage = document.getElementById('heroStage');
  if (!hero || !stage || prefersReducedMotion || !hasFinePointer) return;

  const layers = stage.querySelectorAll('[data-depth]');
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0, rafId = null;

  const render = () => {
    // Ease towards the target for a smooth, calm motion
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    stage.style.transform = `rotateY(${currentX * 7}deg) rotateX(${-currentY * 7}deg)`;
    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth) || 0;
      layer.style.setProperty('--px', `${currentX * depth}px`);
      layer.style.setProperty('--py', `${currentY * depth}px`);
    });

    if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
      rafId = requestAnimationFrame(render);
    } else {
      rafId = null;
    }
  };
  const start = () => { if (!rafId) rafId = requestAnimationFrame(render); };

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 … 0.5
    targetY = (e.clientY - rect.top) / rect.height - 0.5;
    start();
  });
  hero.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; start(); });
}


/* ---------------------------------------------------------------------
   6. HERO DATA POINTS — a few slow-moving dots joined by faint lines.
      Pauses when the hero is off-screen to save battery.
   --------------------------------------------------------------------- */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;

  let width = 0, height = 0, points = [], running = false, rafId = null;
  const LINK_DISTANCE = 130;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = width < 700 ? 18 : 42;
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 1,
      accent: Math.random() < 0.08   // a few orange points
    }));
    draw();
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    // Lines between nearby points
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DISTANCE) {
          ctx.strokeStyle = `rgba(10, 61, 98, ${0.10 * (1 - dist / LINK_DISTANCE)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }
    // The points themselves
    points.forEach((p) => {
      ctx.fillStyle = p.accent ? 'rgba(255, 122, 0, .55)' : 'rgba(10, 61, 98, .28)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const step = () => {
    points.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });
    draw();
    if (running) rafId = requestAnimationFrame(step);
  };

  const play = () => { if (!running && !prefersReducedMotion) { running = true; rafId = requestAnimationFrame(step); } };
  const pause = () => { running = false; cancelAnimationFrame(rafId); };

  resize();
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

  // Only animate while the hero is visible and the tab is active
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause())).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
}


/* ---------------------------------------------------------------------
   7. CARD TILT — cards with data-tilt lean slightly towards the mouse
   --------------------------------------------------------------------- */
function initTilt() {
  if (prefersReducedMotion || !hasFinePointer) return;
  const MAX_TILT = 4; // degrees — kept small on purpose

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0 … 1
      const y = (e.clientY - rect.top) / rect.height;
      card.style.setProperty('--ry', `${(x - 0.5) * MAX_TILT}deg`);
      card.style.setProperty('--rx', `${(0.5 - y) * MAX_TILT}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}


/* ---------------------------------------------------------------------
   8. SKILLS FILTER — the category buttons above the toolkit grid
   --------------------------------------------------------------------- */
function initSkillFilter() {
  const buttons = document.querySelectorAll('.filter');
  const skills = document.querySelectorAll('.skill');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      buttons.forEach((b) => {
        const active = b === button;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      skills.forEach((skill, index) => {
        const show = filter === 'all' || skill.dataset.cat === filter;
        skill.classList.toggle('is-hidden', !show);
        skill.classList.remove('is-entering');
        if (show && !prefersReducedMotion) {
          void skill.offsetWidth; // restart the animation
          skill.style.animationDelay = `${(index % 6) * 40}ms`;
          skill.classList.add('is-entering');
        }
      });
    });
  });
}


/* ---------------------------------------------------------------------
   9. DOMAIN NETWORK — hovering/focusing a card lights up its node
   --------------------------------------------------------------------- */
function initDomainNetwork() {
  const network = document.getElementById('network');
  const items = document.querySelectorAll('.domain__item');
  if (!network) return;

  const highlight = (id) => {
    network.querySelectorAll('[data-node]').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.node === id);
    });
    items.forEach((item) => item.classList.toggle('is-active', item.dataset.node === id));
  };

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => highlight(item.dataset.node));
    item.addEventListener('focus', () => highlight(item.dataset.node));
    item.addEventListener('mouseleave', () => highlight(null));
    item.addEventListener('blur', () => highlight(null));
  });
}


/* ---------------------------------------------------------------------
   10. CASE-STUDY MODAL
       Each "View Case Study" button has data-case="case-1" etc.
       We copy the matching <template id="case-1"> into the popup.
   --------------------------------------------------------------------- */
function initModal() {
  const modal = document.getElementById('caseModal');
  const body = document.getElementById('modalBody');
  if (!modal) return;

  let lastFocused = null;

  const open = (templateId) => {
    const template = document.getElementById(templateId);
    if (!template) return;

    lastFocused = document.activeElement;
    body.innerHTML = '';
    body.appendChild(template.content.cloneNode(true));
    modal.hidden = false;
    modal.classList.remove('is-closing');
    document.body.classList.add('modal-open');
    modal.querySelector('.modal__panel').scrollTop = 0;
    modal.querySelector('.modal__close').focus();
  };

  const close = () => {
    if (modal.hidden) return;
    const finish = () => {
      modal.hidden = true;
      modal.classList.remove('is-closing');
      document.body.classList.remove('modal-open');
      if (lastFocused) lastFocused.focus();
    };
    if (prefersReducedMotion) { finish(); return; }
    modal.classList.add('is-closing');
    setTimeout(finish, 240);
  };

  document.querySelectorAll('[data-case]').forEach((button) => {
    button.addEventListener('click', () => open(button.dataset.case));
  });
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));

  // Keyboard: Escape closes, Tab stays inside the popup
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}


/* ---------------------------------------------------------------------
   11. JOURNEY TIMELINE
       a) The blue line fills as you scroll through the section
       b) Clicking a milestone opens / closes its details
   --------------------------------------------------------------------- */
function initTimeline() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  // a) Progress line
  const updateProgress = () => {
    const rect = timeline.getBoundingClientRect();
    const viewportMiddle = window.innerHeight * 0.6;
    const progress = (viewportMiddle - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, progress));
    timeline.style.setProperty('--progress', `${clamped * 100}%`);
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  // b) Expand / collapse
  timeline.querySelectorAll('.timeline__head').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.timeline__item');
      const isOpen = item.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // Open the "Today" milestone by default so visitors see how it works
  const now = timeline.querySelector('.timeline__item--now .timeline__head');
  if (now) now.click();
}


/* ---------------------------------------------------------------------
   12. COPY EMAIL BUTTON
   --------------------------------------------------------------------- */
function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = 'Copied';
        button.classList.add('is-done');
        setTimeout(() => {
          button.textContent = 'Copy';
          button.classList.remove('is-done');
        }, 1800);
      } catch {
        // Clipboard not available (e.g. opened as a local file in some browsers) — do nothing
      }
    });
  });
}


/* ---------------------------------------------------------------------
   START EVERYTHING
   --------------------------------------------------------------------- */
initLoader();
initPhotoFallback();
initNavigation();
initReveal();
initHeroParallax();
initHeroCanvas();
initTilt();
initSkillFilter();
initDomainNetwork();
initModal();
initTimeline();
initCopyButtons();
