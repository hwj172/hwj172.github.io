"""生成首页视觉带用的抽象图形（SVG）。

用法（在仓库根目录执行）：
    python tools/visual/generate.py

图形是一张**分布式链路追踪瀑布图**的抽象化——横向细条代表一个个 span，
长短与起始位置错落，间以三条服务边界竖线。对后端/微服务语境来说，
这比任何纯装饰图形都更切题，而且元素少（约 40 个），体积只有几 KB。

图形本身不含颜色——它是当作 mask 用的，实际颜色由 CSS 决定，
所以能自动跟随明暗主题。详见 style.css 的 .visual-shape。
"""

import pathlib
import random

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "img"

W, H = 1600, 360
BARS = 26
SEED = 20261009          # 固定种子：每次生成结果一致，便于 diff


def waterfall() -> str:
    """错落的横条，模拟调用链的 span 时长。"""
    rng = random.Random(SEED)
    parts = []
    gap = H / (BARS + 1)

    for i in range(BARS):
        y = round(gap * (i + 1) - 2, 1)
        # 递进地往右铺开，形成自上而下的调用链观感
        start = rng.uniform(0, W * 0.42)
        length = rng.uniform(W * 0.18, W * 0.46)
        end = min(start + length, W - 8)
        parts.append(
            f'<rect x="{round(start,1)}" y="{y}" '
            f'width="{round(end - start,1)}" height="4" rx="2"/>'
        )
    return "".join(parts)


def boundaries() -> str:
    """三条服务边界竖线，让横条有落脚的参照。"""
    parts = []
    for x in (W * 0.30, W * 0.58, W * 0.82):
        parts.append(f'<rect x="{round(x)}" y="0" width="1" height="{H}"/>')
    return "".join(parts)


def build() -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" fill="#000">'
        f'<g opacity="0.34">{boundaries()}</g>'
        f'<g>{waterfall()}</g>'
        f'</svg>'
    )


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "visual-trace.svg"
    old = OUT / "visual-field.svg"      # 上一版点阵图，已弃用
    if old.exists():
        old.unlink()
        print(f"已删除弃用的 {old.relative_to(ROOT)}")

    path.write_text(build(), encoding="utf-8")
    print(f"已生成 {path.relative_to(ROOT)}  ({W}x{H}, {path.stat().st_size / 1024:.1f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
