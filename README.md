# 个人主页

纯 HTML / CSS / JS 的静态个人主页，零依赖、零构建，部署在 GitHub Pages 根站点。

- 四个板块：关于我、技能、项目、教育（外加联系区）
- 中英双语，右上角切换，选择记在 `localStorage`
- 暗色模式跟随系统自动切换
- 全部使用系统字体，不请求任何外部资源，断网也能正常显示
- 带自定义 404 页与社交平台分享预览图

## 本地预览

直接双击 `index.html` 就能看（无 fetch 请求，`file://` 下功能完整）。

想更接近线上环境：

```bash
npx -y serve -l 4321 .
```

然后打开 <http://localhost:4321>。想顺带测试 404 页，随便访问一个不存在的路径即可（比如 <http://localhost:4321/nope>）。

> 别用 `python -m http.server`——它遇到不存在的路径只返回一个纯文本错误，不会加载 `404.html`，测不了 404 页。

## 文件说明

```
index.html              页面结构与全部中文文案 ← 改内容只改这个文件
404.html                自定义 404 页（注意：里面必须用 /assets/ 这种根绝对路径）
assets/css/style.css    全部样式（配色变量在最上面）
assets/js/i18n.js       英文对照表 + 语言切换逻辑 ← 改英文只改这个文件
assets/js/motion.js     滚动动效（逐字浮现、视差、错落、进度、磁吸）
assets/js/main.js       页脚年份、导航高亮、当前区块指示
assets/img/favicon.svg  标签页图标
assets/img/og-cover.png 分享到微信/Twitter 时的预览图
tools/og-cover/         上面那张图的生成模板与脚本（详见「重新生成分享图」）
```

---

## 一、替换成你自己的内容

### 1. 基本信息

打开 `index.html`，搜索 `data-i18n` 就能定位到每一处可替换的文案。按顺序改这几块：

| 位置 | 搜索关键词 | 说明 |
|---|---|---|
| 标签页标题 | `<title>` | 同时改 `meta[name="description"]`、`og:title`、`og:description` |
| 导航左侧姓名 | `data-i18n="nav.brand"` | 页面左上角 |
| 首屏姓名 / 职位 / 简介 | `data-i18n="hero.name"` 等 | |
| 首屏链接 | `hero-links` 里的 `<a>` | 目前是 GitHub + 邮箱两个，按需增删 `<li>` |
| 关于我 | `data-i18n="about.p1"` 等 | 三段，可增删 |
| 技能 | `id="skills"` 区块 | 见下 |
| 项目 | `data-i18n="projects.p1.title"` 等 | 见下 |
| 教育 | `data-i18n="education.e1.school"` 等 | 见下 |
| 联系 | `id="contact"` 区块 | 邮箱、GitHub |
| 页脚 | `<span id="year">` 所在行 | 年份自动更新，只需改姓名 |
| 分享预览图 | `assets/img/og-cover.png` | 改了姓名/职位后要重新生成，见「重新生成分享图」 |
| 结构化数据 | `<script type="application/ld+json">` | 里面的姓名、职位、所在地要跟页面对上 |

**邮箱与 GitHub 链接**：邮箱在首屏、联系区、`mailto:` 三处出现；GitHub 链接出现更多次。改的时候建议用编辑器全局替换，别漏掉 `mailto:` 的那个。

### 2. 增删技能

技能名是英文技术名词，不需要翻译，直接改 HTML：

```html
<ul class="tags">
  <li class="tag">React</li>
  <li class="tag">TypeScript</li>
</ul>
```

分组标题需要翻译，改 `<h3 data-i18n="skills.languages">` 时记得同步 `i18n.js`。

### 3. 增删项目

复制整个 `<article class="project">` 块，改标题、描述、标签和链接即可。

```html
<article class="project reveal">
  <h3 class="project-title" data-i18n="projects.p4.title">项目名</h3>
  <p class="project-desc" data-i18n="projects.p4.desc">一句话描述。</p>
  <ul class="tags">
    <li class="tag">技术标签</li>
  </ul>
  <p class="project-links">
    <a class="link link-sm" href="链接" target="_blank" rel="noopener" data-i18n="projects.code">源码</a>
  </p>
</article>
```

注意 `data-i18n` 的 key 要唯一，英文译名补到 `i18n.js` 里。

### 4. 增删教育经历

复制整个 `<article class="edu">` 块，从最近的一段往前排。

```html
<article class="edu reveal">
  <div class="edu-head">
    <h3 class="edu-school" data-i18n="education.e2.school">学校名称</h3>
    <span class="edu-period" data-i18n="education.e2.period">2016 — 2020</span>
  </div>
  <p class="edu-degree" data-i18n="education.e2.degree">专业 · 学历</p>
</article>
```

- 时间建议写成 `2016 — 2020` 这种格式，它会用等宽字体右对齐显示
- 想加一句亮点说明，把模板里那段被注释掉的 `.edu-note` 取消注释即可
- `data-i18n` 的 key 必须唯一，英文译名补到 `i18n.js`

### 5. 补英文翻译

`i18n.js` 里的 `en` 字典按 `data-i18n` 的 key 一一对应。**漏掉的 key 会自动回退成中文，并在浏览器控制台打出警告**，切到 EN 看一眼控制台就知道漏了哪些。

### 6. 换图标（可选）

`assets/img/favicon.svg` 是深色圆角方块 + 字母 H。改字母直接编辑这个文件里的 `<text>`。

### 7. 加头像（可选）

把图片放到 `assets/img/avatar.jpg`。目前首屏是纯文字排版，加头像需要自己在 `index.html` 的 `.hero` 里插一个 `<img>` 并补几行 CSS —— 保持现状也完全够用。

### 8. 改配色

`style.css` 顶部 `:root` 里的几个变量控制整套配色，`@media (prefers-color-scheme: dark)` 里是对应的暗色值：

```css
--bg:     #FAFAFA;                  /* 页面背景 */
--fg:     #111111;                  /* 正文 */
--muted:  #6B6B6B;                  /* 次要文字 */
--line:   #E5E5E5;                  /* 分割线、标签描边 */
--nav-bg: rgba(250,250,250,0.82);   /* 吸顶导航的半透明底色 */
```

改 `--bg` 时记得同步 `--nav-bg` 的 RGB 值，否则滚动时导航会和页面底色对不上。

### 9. 重新生成分享图

`assets/img/og-cover.png` 是把链接发到微信 / Twitter / Slack 时显示的预览图。改了姓名或职位之后，它不会自动更新，要手动重新生成：

1. 改 `tools/og-cover/template.html` 里的姓名、职位、域名
2. 在仓库根目录执行：

```bash
python tools/og-cover/generate.py
```

脚本需要 Playwright（`pip install playwright`）。它会优先复用你系统里已装的 Chrome，所以不必再下载 140MB 的浏览器内核。

生成后记得确认 `index.html` 里 `og:image` 指向的是**绝对地址**（`https://hwj172.github.io/...`）——相对路径很多爬虫不认，这是分享图不显示最常见的原因。

### 10. 自定义 404 页

`404.html` 在访问不存在的地址时自动生效，不需要额外配置。

**唯一的坑**：这一页必须用 `/assets/...` 这种**根绝对路径**，不能用相对路径。因为 404 页会在任意路径层级被返回（比如 `/foo/bar/baz`），相对路径 `./assets/` 会指向 `/foo/bar/assets/`，样式就全丢了。

这一页故意没有引用 `i18n.js`——那个文件会把 `document.title` 强制改成首页标题，对 404 页是错的。这里用一小段内联脚本读 `localStorage.lang` 显示对应语言。

---

## 二、部署到 GitHub Pages

1. 在 GitHub 新建**公开**仓库，名称必须是 `<你的用户名>.github.io`（例如用户名是 `hwj`，仓库名就是 `hwj.github.io`）。

2. 本地提交并推送：

   ```bash
   cd D:/hwjSelfDisplay
   git init
   git branch -M main
   git add .
   git commit -m "init personal site"
   git remote add origin https://github.com/<你的用户名>/<你的用户名>.github.io.git
   git push -u origin main
   ```

3. 打开仓库的 **Settings → Pages**，Source 选 `Deploy from a branch`，Branch 选 `main`、目录选 `/ (root)`，点 Save。

4. 等 1–2 分钟，访问 `https://<你的用户名>.github.io/`。

### 之后更新内容

```bash
git add . && git commit -m "update content" && git push
```

推送后 Pages 会自动重新构建，通常一分钟内生效。

---

## 几个实现上的选择

- **中文写在 HTML 里，英文放字典**：默认语言零闪烁，没有 JS 也能读到完整内容，搜索引擎抓取的也是中文正文。代价是改中文要改 HTML，改英文要改 JS。
- **不引任何 CDN**：字体、图标、脚本全部本地，加载快且不受第三方服务下线影响。
- **暗色模式不加按钮**：跟随系统即可，避免导航栏堆太多控件。
- **动效全部手写，不引动画库**：GSAP + ScrollTrigger gzip 后 30–42 KB，比整站还大。手法借鉴自 GitHub 上的 MIT 项目（滚动驱动来自 lax.js，文字拆分同 SplitType 的思路），但只取思路不引代码。

## 动效怎么改

全部动效在 `assets/js/motion.js`，样式在 `style.css`。改之前先知道这三条约束：

1. **只动 `transform` 和 `opacity`**，不碰 `width` / `height` / `top` / `left`——前者走合成层，后者会触发重排
2. **`prefers-reduced-motion: reduce` 时必须完全静态**。CSS 侧和 JS 侧各覆盖一半，改一边要记得另一边
3. **没有 JS 时内容必须完整可见**。靠 `.js` 类前缀实现：CSS 默认可见，有 JS 才隐藏。另有一道 3 秒保险（在 `index.html` 头部），动效模块没接管就自动解除隐藏

**要调具体的动效**：

| 想改什么 | 改哪里 |
|---|---|
| 逐字浮现的速度与间隔 | `style.css` 的 `ch-in` 动画与 `animation-delay` |
| 区块错落的节奏 | `style.css` 里 `.reveal.is-visible > *` 的 `transition-delay` |
| 视差位移幅度 | `motion.js` 里 `0.18` 这个系数 |
| 磁吸力度 | `motion.js` 里的 `MAX_SHIFT`（当前 4px） |
| 竖线出现的宽度阈值 | `style.css` 里的 `@media (min-width: 1180px)` |

> 中文注释在 gzip 后占约 38%（UTF-8 下每个汉字 3 字节，压缩率远低于英文）。
> 如果哪天要抠体积，精简注释比压缩代码有效得多。
- **≤480px 时隐藏导航栏的姓名**：导航项有 5 个后，英文标签加上 "Wenjie Huang" 会超出小屏宽度（实测 375px 溢出 10px、320px 溢出约 110px）。导航栏的姓名与首屏大标题重复，所以让它让位。相关断点都在 `style.css` 底部，改导航项数量时记得复测。

## 改完之后怎么验证

```bash
# 1. 起服务
npx -y serve -l 4321 .

# 2. 浏览器里过一遍
#    - 切换中英文，打开控制台看有没有「缺少英文翻译」告警
#    - 切换系统深色模式
#    - 把窗口缩到 320px 宽，确认导航不换行、页面不出现横向滚动条
#    - 访问一个不存在的路径，确认看到自定义 404 页且样式正常
```
