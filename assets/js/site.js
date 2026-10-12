/* Diabetes Care Center — Dr. Vijay S. Chile. Small, dependency-free helpers.
   Written to the Exly playbook: one closure, no globals, everything queried inside the
   page root, every optional element guarded, and content never depends on this script. */
(function () {
  'use strict';
  var self = document.currentScript;
  var root = (self && self.closest('[data-dvc-root]')) || document.querySelector('[data-dvc-root]') || document.body;
  if (!root || root.hasAttribute('data-dvc-init')) return;   // never initialise twice
  root.setAttribute('data-dvc-init', '');

  var $ = function (s, c) { return (c || root).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); };
  var lockScroll = function (on) { document.documentElement.style.overflow = on ? 'hidden' : ''; };

  /* Sticky header shadow */
  var hdr = $('.hdr');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile drawer */
  var wrap = $('.drawer-wrap');
  var burger = $('.burger');
  var closeBtn = wrap && $('.drawer__close', wrap);
  var overlay = wrap && $('.overlay', wrap);
  if (wrap && burger && closeBtn) {
    var setOpen = function (open) {
      wrap.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      lockScroll(open);
      if (open) closeBtn.focus(); else burger.focus();
    };
    burger.addEventListener('click', function () { setOpen(true); });
    closeBtn.addEventListener('click', function () { setOpen(false); });
    if (overlay) overlay.addEventListener('click', function () { setOpen(false); });
    $$('a', wrap).forEach(function (a) { a.addEventListener('click', function () { if (wrap.classList.contains('is-open')) setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('is-open')) setOpen(false);
    });
  }

  /* YouTube: the link opens YouTube without JS; with JS the player loads in place, on first click */
  $$('.yt[data-id]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var box = document.createElement('div');
      box.className = 'yt';
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + link.getAttribute('data-id') + '?autoplay=1&rel=0';
      f.title = (link.getAttribute('aria-label') || 'YouTube video').replace(/^Play video: /, '');
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      box.appendChild(f);
      link.parentNode.replaceChild(box, link);
    });
  });

  /* Gallery lightbox (the thumbnails are already full photos, so it reuses their image) */
  var items = $$('.gallery__item');
  var lb = $('.lb');
  if (items.length && lb) {
    var lbImg = $('img', lb), cap = $('figcaption', lb), lbClose = $('.lb__close', lb);
    var prev = $('.lb__prev', lb), next = $('.lb__next', lb);
    var idx = 0, last = null;
    var show = function (i) {
      idx = (i + items.length) % items.length;
      var src = $('img', items[idx]);
      if (!src || !lbImg) return;
      lbImg.src = src.currentSrc || src.src;
      lbImg.alt = src.alt;
      if (cap) cap.textContent = items[idx].getAttribute('data-caption') || '';
    };
    var open = function (i) { last = document.activeElement; show(i); lb.classList.add('is-open'); lockScroll(true); if (lbClose) lbClose.focus(); };
    var close = function () { lb.classList.remove('is-open'); lockScroll(false); if (last) last.focus(); };
    items.forEach(function (it, i) { it.addEventListener('click', function () { open(i); }); });
    if (lbClose) lbClose.addEventListener('click', close);
    if (prev) prev.addEventListener('click', function () { show(idx - 1); });
    if (next) next.addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Footer year */
  var y = $('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* Reveal on scroll — the ready marker is set only here, so an earlier failure can never leave content hidden */
  var targets = $$('[data-rise], .curve');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.setAttribute('data-dvc-ready', '');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('is-in'); });
  }
})();
