import { artworkUri, type PaletteKey } from '@/utils/artwork'

export interface Photo {
  id: string
  /** 真实照片路径，例如 'photos/morning.jpg'（把文件放到 public/photos/ 下）。
   *  留空则自动用程序化抽象封面占位。 */
  src?: string
  title: string
  category: string
  /** 展示用的时间，格式随意 */
  date: string
  /** 占位图的随机种子，同一个数字永远生成同一张图 */
  seed: number
  palette: PaletteKey
}

/**
 * 相册数据
 * ---------------------------------------------------------------
 * 换成自己的照片：
 *   1. 图片放进 public/photos/ 目录（jpg / webp 都行，长边 1600px 以内足够）
 *   2. 在下面每一项里补上 src: 'photos/文件名.jpg'
 *   3. category 随便写新词，页面上的筛选按钮会自动长出来
 */
export const photos: Photo[] = [
  { id: 'p01', title: '清晨的雾还没散', category: '风景', date: '2026.03', seed: 12, palette: 'mist' },
  { id: 'p02', title: '旧巷子里的光', category: '人文', date: '2026.02', seed: 27, palette: 'sand' },
  { id: 'p03', title: '雨后屋檐', category: '日常', date: '2026.04', seed: 41, palette: 'moss' },
  { id: 'p04', title: '落日把山染红', category: '风景', date: '2026.01', seed: 58, palette: 'dusk' },
  { id: 'p05', title: '窗前的绿萝', category: '日常', date: '2026.05', seed: 63, palette: 'moss' },
  { id: 'p06', title: '巷口的老人', category: '人文', date: '2025.12', seed: 77, palette: 'ink' },
  { id: 'p07', title: '海边的风很大', category: '风景', date: '2026.06', seed: 84, palette: 'mist' },
  { id: 'p08', title: '深夜的路灯', category: '日常', date: '2026.03', seed: 96, palette: 'ink' },
  { id: 'p09', title: '书桌一角', category: '日常', date: '2026.05', seed: 108, palette: 'sand' },
  { id: 'p10', title: '山寺的钟', category: '人文', date: '2026.02', seed: 119, palette: 'moss' },
  { id: 'p11', title: '云从窗外来', category: '风景', date: '2026.07', seed: 133, palette: 'dusk' },
  { id: 'p12', title: '一碗热汤面', category: '日常', date: '2026.04', seed: 147, palette: 'sand' },
]

/** 取图片地址：有真图用真图，没有就程序化生成一张 */
export function photoSrc(photo: Photo): string {
  const src = photo.src?.trim()
  if (!src) return artworkUri(photo.seed, photo.palette)
  if (/^(https?:|data:|blob:)/.test(src) || src.startsWith('/')) return src

  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  return `${base}${src.replace(/^\.?\//, '')}`
}
