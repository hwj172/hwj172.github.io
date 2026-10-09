/**
 * 页面交互：页脚年份、导航状态、当前区块指示、技能↔项目联动
 *
 * 滚动动效在 motion.js。这里的 IntersectionObserver 只有一个用途：
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

  /* ── 技能 ↔ 项目联动 ── */
  /* 悬停某个技能标签时，用到它的项目留下并前移，其余淡出。
     映射直接从 DOM 推导：项目和技能本来就用同一套标签文本，
     不另建一份对应关系，免得两边不同步。 */
  var skillTags = document.querySelectorAll('.skill-group .tags .tag');
  var projects = document.querySelectorAll('.project');

  // 只在精确指针设备上启用：触屏没有 hover，挂上会出现卸不掉的状态
  if (skillTags.length && projects.length &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches) {

    var projTags = [];
    Array.prototype.forEach.call(projects, function (proj) {
      var texts = [];
      Array.prototype.forEach.call(proj.querySelectorAll('.tags .tag'), function (t) {
        texts.push(t.textContent.trim());
      });
      projTags.push(texts);
    });

    var clearLink = function () {
      Array.prototype.forEach.call(projects, function (p) {
        p.classList.remove('is-linked', 'is-dimmed');
      });
      Array.prototype.forEach.call(
        document.querySelectorAll('.project .tag.is-match'),
        function (t) { t.classList.remove('is-match'); }
      );
    };

    Array.prototype.forEach.call(skillTags, function (tag) {
      var text = tag.textContent.trim();

      var hits = [];
      projTags.forEach(function (texts, i) {
        if (texts.indexOf(text) >= 0) hits.push(i);
      });
      // 没有任何项目用到它，就不做交互，免得悬停过去毫无反应
      if (!hits.length) return;

      tag.classList.add('is-linked');

      tag.addEventListener('mouseenter', function () {
        Array.prototype.forEach.call(projects, function (p, i) {
          var hit = hits.indexOf(i) >= 0;
          p.classList.toggle('is-linked', hit);
          p.classList.toggle('is-dimmed', !hit);
          if (!hit) return;
          // 项目里用到这个技能的那枚标签也点出来
          Array.prototype.forEach.call(p.querySelectorAll('.tags .tag'), function (t) {
            if (t.textContent.trim() === text) t.classList.add('is-match');
          });
        });
      });

      tag.addEventListener('mouseleave', clearLink);
    });
  }
})();
