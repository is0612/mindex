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
 * 相册数据现在放在 public/photos.json，页面启动时读取。
 * 加照片只改那个文件，不用动这里，也不用重新构建。
 * 分类的顺序与显隐在 public/albums.json。
 */

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
