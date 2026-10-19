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

/** 句末标点 */
const TRAILING = /[，。！？、；：,.!?;:]+$/

/** 去掉句末标点，竖排用 */
export function stripEnd(line: string): string {
  return line.trim().replace(TRAILING, '')
}

export type PoemLayout = 'vertical' | 'flat'

/** 词、句数多或长句的诗横排，其余律绝竖排 */
export function poemLayout(poem: Poem): PoemLayout {
  const lines = poem.body.map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return 'flat'
  if (poem.genre.includes('词') || poem.title.includes('·')) return 'flat'
  if (lines.length > 8) return 'flat'
  const longest = Math.max(...lines.map((l) => stripEnd(l).length))
  return longest <= 9 ? 'vertical' : 'flat'
}

/** 今日一首取前几句，竖排时去标点 */
export function excerpt(poem: Poem, max = 4): { lines: string[]; trimmed: boolean } {
  const layout = poemLayout(poem)
  return {
    lines: poem.body.slice(0, max).map((l) => (layout === 'vertical' ? stripEnd(l) : l.trim())),
    trimmed: poem.body.length > max,
  }
}
