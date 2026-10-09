/**
 * 页面交互：滚动淡入、导航状态、页脚年份
 * 无第三方依赖。
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 页脚年份：不用每年手改 ── */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ── 滚动时给导航加一条分割线 ── */
  var nav = document.getElementById('nav');
  if (nav) {
    var ticking = false;

    var syncNav = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncNav);
    }, { passive: true });

    syncNav();
  }

  /* ── 区块淡入（只播一次） ── */
  var revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    // 降级：直接显示，不依赖动画
    Array.prototype.forEach.call(revealEls, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(revealEls, function (el) {
      revealObserver.observe(el);
    });
  }

  /* ── 导航高亮当前区块 ── */
  var navLinks = {};
  Array.prototype.forEach.call(
    document.querySelectorAll('.nav-links a[href^="#"]'),
    function (a) { navLinks[a.getAttribute('href').slice(1)] = a; }
  );

  var sections = Object.keys(navLinks)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var visible = new Set();

    var setCurrent = function () {
      // 取当前可见区块中最靠上的那个
      var current = null;
      sections.forEach(function (section) {
        if (visible.has(section.id) && !current) current = section.id;
      });

      Object.keys(navLinks).forEach(function (id) {
        if (id === current) {
          navLinks[id].setAttribute('aria-current', 'true');
        } else {
          navLinks[id].removeAttribute('aria-current');
        }
      });
    };

    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visible.add(entry.target.id);
        } else {
          visible.delete(entry.target.id);
        }
      });
      setCurrent();
    }, { rootMargin: '-25% 0px -60% 0px' });

    sections.forEach(function (section) { navObserver.observe(section); });
  }
})();
