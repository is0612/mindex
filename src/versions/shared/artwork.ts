/**
 * 新主页专用的程序化配图。
 *
 * 和旧的 artwork.ts 不同，这里不画"模糊色块"，而是画一张有构图的抽象照片：
 * 渐变底 + 柔光椭圆 + 一条水平结构线 + 边缘压暗 + 颗粒。
 * 没有真实照片时，它至少看起来是"一张作品"，而不是"一块占位"。
 *
 * 真实照片放 public/photos/ 并在 data/photos.ts 里补 src 即可，这里会让位。
 */

import { photoSrc, type Photo } from '@/data/photos'

export type Tone = 'mist' | 'dusk' | 'moss' | 'sand' | 'ink'

interface Swatch {
  from: string
  to: string
  light: string
  deep: string
  shape: string
}

const TONES: Record<Tone, Swatch> = {
  mist: { from: '#e4edf4', to: '#a6bfd0', light: '#fbfdff', deep: '#6b8798', shape: '#8fb1c6' },
  dusk: { from: '#fcebdc', to: '#cb9a85', light: '#fff8f1', deep: '#8b6053', shape: '#dda78d' },
  moss: { from: '#e8eee1', to: '#aabfa4', light: '#f9fbf3', deep: '#6d8470', shape: '#94ab8e' },
  sand: { from: '#f7eddc', to: '#cbb492', light: '#fdf9f1', deep: '#92805e', shape: '#d5be98' },
  ink: { from: '#e6eaed', to: '#98a2a8', light: '#f6f8f9', deep: '#576268', shape: '#828d93' },
}

/** 稳定随机：同一个 seed 永远画出同一张图 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function encode(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** 封面：一张有水平结构的抽象照片 */
export function coverUri(seed: number, tone: Tone = 'mist', width = 1200, height = 1500): string {
  const rnd = mulberry32(seed * 2654435761 + 13)
  const c = TONES[tone] ?? TONES.mist
  const horizon = height * (0.5 + rnd() * 0.16)
  const blur = Math.round(width * 0.075)

  const blobs: string[] = []
  for (let i = 0; i < 3; i += 1) {
    const cx = rnd() * width
    const cy = rnd() * height
    const rx = width * (0.22 + rnd() * 0.3)
    const ry = rx * (0.7 + rnd() * 0.7)
    const fill = [c.light, c.shape, c.deep][Math.floor(rnd() * 3)]
    blobs.push(
      `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" fill="${fill}" opacity="${(0.24 + rnd() * 0.3).toFixed(2)}"/>`,
    )
  }

  const arcX = width * (0.3 + rnd() * 0.4)
  const arcR = width * (0.34 + rnd() * 0.3)

  return encode(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0.55" y2="1">
<stop offset="0" stop-color="${c.from}"/><stop offset="0.62" stop-color="${c.to}"/><stop offset="1" stop-color="${c.deep}"/>
</linearGradient>
<linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${c.light}" stop-opacity="0.5"/><stop offset="1" stop-color="${c.deep}" stop-opacity="0.42"/>
</linearGradient>
<radialGradient id="vig" cx="0.5" cy="0.42" r="0.78">
<stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="${c.deep}" stop-opacity="0.3"/>
</radialGradient>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${blur}"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${Math.floor(rnd() * 90)}"/><feColorMatrix type="saturate" values="0"/></filter>
</defs>
<rect width="${width}" height="${height}" fill="url(#bg)"/>
<g filter="url(#soft)">${blobs.join('')}</g>
<rect x="0" y="${horizon.toFixed(0)}" width="${width}" height="${(height - horizon).toFixed(0)}" fill="url(#band)" opacity="0.55"/>
<circle cx="${arcX.toFixed(0)}" cy="${horizon.toFixed(0)}" r="${arcR.toFixed(0)}" fill="none" stroke="${c.light}" stroke-width="1.6" opacity="0.5"/>
<rect width="${width}" height="${height}" fill="url(#vig)"/>
<rect width="${width}" height="${height}" filter="url(#grain)" opacity="0.07"/>
</svg>`)
}

/** 有真实照片用真图，没有就用上面生成的抽象封面 */
export function coverSrc(photo: Photo): string {
  return photo.src?.trim() ? photoSrc(photo) : coverUri(photo.seed, photo.palette)
}
