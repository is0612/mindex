import { computed, ref } from 'vue'
import {
  bundledPoems,
  genresOf,
  sortPoems,
  trimLines,
  yearsOf,
  type Poem,
  type PoemInput,
} from '@/data/poems'

/** 数据来源：dev 直写 poems.json / 静态站存 localStorage / 构建时打包的数据 */
export type StoreMode = 'file' | 'browser' | 'bundled'

const API = '/api/poems'
const CACHE_KEY = 'mindex:poems:v1'

// 先用打包的数据铺底，等接口/草稿回来再覆盖，首页不会出现空白卡片
const poems = ref<Poem[]>(sortPoems(bundledPoems))
const mode = ref<StoreMode>('bundled')
const saving = ref(false)
const error = ref('')

let loadedOnce = false
// 删除/导入前的快照，供「撤销」用
let snapshot: Poem[] | null = null

/* ---------------- 读缓存 ---------------- */

function readCache(): Poem[] | null {
  try {
    const text = localStorage.getItem(CACHE_KEY)
    if (!text) return null
    const data: unknown = JSON.parse(text)
    return normalize(data)
  } catch {
    return null
  }
}

function writeCache(list: Poem[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    /* ignore */
  }
}

/* ---------------- 校验与归一 ---------------- */

function normalize(input: unknown): Poem[] {
  if (!Array.isArray(input)) throw new Error('数据格式不对：应该是一个数组')
  const arr = input as Partial<Poem>[]
  return arr.map((item, i) => {
    const p = item as Partial<Poem>
    const title = typeof p.title === 'string' ? p.title.trim() : ''
    if (!title) throw new Error(`第 ${i + 1} 首缺少标题`)
    // 空行要留着：词牌靠它分上下阕
    const body = Array.isArray(p.body) ? trimLines(p.body.map((l) => String(l))) : []
    if (!body.some(Boolean)) throw new Error(`《${title}》正文为空`)
    return {
      id: typeof p.id === 'string' && p.id ? p.id : newId(arr as Poem[]),
      title,
      genre: typeof p.genre === 'string' ? p.genre.trim() : '',
      date: typeof p.date === 'string' ? p.date.slice(0, 10) : '',
      volumeNo: Number(p.volumeNo) || 1,
      body,
    } satisfies Poem
  })
}

function newId(list: Poem[]): string {
  const used = new Set(list.map((p) => p.id))
  let id = `qz${Math.floor(Date.now() / 1000)}`
  let n = 2
  while (used.has(id)) id = `qz${Math.floor(Date.now() / 1000)}${n++}`
  return id
}

/** 导入 JSON 时用：校验并归一 */
export function parsePoemsJson(text: string): Poem[] {
  return normalize(JSON.parse(text))
}

/* ---------------- 加载 ---------------- */

async function fetchFile(): Promise<Poem[] | null> {
  try {
    const res = await fetch(API, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    if (!res.ok) return null
    if (!(res.headers.get('Content-Type') ?? '').includes('json')) return null
    return normalize(await res.json())
  } catch {
    // 静态部署下没有这个接口，属正常
    return null
  }
}

export async function loadPoems(force = false) {
  if (loadedOnce && !force) return
  const file = await fetchFile()
  if (file) {
    poems.value = sortPoems(file)
    mode.value = 'file'
  } else {
    const cached = readCache()
    if (cached) {
      poems.value = sortPoems(cached)
      mode.value = 'browser'
    } else {
      poems.value = sortPoems(bundledPoems)
      mode.value = 'bundled'
    }
  }
  loadedOnce = true
}

/* ---------------- 落盘 ---------------- */

async function persist(): Promise<StoreMode> {
  if (mode.value === 'file') {
    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poems.value),
      })
      if (res.ok) {
        clearCache()
        return 'file'
      }
      error.value = `写文件失败（${res.status}），已改存浏览器本地`
    } catch {
      error.value = '连接不上开发服务器，已改存浏览器本地'
    }
    mode.value = 'browser'
  }

  writeCache(poems.value)
  if (mode.value === 'bundled') mode.value = 'browser'
  return mode.value
}

/* ---------------- 增删改 ---------------- */

function apply(next: Poem[]) {
  snapshot = poems.value
  poems.value = sortPoems(next)
}

export async function createPoem(input: PoemInput): Promise<Poem> {
  const list = poems.value
  const poem: Poem = {
    id: input.id ?? newId(list),
    title: input.title.trim(),
    genre: (input.genre ?? '').trim(),
    date: input.date || new Date().toISOString().slice(0, 10),
    volumeNo: Number(input.volumeNo) || 1,
    body: trimLines(input.body),
  }
  apply([...list, poem])
  saving.value = true
  await persist()
  saving.value = false
  return poem
}

export async function updatePoem(id: string, input: PoemInput): Promise<void> {
  apply(
    poems.value.map((p) =>
      p.id === id
        ? {
            ...p,
            title: input.title.trim(),
            genre: (input.genre ?? '').trim(),
            date: input.date || p.date,
            volumeNo: Number(input.volumeNo) || 1,
            body: trimLines(input.body),
          }
        : p,
    ),
  )
  saving.value = true
  await persist()
  saving.value = false
}

export async function deletePoems(ids: string[]): Promise<number> {
  const kill = new Set(ids)
  const before = poems.value.length
  apply(poems.value.filter((p) => !kill.has(p.id)))
  saving.value = true
  await persist()
  saving.value = false
  return before - poems.value.length
}

/** 整表替换（导入 JSON 用） */
export async function replacePoems(list: Poem[]): Promise<void> {
  apply(sortPoems(list))
  saving.value = true
  await persist()
  saving.value = false
}

/** 丢弃所有改动，回到构建时的数据 */
export async function restoreBundled(): Promise<void> {
  apply(sortPoems(bundledPoems))
  clearCache()
  if (mode.value === 'file') {
    await persist()
  } else {
    mode.value = 'bundled'
  }
}

export async function undoLast(): Promise<boolean> {
  if (!snapshot) return false
  const back = snapshot
  snapshot = null
  poems.value = back
  saving.value = true
  await persist()
  saving.value = false
  return true
}

export function discardSnapshot() {
  snapshot = null
}

export function clearError() {
  error.value = ''
}

/* ---------------- 派生数据 ---------------- */

export const years = computed(() => yearsOf(poems.value))
export const genres = computed(() => genresOf(poems.value))

export const stats = computed(() => ({
  total: poems.value.length,
  years: yearsOf(poems.value).length,
  genres: genresOf(poems.value).length,
  lines: poems.value.reduce((sum, p) => sum + p.body.filter(Boolean).length, 0),
}))

export { poems, mode, saving, error }
