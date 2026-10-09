# 个人主页

纯 HTML / CSS / JS 的静态个人主页，零依赖、零构建，部署在 GitHub Pages 根站点。

- 三个板块：关于我、技能、项目（外加联系区）
- 中英双语，右上角切换，选择记在 `localStorage`
- 暗色模式跟随系统自动切换
- 全部使用系统字体，不请求任何外部资源，断网也能正常显示

## 本地预览

直接双击 `index.html` 就能看（无 fetch 请求，`file://` 下功能完整）。

想更接近线上环境：

```bash
npx -y serve -l 4321 .
# 或
python -m http.server 4321
```

然后打开 <http://localhost:4321>。

## 文件说明

```
index.html              页面结构与全部中文文案 ← 改内容只改这个文件
assets/css/style.css    全部样式（配色变量在最上面）
assets/js/i18n.js       英文对照表 + 语言切换逻辑 ← 改英文只改这个文件
assets/js/main.js       滚动淡入、导航高亮、页脚年份
assets/img/favicon.svg  标签页图标
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
| 首屏链接 | `hero-links` 里的三个 `<a>` | 改 `href`，按需增删 `<li>` |
| 关于我 | `data-i18n="about.p1"` 等 | 三段，可增删 |
| 技能 | `id="skills"` 区块 | 见下 |
| 项目 | `data-i18n="projects.p1.title"` 等 | 见下 |
| 联系 | `id="contact"` 区块 | 邮箱、GitHub、掘金 |
| 页脚 | `<span id="year">` 所在行 | 年份自动更新，只需改姓名 |

**全局替换**：`https://github.com/yourname` 和 `hello@example.com` 各出现若干次，一次性替换掉。

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

### 4. 补英文翻译

`i18n.js` 里的 `en` 字典按 `data-i18n` 的 key 一一对应。**漏掉的 key 会自动回退成中文，并在浏览器控制台打出警告**，切到 EN 看一眼控制台就知道漏了哪些。

### 5. 换图标（可选）

`assets/img/favicon.svg` 是深色圆角方块 + 字母 H。改字母直接编辑这个文件里的 `<text>`。

### 6. 加头像（可选）

把图片放到 `assets/img/avatar.jpg`。目前首屏是纯文字排版，加头像需要自己在 `index.html` 的 `.hero` 里插一个 `<img>` 并补几行 CSS —— 保持现状也完全够用。

### 7. 改配色

`style.css` 顶部 `:root` 里的几个变量控制整套配色，`@media (prefers-color-scheme: dark)` 里是对应的暗色值：

```css
--bg:     #FAFAFA;                  /* 页面背景 */
--fg:     #111111;                  /* 正文 */
--muted:  #6B6B6B;                  /* 次要文字 */
--line:   #E5E5E5;                  /* 分割线、标签描边 */
--nav-bg: rgba(250,250,250,0.82);   /* 吸顶导航的半透明底色 */
```

改 `--bg` 时记得同步 `--nav-bg` 的 RGB 值，否则滚动时导航会和页面底色对不上。

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
