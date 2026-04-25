/* ═══════════════════════════════════════════
   SSV Tours & Travels — main.js
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ─────────────────────────────────────────
     1. NAVBAR — scroll effect + active links
  ───────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', function () {
    // Scrolled class for shadow
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlight
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─────────────────────────────────────────
     2. MOBILE MENU — hamburger toggle
  ───────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('mobileDrawer');

  hamburger.addEventListener('click', function () {
    this.classList.toggle('open');
    drawer.classList.toggle('open');
  });

  // Close on mobile link click
  drawer.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', function () {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (
      drawer.classList.contains('open') &&
      !e.target.closest('#mobileDrawer') &&
      !e.target.closest('#hamburger')
    ) {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
    }
  });

  /* ─────────────────────────────────────────
     3. SCROLL REVEAL — intersection observer
  ───────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  /* ─────────────────────────────────────────
     4. FLEET — filter pills
  ───────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.fpill');
  const allCards   = document.querySelectorAll('.vcard');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      // Active state
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.dataset.filter;

      allCards.forEach(card => {
        if (filter === 'all' || card.dataset.cat === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });

      // Reset scroll to start after filter
      track.scrollTo({ left: 0, behavior: 'smooth' });
      updateDots();
    });
  });

  /* ─────────────────────────────────────────
     5. FLEET — horizontal scroll with
        arrow buttons + drag-to-scroll + dots
  ───────────────────────────────────────── */
  const track    = document.getElementById('fleetTrack');
  const prevBtn  = document.getElementById('fleetPrev');
  const nextBtn  = document.getElementById('fleetNext');
  const dotsWrap = document.getElementById('fleetDots');

  // Card width + gap
  const CARD_W = 300 + 24; // 300px card + 24px gap

  // Arrow scroll
  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -CARD_W, behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: CARD_W, behavior: 'smooth' });
  });

  // Build dots based on visible cards
  function buildDots() {
    const visibleCards = [...allCards].filter(c => c.style.display !== 'none');
    const count = visibleCards.length;
    dotsWrap.innerHTML = '';
    if (count <= 1) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    const numDots = Math.min(count, Math.ceil(maxScroll / CARD_W) + 1, 13);

    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'fdot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        track.scrollTo({ left: i * CARD_W, behavior: 'smooth' });
      });
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    buildDots();
  }

  function syncDots() {
    const dots = dotsWrap.querySelectorAll('.fdot');
    if (!dots.length) return;
    const idx = Math.round(track.scrollLeft / CARD_W);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));

    // Show/hide arrows
    prevBtn.style.opacity = track.scrollLeft < 20 ? '0.3' : '1';
    nextBtn.style.opacity =
      track.scrollLeft >= track.scrollWidth - track.clientWidth - 20 ? '0.3' : '1';
  }

  track.addEventListener('scroll', syncDots, { passive: true });

  // Drag-to-scroll on desktop
  let isDragging  = false;
  let startX      = 0;
  let scrollStart = 0;

  track.addEventListener('mousedown', e => {
    isDragging  = true;
    startX      = e.pageX - track.offsetLeft;
    scrollStart = track.scrollLeft;
    track.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.2;
    track.scrollLeft = scrollStart - walk;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    track.classList.remove('dragging');
  });

  // Touch swipe support (mobile)
  let touchStartX = 0;
  let touchScrollStart = 0;

  track.addEventListener('touchstart', e => {
    touchStartX      = e.touches[0].clientX;
    touchScrollStart = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    const dx = touchStartX - e.touches[0].clientX;
    track.scrollLeft = touchScrollStart + dx;
  }, { passive: true });

  // Init
  buildDots();
  syncDots();

  // Update on window resize
  window.addEventListener('resize', () => {
    buildDots();
    syncDots();
  }, { passive: true });

  /* ─────────────────────────────────────────
     6. STAGGERED reveal for cards
  ───────────────────────────────────────── */
  document.querySelectorAll('.svc-card, .vcard').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
  });

});
