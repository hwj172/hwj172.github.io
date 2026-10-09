/**
 * 页面基础交互：页脚年份、导航状态、当前区块指示
 *
 * 动效在 motion.js。这里的 IntersectionObserver 只有一个用途：
 * 判断当前处于哪个区块，由它同时驱动导航高亮和左侧竖线的序号 ——
 * 不要在这里再加第二个观察器。
 */
(function () {
  'use strict';

  /* ── 页脚年份：不用每年手改 ── */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ── 滚动时给导航加一条分割线 ── */
  var nav = document.getElementById('nav');
  if (nav) {
    var navTicking = false;

    var syncNav = function () {
      nav.classList.toggle('is-scrolled', window.pageYOffset > 8);
      navTicking = false;
    };

    window.addEventListener('scroll', function () {
      if (navTicking) return;
      navTicking = true;
      window.requestAnimationFrame(syncNav);
    }, { passive: true });

    syncNav();
  }

  /* ── 当前区块 ── */
  var navLinks = {};
  Array.prototype.forEach.call(
    document.querySelectorAll('.nav-links a[href^="#"]'),
    function (a) { navLinks[a.getAttribute('href').slice(1)] = a; }
  );

  var sections = Object.keys(navLinks)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  var rail = document.querySelector('.rail');
  var railNum = document.querySelector('.rail-num');

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

      if (current) {
        var idx = -1;
        for (var i = 0; i < sections.length; i++) {
          if (sections[i].id === current) { idx = i; break; }
        }
        if (railNum && idx >= 0) {
          railNum.textContent = ('0' + (idx + 1)).slice(-2);
        }
      }
      // 在首屏时不存在「当前区块」，竖线整体淡出
      if (rail) rail.classList.toggle('is-active', !!current);
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
