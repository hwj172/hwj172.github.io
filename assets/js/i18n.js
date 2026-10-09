/**
 * 中英双语切换
 *
 * 中文文案直接写在 index.html 里（默认语言，零闪烁、无 JS 也能读、利于 SEO），
 * 这里只维护英文对照表。加新文案时：
 *   1. 在 index.html 的对应元素上加 data-i18n="区块.字段"
 *   2. 在下面的 en 字典里补上同名 key
 * 漏补的 key 会在控制台打出告警，测一下切换就能发现。
 *
 * 注意：技能标签、项目技术标签、邮箱地址这些中英通用的内容没有套 data-i18n，
 * 直接写在 HTML 里即可。需要中英不同的才走这套字典。
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
    'nav.education': 'Education',
    'nav.contact': 'Contact',

    'hero.name': 'Wenjie Huang',
    'hero.role': 'Software Engineering Student · JUFE',
    'hero.intro': 'Studying software engineering, focused on backend microservices and LLM applications. I like building real projects and am open to collaboration.',
    'hero.email': 'Email',
    'hero.cue': 'Scroll',

    'about.title': 'About',
    'about.p1': 'An undergraduate in software engineering, focused on backend development. I am familiar with the Spring stack and microservice architecture, and have taken part in rebuilding a mall project from a monolith into microservices, working with components such as Nacos, Sentinel and SkyWalking. I have a working grounding in requirements analysis, API development and troubleshooting.',
    'about.p2': 'I am comfortable with containerised deployment and basic operations, and set up my development environments with Docker. I also explore LLM applications: I work with models such as Claude, build multi-agent workflows, and have built RAG applications that combine message queues with vector databases. I like to write down solutions as I go.',
    'about.p3': 'I keep studying computer science fundamentals — the ground covered by the 408 exam syllabus — and I enjoy taking things apart to understand how they work underneath. I like collaborating with a team and pitch in on debugging and documentation.',
    'about.meta': 'Nanchang, China · Undergraduate · Open to collaboration',

    'skills.title': 'Skills',
    'skills.languages': 'Languages',
    'skills.frameworks': 'Frameworks & Libraries',
    'skills.tools': 'Engineering & Tools',
    'skills.hint': 'Hover a tag to see which projects used it',

    'projects.title': 'Projects',
    'projects.p1.title': 'Tianji Mall — Spring Boot Monolith',
    'projects.p1.desc': 'An e-commerce platform built as a single Spring Boot application, covering the core product, order and user modules.',
    'projects.p2.title': 'Tianji Mall — Spring Cloud Microservices',
    'projects.p2.desc': 'The same mall rebuilt on a Spring Cloud microservice architecture, integrating Nacos, Sentinel, SkyWalking and Nginx. Asynchronous work runs through a message queue, product recommendations are backed by the Milvus vector database, and the whole stack is deployed with Docker.',
    'projects.p3.title': 'Ajie Ledger',
    'projects.p3.desc': 'A bookkeeping mini program for the card table — mahjong, Dou Dizhu, whatever you play. It does one job: keeping straight who owes whom how much. Published and running, backed by a Node.js service.',
    'projects.p3.qr': 'Scan in WeChat to open',
    'projects.code': 'Code',

    'education.title': 'Education',
    'education.e1.school': 'Jiangxi University of Finance and Economics',
    'education.e1.period': '2024.09 — 2028.06',
    'education.e1.degree': 'Software Engineering · Bachelor',
    'education.e1.note': 'Coursework in computer fundamentals, databases and software engineering. Self-taught in microservices, containerisation, observability and LLM application development, with several course projects completed independently.',

    'contact.title': 'Contact',
    'contact.lead': 'For technical discussion or project collaboration, email is the quickest way to reach me.',
    'contact.email': 'Email',

    'footer.name': 'Wenjie Huang',
    'footer.built': 'Built with plain HTML / CSS / JS'
  };

  /* 切语言时一并替换 <title> 和描述，方便分享和标签页标题 */
  var meta = {
    zh: {
      title: '黄文杰 · 软件工程在读本科生',
      desc: '黄文杰，江西财经大学软件工程在读本科生。方向为 Java 后端微服务与大模型应用开发，熟悉 Spring Cloud、Docker、RAG 与多智能体工作流。'
    },
    en: {
      title: 'Wenjie Huang · Software Engineering Undergraduate',
      desc: 'Wenjie Huang, software engineering undergraduate at Jiangxi University of Finance and Economics, focused on Java backend microservices and LLM applications.'
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
      // 注意：空字符串在 JS 里是 falsy，所以英文译名若写成 '' 会静默回退成中文。
      // 想表达「这一项英文留空」就干脆别给这个 key，让控制台告警提醒你去填。
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

    // 通知依赖文案的模块（motion.js 要把首屏姓名重新拆成单字做动效）
    try {
      document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    } catch (e) { /* 老浏览器不支持 CustomEvent 构造器时忽略 */ }
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
