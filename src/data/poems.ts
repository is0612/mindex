import raw from './poems.json'

export interface Poem {
  id: string
  title: string
  /** 七律 / 五绝 / 词牌名… */
  genre: string
  /** YYYY-MM-DD */
  date: string
  volumeNo: number
  body: string[]
}

/** 提交字段，id 由 store 生成 */
export type PoemInput = Omit<Poem, 'id'> & { id?: string }

/** 构建时打包的数据，「恢复初始」用 */
export const bundledPoems = raw as unknown as Poem[]

/** 日期倒序，同日按 id 倒序 */
export function sortPoems(list: Poem[]): Poem[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
}

/** 出现过的年份，新的在前 */
export function yearsOf(list: Poem[]): string[] {
  return Array.from(new Set(list.map((p) => p.date.slice(0, 4))))
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))
}

/** 出现过的体裁，按数量多的在前 */
export function genresOf(list: Poem[]): string[] {
  const count = new Map<string, number>()
  for (const p of list) {
    const key = p.genre?.trim()
    if (key) count.set(key, (count.get(key) ?? 0) + 1)
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name)
}

/** 取首句，去掉句末标点，用作卡片摘要 */
export function firstLine(poem: Poem): string {
  const lines = poem.body.map((l) => l.trim()).filter(Boolean)
  const clean = (l: string) => l.replace(/[，。！？、；：,]+$/, '')
  const first = clean(lines[0] ?? '')

  // 有些词把题目写进了正文第一句，卡片上会和标题重复，往下一句取
  if (first && (poem.title.includes(first) || first.includes(poem.title))) {
    return clean(lines[1] ?? '') || first
  }
  return first
}

/** 同一天打开永远是同一首，换日才换诗 */
export function poemOfDay(list: Poem[], day = new Date()): Poem | null {
  if (!list.length) return null
  const key = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return list[hash % list.length]
}

/** 2026-01-21 → 2026.01.21 */
export function formatDate(date: string): string {
  return date.replace(/-/g, '.')
}

/** 去首尾空行，中间空行保留（词分上下阕用） */
export function trimLines(body: string[]): string[] {
  const lines = body.map((l) => l.trim())
  while (lines.length && !lines[0]) lines.shift()
  while (lines.length && !lines[lines.length - 1]) lines.pop()
  return lines
}

/**
 * 正文直接按数据里的分行渲染：富文本里怎么排，页面上就怎么排。
 * 空行（空串）保留，用来分上下阕。
 */
export function linesOf(poem: Poem): string[] {
  return trimLines(poem.body)
}
