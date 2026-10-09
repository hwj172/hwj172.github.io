/**
 * 中英双语切换
 *
 * 中文文案直接写在 index.html 里（默认语言，零闪烁、无 JS 也能读、利于 SEO），
 * 这里只维护英文对照表。加新文案时：
 *   1. 在 index.html 的对应元素上加 data-i18n="区块.字段"
 *   2. 在下面的 en 字典里补上同名 key
 * 漏补的 key 会在控制台打出告警，测一下切换就能发现。
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'lang';
  var LANG_ATTR = { zh: 'zh-CN', en: 'en' };

  /* 英文对照表：key 必须与 HTML 里的 data-i18n 完全一致 */
  var en = {
    'a11y.skip': 'Skip to content',

    'nav.brand': 'Wenjie Huang',
    'nav.about': 'About',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',

    'hero.name': 'Wenjie Huang',
    'hero.role': 'Frontend Engineer',
    'hero.intro': 'Five years of frontend experience, focused on the performance and feel of web applications. I like turning tangled problems into simple structures, and writing small tools that shave a few steps off the daily routine.',
    'hero.email': 'Email',
    'hero.juejin': 'Juejin',

    'about.title': 'About',
    'about.p1': 'I am a frontend engineer working mainly on internal tools and dashboard products in the React ecosystem. My day-to-day revolves around component design, state management, build optimisation and accessibility.',
    'about.p2': 'I prefer to state the problem clearly before writing code. When a requirement is vague I lay out the boundaries and trade-offs first rather than piling on implementation — fewer rewrites, and a more productive discussion.',
    'about.p3': 'Away from the keyboard I read technical books, keep notes, and keep trying to hold the water temperature steadier when brewing pour-over coffee.',
    'about.meta': 'Hangzhou, China · 5 years of experience · Open to remote roles',

    'skills.title': 'Skills',
    'skills.languages': 'Languages',
    'skills.frameworks': 'Frameworks & Libraries',
    'skills.tools': 'Engineering & Tools',

    'projects.title': 'Projects',
    'projects.p1.title': 'Component Docs Site',
    'projects.p1.desc': 'A component playground and docs site built on Vite. It generates API tables straight from TypeScript types, supports light/dark themes and lets you edit examples in place.',
    'projects.p2.title': 'Data Dashboard',
    'projects.p2.desc': 'A drag-and-drop dashboard that supports several data sources and local caching. Layouts export as JSON, so they move cleanly between environments.',
    'projects.p3.title': 'CLI Todo',
    'projects.p3.desc': 'A minimal todo tool for the terminal. Single file, zero dependencies, data stored locally, with natural-language due dates.',
    'projects.code': 'Code',
    'projects.demo': 'Live demo',

    'contact.title': 'Contact',
    'contact.lead': 'Whether it is a new opportunity, a technical question or just to say hello, email is the surest way to reach me.',
    'contact.email': 'Email',
    'contact.juejin': 'Juejin',

    'footer.name': 'Wenjie Huang',
    'footer.built': 'Built with plain HTML / CSS / JS'
  };

  /* 切语言时一并替换 <title> 和描述，方便分享和标签页标题 */
  var meta = {
    zh: {
      title: '黄文杰 · 前端工程师',
      desc: '黄文杰，前端工程师。专注于 Web 应用的性能与体验，熟悉 React / TypeScript / Vite。'
    },
    en: {
      title: 'Wenjie Huang · Frontend Engineer',
      desc: 'Wenjie Huang, frontend engineer. Focused on the performance and feel of web applications, working with React / TypeScript / Vite.'
    }
  };

  /* ── 采集所有待翻译元素，并记下中文原文 ── */
  var nodes = document.querySelectorAll('[data-i18n]');
  var originals = {};       // key -> 中文原文
  var elsByKey = [];        // [{ el, key }]

  Array.prototype.forEach.call(nodes, function (el) {
    var key = el.getAttribute('data-i18n');

    // 统一去掉 HTML 换行缩进带来的首尾空白，避免切回中文时排版跳动
    var text = el.textContent.trim();
    el.textContent = text;

    originals[key] = text;
    elsByKey.push({ el: el, key: key });
  });

  var missingWarned = false;
  function warnMissing() {
    if (missingWarned) return;
    missingWarned = true;

    var missing = [];
    Object.keys(originals).forEach(function (key) {
      if (!en[key] && missing.indexOf(key) === -1) missing.push(key);
    });

    if (missing.length) {
      console.warn(
        '[i18n] 以下 key 缺少英文翻译，将回退为中文：\n  ' + missing.join('\n  ') +
        '\n请在 assets/js/i18n.js 的 en 字典中补齐。'
      );
    }
  }

  /* ── 应用某个语言 ── */
  function apply(lang) {
    if (lang !== 'en') lang = 'zh';

    if (lang === 'en') warnMissing();

    elsByKey.forEach(function (item) {
      var text = lang === 'en' ? (en[item.key] || originals[item.key]) : originals[item.key];
      if (item.el.textContent !== text) item.el.textContent = text;
    });

    document.documentElement.lang = LANG_ATTR[lang];
    document.title = meta[lang].title;

    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', meta[lang].desc);

    Array.prototype.forEach.call(
      document.querySelectorAll('.lang-btn'),
      function (btn) {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === lang));
      }
    );

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* 隐私模式下忽略 */ }
  }

  /* ── 初始语言：优先上次选择，其次跟随浏览器 ── */
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* 忽略 */ }

  var initial = saved || ((navigator.language || 'zh').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en');

  apply(initial);

  /* ── 绑定切换按钮 ── */
  Array.prototype.forEach.call(
    document.querySelectorAll('.lang-btn'),
    function (btn) {
      btn.addEventListener('click', function () {
        apply(btn.getAttribute('data-lang'));
      });
    }
  );
})();
