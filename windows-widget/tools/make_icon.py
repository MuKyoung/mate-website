"""MATE 캘린더 아이콘(Assets/app.ico)을 만든다 - 갤럭시 위젯 'MATE 오늘'과 같은 그림(파란 바탕 · 흰 달력 + 체크).

python tools/make_icon.py   (Pillow 필요)
"""
from pathlib import Path

from PIL import Image, ImageDraw

BLUE = (0x26, 0x44, 0xCB, 255)
BLUE_TOP = (0x3A, 0x5B, 0xE6, 255)
WHITE = (255, 255, 255, 255)
SIZES = [16, 20, 24, 32, 40, 48, 64, 96, 128, 256]
OUT = Path(__file__).resolve().parent.parent / "Assets" / "app.ico"


def render(size: int, stroke_mul: float) -> Image.Image:
    ss = 8  # 키워 그린 뒤 줄여 테두리를 부드럽게
    n = size * ss
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 둥근 사각 바탕 - 위가 조금 밝은 세로 그라데이션
    pad = round(n * 0.055)
    radius = round(n * 0.22)
    mask = Image.new("L", (n, n), 0)
    ImageDraw.Draw(mask).rounded_rectangle((pad, pad, n - pad, n - pad), radius=radius, fill=255)
    grad = Image.new("RGBA", (n, n))
    gd = ImageDraw.Draw(grad)
    for y in range(n):
        t = y / (n - 1)
        c = tuple(round(BLUE_TOP[i] * (1 - t) + BLUE[i] * t) for i in range(3)) + (255,)
        gd.line((0, y, n, y), fill=c)
    img.paste(grad, (0, 0), mask)

    # 안드로이드 아이콘(108 단위, 보이는 칸 18..90)을 둥근 사각 안으로 옮긴다
    side = n - 2 * pad
    k = side / 72.0

    def P(x: float, y: float) -> tuple[float, float]:
        return (pad + (x - 18) * k, pad + (y - 18) * k)

    def line(points, w):
        pts = [P(*p) for p in points]
        width = max(1, round(w * k * stroke_mul))
        d.line(pts, fill=WHITE, width=width, joint="curve")
        r = width / 2
        for (x, y) in (pts[0], pts[-1]):
            d.ellipse((x - r, y - r, x + r, y + r), fill=WHITE)

    w = 4.0
    # 달력 몸통
    x0, y0 = P(34, 38)
    x1, y1 = P(74, 74)
    width = max(1, round(w * k * stroke_mul))
    d.rounded_rectangle((x0, y0, x1, y1), radius=round(5 * k), outline=WHITE, width=width)
    line([(34, 48), (74, 48)], w)
    line([(44, 33), (44, 42)], w)
    line([(64, 33), (64, 42)], w)
    # 체크
    line([(45, 61), (51, 67), (63, 55)], 4.5)

    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    images = [render(s, 1.45 if s <= 24 else 1.2 if s <= 48 else 1.0) for s in SIZES]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    images[-1].save(OUT, format="ICO", sizes=[(s, s) for s in SIZES], append_images=images[:-1])
    images[-1].save(OUT.with_suffix(".png"))
    print(OUT, OUT.stat().st_size)


if __name__ == "__main__":
    main()
