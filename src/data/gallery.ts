import { computed, ref } from 'vue'
import type { Photo } from './photos'

/**
 * 相册数据的运行时加载器。
 *
 * 数据在 public/photos.json 与 public/albums.json，改完 push 就生效，
 * 不需要改 Vue 代码、也不需要重新构建。
 * 用的是单例状态：多个组件调用也只发一次请求。
 */

export interface Album {
  id: string
  /** 与照片的 category 字段对应 */
  name: string
  /** 排序，越小越靠前 */
  order?: number
  /** false 时不在筛选栏出现（照片仍可通过链接访问） */
  visible?: boolean
}

const photos = ref<Photo[]>([])
const albums = ref<Album[]>([])
const loading = ref(true)
const failed = ref(false)

let started = false

function endpoint(file: string): string {
  const base = import.meta.env.BASE_URL
  return `${base.endsWith('/') ? base : `${base}/`}${file}`
}

async function load(): Promise<void> {
  if (started) return
  started = true

  try {
    const [photoRes, albumRes] = await Promise.all([
      fetch(endpoint('photos.json'), { cache: 'no-cache' }),
      fetch(endpoint('albums.json'), { cache: 'no-cache' }),
    ])

    if (!photoRes.ok) throw new Error(`photos.json → ${photoRes.status}`)
    const list = await photoRes.json()
    photos.value = Array.isArray(list) ? (list as Photo[]) : []

    if (albumRes.ok) {
      const data = await albumRes.json()
      albums.value = Array.isArray(data?.albums) ? (data.albums as Album[]) : []
    }
  } catch (error) {
    failed.value = true
    console.error('[gallery] 相册数据加载失败：', error)
  } finally {
    loading.value = false
  }
}

/** 筛选栏的顺序：先按 albums.json 的 order，再补上 JSON 里没登记的分类 */
const categories = computed<string[]>(() => {
  const configured = albums.value
    .filter((album) => album.visible !== false)
    .slice()
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .map((album) => album.name)

  const unlisted = Array.from(new Set(photos.value.map((p) => p.category))).filter(
    (name) => !configured.includes(name),
  )

  return ['全部', ...configured, ...unlisted]
})

export function useGallery() {
  return { photos, categories, loading, failed, load }
}
