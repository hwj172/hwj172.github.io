/**
 * 滚动动效（零依赖）
 *
 * 手法参考 GitHub 上的 MIT 项目，只取思路不引代码：滚动进度的归一化与
 * rAF 节流来自 lax.js，文字拆分的做法同 SplitType（该项目无许可证，未取其代码）。
 *
 * 改动时不要破坏这三条：
 *   1. prefers-reduced-motion: reduce 时全部降级为静态
 *   2. 只动 transform / opacity，不碰 width/height/top/left
 *   3. 没有 JS 时内容必须完整可见
 */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 首屏姓名逐字拆分 ── */
  var heroName = doc.querySelector('.hero-name');

  function splitHeroName() {
    if (!heroName || reduceMotion) return;

    var text = heroName.textContent.trim();
    if (!text) return;

    // 拆成单字后屏幕阅读器读到的是碎片，所以原文必须留给外层
    heroName.setAttribute('aria-label', text);

    var frag = doc.createDocumentFragment();
    var i = 0;
    // 用 Array.from 而非 split('')，避免把 emoji 之类的代理对拆坏
    Array.from(text).forEach(function (ch) {
      if (/\s/.test(ch)) {
        frag.appendChild(doc.createTextNode(' '));
        return;
      }
      var span = doc.createElement('span');
      span.className = 'ch';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', i++);
      span.textContent = ch;
      frag.appendChild(span);
    });

    heroName.textContent = '';
    heroName.appendChild(frag);
  }

  splitHeroName();
  // i18n.js 切语言时会重写 textContent（把 span 冲掉），所以要重新拆一次
  doc.addEventListener('langchange', splitHeroName);

  /* ── 区块错落入场 ── */
  var revealEls = doc.querySelectorAll('.reveal');

  Array.prototype.forEach.call(revealEls, function (el) {
    // 容器有子元素就只动子元素，容器自己再淡一次会显得浑浊
    if (!el.children.length) {
      el.classList.add('reveal-leaf');
      return;
    }
    Array.prototype.forEach.call(el.children, function (child, i) {
      child.style.setProperty('--i', i);
    });
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
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
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(revealEls, function (el) {
      revealObserver.observe(el);
    });
  }

  /* ── 滚动进度 + 首屏视差 ── */
  var hero = doc.querySelector('.hero');
  var needsScrollWork = doc.querySelector('.rail') || hero;
  var ticking = false;

  function onFrame() {
    ticking = false;
    var y = window.pageYOffset;
    var max = doc.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(y / max, 1) : 0;

    // 进度只算一次写进 CSS 变量，顶部的条和左侧的竖线各自读它
    doc.documentElement.style.setProperty('--scroll-progress', String(p));

    // 位移限制在首屏高度的一小部分内，避免内容飞出屏幕
    if (hero && !reduceMotion) {
      var h = hero.offsetHeight || 1;
      var hp = Math.min(y / h, 1);
      hero.style.opacity = String(1 - hp);
      hero.style.transform = 'translate3d(0,' + (hp * h * 0.18) + 'px,0)';
    }
  }

  function requestFrame() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onFrame);
  }

  if (needsScrollWork) {
    window.addEventListener('scroll', requestFrame, { passive: true });
    window.addEventListener('resize', requestFrame, { passive: true });
    onFrame();
  }

  /* ── 磁吸链接 ── */
  // 只在真有指针的设备上启用；上限 4px，再多就从克制变成炫技了
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    var MAX_SHIFT = 4;

    Array.prototype.forEach.call(
      doc.querySelectorAll('.hero-links a, .project-links a, .contact-list a'),
      function (el) {
        el.classList.add('magnetic');

        el.addEventListener('mousemove', function (e) {
          var r = el.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          el.style.transform =
            'translate3d(' + (dx * MAX_SHIFT) + 'px,' + (dy * MAX_SHIFT) + 'px,0)';
        });

        el.addEventListener('mouseleave', function () {
          el.style.transform = '';
        });
      }
    );
  }

  // 告诉 index.html 里那道保险：动效已接管，不必再摘掉 .js
  doc.documentElement.setAttribute('data-motion-ready', '');
})();
