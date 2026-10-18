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

/** 按写作日期倒序，最新的在最前 */
export const poems = raw as unknown as Poem[]

/** 出现过的年份，新的在前 */
export const years = Array.from(new Set(poems.map((p) => p.date.slice(0, 4))))
  .filter(Boolean)
  .sort((a, b) => b.localeCompare(a))

/** 取首句，去掉句末标点，用作卡片摘要 */
export function firstLine(poem: Poem): string {
  const line = poem.body.find((l) => l.trim()) ?? ''
  return line.replace(/[，。！？、；：,]+$/, '')
}

/** 同一天打开永远是同一首，换日才换诗 */
export function poemOfDay(day = new Date()): Poem {
  const key = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return poems[hash % poems.length]
}

/** 2026-01-21 → 2026.01.21 */
export function formatDate(date: string): string {
  return date.replace(/-/g, '.')
}
