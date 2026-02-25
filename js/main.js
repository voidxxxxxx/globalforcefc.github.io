// ═══════════════════════════════════════════════
//  GLOBAL FORCE FC — MAIN.JS
// ═══════════════════════════════════════════════

'use strict';

// ─── LANGUAGE SYSTEM ────────────────────────────
const LANG_KEY = 'gffc_lang';
let currentLang = localStorage.getItem(LANG_KEY) || 'en';

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.body.classList.remove('lang-en', 'lang-ne', 'lang-ar');
  document.body.classList.add('lang-' + lang);
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  document.querySelectorAll('[data-en]').forEach(el => {
    const txt = el.getAttribute('data-' + lang) || el.getAttribute('data-en');
    if (txt) el.textContent = txt;
  });
  document.querySelectorAll('[data-placeholder-en]').forEach(el => {
    const txt = el.getAttribute('data-placeholder-' + lang) || el.getAttribute('data-placeholder-en');
    if (txt) el.placeholder = txt;
  });

  // Update active lang button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function initLanguage() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  });
  applyLanguage(currentLang);
}

// ─── NAVBAR ──────────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.getElementById('navHamburger');
  const navMenu = document.getElementById('navMenu');

  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    navMenu?.classList.toggle('open');
    const icon = hamburger.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  });

  navMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      const icon = hamburger?.querySelector('i');
      icon?.classList.remove('fa-times');
      icon?.classList.add('fa-bars');
    });
  });

  // Active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(a => {
    const href = a.getAttribute('href')?.split('/').pop();
    if (href === path) a.classList.add('active');
  });
}

// ─── SCROLL REVEAL ───────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.scroll-reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
}

// ─── TICKER DUPLICATION ──────────────────────────
function initTicker() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  track.innerHTML += track.innerHTML;
}

// ─── COUNTER ANIMATION ───────────────────────────
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target, parseInt(e.target.dataset.count));
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
}

// ─── TAB SYSTEM ──────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tabs-container').forEach(container => {
    const tabs = container.querySelectorAll('.tab-btn');
    const panels = container.querySelectorAll('.tab-panel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        container.querySelector('#' + tab.dataset.tab)?.classList.add('active');
      });
    });
  });
}

// ─── PHOTO UPLOAD PLACEHOLDER ────────────────────
function initPhotoUpload() {
  document.querySelectorAll('.photo-upload-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = btn.closest('.player-photo').querySelector('img') || document.createElement('img');
          img.src = ev.target.result;
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:top;position:absolute;inset:0';
          btn.closest('.player-photo').appendChild(img);
          btn.closest('.player-photo').querySelector('.player-photo-placeholder')?.remove();
          btn.remove();
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  });
}

// ─── SMOOTH SCROLL ───────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ─── FORM HANDLING ───────────────────────────────
function initForms() {
  document.querySelectorAll('form[data-ajax]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const oldText = btn.textContent;
      btn.textContent = '...Sending'; btn.disabled = true;
      try {
        const res = await fetch(form.action, {
          method: 'POST', body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          btn.textContent = '✓ Sent!'; btn.style.background = '#00C96E';
          form.reset();
        } else { btn.textContent = 'Error — try again'; btn.style.background = '#EF4444'; }
      } catch { btn.textContent = 'Error — try again'; btn.style.background = '#EF4444'; }
      setTimeout(() => { btn.textContent = oldText; btn.disabled = false; btn.style.background = ''; }, 3000);
    });
  });
}

// ─── INIT ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLanguage();
  initScrollReveal();
  initTicker();
  initCounters();
  initTabs();
  initPhotoUpload();
  initSmoothScroll();
  initForms();
});
