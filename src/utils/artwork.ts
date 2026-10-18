/**
 * 程序化配图：在没有真实照片时生成一张抽象封面，
 * 保证页面开箱就有内容、也不依赖任何网络资源。
 * 想换成真图，只要在 photos.ts 里填 src 即可，这里会自动让位。
 */

export type PaletteKey = 'mist' | 'dusk' | 'moss' | 'sand' | 'ink'

const PALETTES: Record<PaletteKey, [string, string, string, string, string]> = {
  mist: ['#e8eef2', '#cfdde6', '#9fb4c3', '#7c93a4', '#f8f5ee'],
  dusk: ['#f7e6d8', '#eec5ab', '#d59a80', '#9c6b62', '#5b4a52'],
  moss: ['#e7ebe0', '#c8d3bd', '#93ac95', '#5b7466', '#3b4e44'],
  sand: ['#f4ecdd', '#e6d7b9', '#cbb28a', '#9c8563', '#6b5b43'],
  ink: ['#eeeeea', '#d2d4d0', '#a4a8a3', '#6f746f', '#2e3230'],
}

/** 稳定随机数：同一个 seed 永远画出同一张图 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function artworkUri(
  seed: number,
  palette: PaletteKey = 'mist',
  width = 900,
  height = 1125,
): string {
  const rnd = mulberry32(seed * 2654435761 + 7)
  const colors = PALETTES[palette] ?? PALETTES.mist

  const blobs: string[] = []
  const count = 3 + Math.floor(rnd() * 3)
  for (let i = 0; i < count; i += 1) {
    const cx = rnd() * width
    const cy = rnd() * height
    const r = (0.24 + rnd() * 0.4) * width
    const fill = colors[Math.floor(rnd() * colors.length)]
    const opacity = (0.28 + rnd() * 0.42).toFixed(2)
    blobs.push(
      `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="${opacity}"/>`,
    )
  }

  // 两条若隐若现的弧线，让画面不至于太"糊"
  const strokes: string[] = []
  for (let i = 0; i < 2; i += 1) {
    const cx = rnd() * width
    const cy = rnd() * height
    const r = (0.3 + rnd() * 0.45) * width
    strokes.push(
      `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="${colors[4]}" stroke-width="${(1 + rnd() * 1.6).toFixed(1)}" opacity="${(0.1 + rnd() * 0.16).toFixed(2)}"/>`,
    )
  }

  const blur = (width * 0.085).toFixed(0)
  const freq = (0.65 + rnd() * 0.45).toFixed(2)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${colors[0]}"/><stop offset="0.55" stop-color="${colors[1]}"/><stop offset="1" stop-color="${colors[2]}"/>
</linearGradient>
<filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${blur}"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${Math.floor(rnd() * 99)}"/><feColorMatrix type="saturate" values="0"/></filter>
</defs>
<rect width="${width}" height="${height}" fill="url(#bg)"/>
<g filter="url(#soft)">${blobs.join('')}</g>
<g>${strokes.join('')}</g>
<rect width="${width}" height="${height}" filter="url(#grain)" opacity="0.06"/>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
