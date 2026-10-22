/**
 * AI 陪练 · 关系档案
 *
 * 为什么要有这东西：
 * 场景只给一句话（「跟领导请假」），模型不知道「你是谁、我们之间发生过什么」，
 * 就会自己编一个世界——凭空问「你班车司机最近咋样」这种现实里根本不存在的人和事。
 * 档案把人物、共同经历、雷区写死，模型只在这个范围里活动。
 *
 * 存储：只进 localStorage。本站是公开仓库 + Pages，档案绝不能落进 src/data 或进 git。
 */

export interface Persona {
  id: string
  /** 称呼，也是提示词里模型对自己的指代 */
  name: string
  /** 这人是谁：年龄、职业、和你的关系，一句话 */
  relation: string
  /** 你们之间发生过什么、TA 知道的事，一行一件 */
  facts: string[]
  /** TA 常问的、在意的、会主动提的，一行一件 */
  topics: string[]
  /** 说话方式：口头禅、语气、方言、话多还是话少，一行一条 */
  voice: string[]
  /** 不能提的人和事，一行一件 */
  avoid: string[]
  updatedAt: number
}

const LIST_KEY = 'mindex.coach.personas.v1'
const ACTIVE_KEY = 'mindex.coach.activePersona.v1'

/** 编辑器里用多行文本框，一行一条；空行和首尾空白全部丢掉 */
export function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function newPersona(): Persona {
  return {
    id: `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: '',
    relation: '',
    facts: [],
    topics: [],
    voice: [],
    avoid: [],
    updatedAt: Date.now(),
  }
}

function sanitize(raw: unknown): Persona | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>
  if (typeof o.id !== 'string' || !o.id) return null
  const name = typeof o.name === 'string' ? o.name.trim() : ''
  if (!name) return null
  const lines = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean) : []
  return {
    id: o.id,
    name,
    relation: typeof o.relation === 'string' ? o.relation.trim() : '',
    facts: lines(o.facts),
    topics: lines(o.topics),
    voice: lines(o.voice),
    avoid: lines(o.avoid),
    updatedAt: typeof o.updatedAt === 'number' ? o.updatedAt : Date.now(),
  }
}

export function loadPersonas(): Persona[] {
  try {
    const raw = localStorage.getItem(LIST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(sanitize).filter((p): p is Persona => p !== null)
  } catch {
    return []
  }
}

export function savePersonas(list: Persona[]): void {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(list))
  } catch {
    // 隐私模式或配额满，忽略
  }
}

export function loadActiveId(): string {
  try {
    return localStorage.getItem(ACTIVE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveActiveId(id: string): void {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch {
    // 同上
  }
}

/** 把档案渲染成给模型看的文本块；空字段整段跳过，不留空标题 */
export function buildPersonaBlock(p: Persona): string {
  const parts: string[] = []
  parts.push(`对方是「${p.name}」。`)
  if (p.relation) parts.push(p.relation)

  const section = (title: string, items: string[]) => {
    if (!items.length) return
    parts.push(`\n${title}\n${items.map((s) => `- ${s}`).join('\n')}`)
  }

  section('【你们之间真实发生过、TA 知道的】', p.facts)
  section('【TA 常问的、在意的、会主动提的】', p.topics)
  section('【TA 说话的方式】', p.voice)
  section('【绝对不提的人和事】', p.avoid)

  parts.push(
    '\n以上是全部。没写在这里的人、事、地点一律不存在，不许提，也不许为了把话聊下去自己造一个。',
  )
  return parts.join('\n')
}

/** 档案能不能拿去做陪练（至少要有个称呼） */
export function isUsable(p: Persona | null): p is Persona {
  return !!p && p.name.trim().length > 0
}
