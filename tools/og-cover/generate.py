"""把 template.html 渲染成 og:image 分享卡片。

用法（在仓库根目录执行）：
    python tools/og-cover/generate.py

依赖 Playwright。若未安装：
    pip install playwright
    playwright install chromium      # 或复用系统 Chrome，见下方 channel 参数

输出：assets/img/og-cover.png，1200x630。
改完 template.html 里姓名/职位后重新跑一次即可。
"""

import pathlib
import sys

from playwright.sync_api import sync_playwright

WIDTH, HEIGHT = 1200, 630

ROOT = pathlib.Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "tools" / "og-cover" / "template.html"
OUT = ROOT / "assets" / "img" / "og-cover.png"


def main() -> int:
    if not TEMPLATE.exists():
        print(f"找不到模板：{TEMPLATE}", file=sys.stderr)
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        # 优先用系统已装的 Chrome，省掉 playwright install 下载的 140MB 内核。
        # 没装 Chrome 的话把 channel 改成 None，会回退到 Playwright 自带内核。
        try:
            browser = p.chromium.launch(headless=True, channel="chrome")
        except Exception:
            browser = p.chromium.launch(headless=True)

        page = browser.new_page(
            viewport={"width": WIDTH, "height": HEIGHT},
            device_scale_factor=1,
        )
        page.goto(TEMPLATE.as_uri(), wait_until="load")
        page.wait_for_timeout(250)          # 等字体加载完成再截图
        page.screenshot(path=str(OUT))
        browser.close()

    size_kb = OUT.stat().st_size / 1024
    print(f"已生成 {OUT.relative_to(ROOT)}  ({WIDTH}x{HEIGHT}, {size_kb:.1f} KB)")

    if size_kb > 300:
        print("警告：超过 300 KB，部分平台会压缩得很难看", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
