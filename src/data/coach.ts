/**
 * AI 陪练 —— 提示词、场景、接口调用
 *
 * 设计要点：
 * 1. 陪练与讲评是**两次独立请求**，讲评用干净的上下文，避免被角色人格带软。
 * 2. Key 只存在浏览器 localStorage，不写进代码、不上传任何地方。
 * 3. 接口按 OpenAI 兼容格式写，换成 Kimi / 通义等改一下 Base URL 即可。
 */

/* ============================================================
   类型
   ============================================================ */

export interface CoachSettings {
  baseUrl: string
  apiKey: string
  model: string
}

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ReviewFix {
  original: string
  better: string
  why: string
}

export interface ReviewResult {
  verdict: string
  reason: string
  fixes: ReviewFix[]
  next: string
}

export class CoachError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'CoachError'
    this.code = code
  }
}

/* ============================================================
   设置（localStorage）
   ============================================================ */

const SETTINGS_KEY = 'mindex.coach.settings.v1'

export const defaultSettings: CoachSettings = {
  baseUrl: 'https://api.deepseek.com',
  apiKey: '',
  model: 'deepseek-flash',
}

/** 可选模型，只是输入框的下拉建议，填别的也行 */
export const MODEL_PRESETS = [
  { id: 'deepseek-flash', note: '日常对话够用，便宜、快' },
  { id: 'deepseek-v4-pro', note: '复盘更准，贵不少' },
]

/** 旧模型名映射：deepseek-chat 是以前的通用别名，现在指向 flash */
const LEGACY_MODEL: Record<string, string> = {
  'deepseek-chat': 'deepseek-flash',
  'deepseek-reasoner': 'deepseek-flash',
  'deepseek-v4-flash': 'deepseek-flash',
}

export function loadSettings(): CoachSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...defaultSettings }
    const parsed = JSON.parse(raw) as Partial<CoachSettings>
    const saved = parsed.model?.trim() || defaultSettings.model
    return {
      baseUrl: parsed.baseUrl?.trim() || defaultSettings.baseUrl,
      apiKey: parsed.apiKey ?? '',
      model: LEGACY_MODEL[saved] ?? saved,
    }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(next: CoachSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  } catch {
    // 隐私模式下 localStorage 可能不可用，忽略即可
  }
}

/* ============================================================
   场景
   ============================================================ */

export const PRESETS: string[] = [
  '跟领导请假',
  '汇报到一半被打断',
  '过年被问工资和对象',
  '加微信之后第一句',
  '电梯里遇到领导',
  '拒绝一个不想去的饭局',
]

/* ============================================================
   提示词：陪练（只演不教）
   ============================================================ */

export const ROLE_PROMPT = `你在陪一个人做对话练习。对方是内向的人，想练跟某类人说话。你不是教练，你是对话里的另一个人。

【你是谁】
用户会告诉你：对方是谁、你们什么关系、你们之间发生过什么（有时会给一份详细档案，有时只有一句话）。
这些就是全部，你只知道这些。
- 用户没写的地点、人物、事件，一律不存在。你没有别的亲戚、朋友、同事、邻居、司机。
- 不许为了把话聊下去，自己想出一个人来问。「你班车司机最近咋样」「你同事那事解决了没」这种句子，档案里没这个人时绝对不能出现。
- 遇到你不认识的人或事，就照真人反应问：「谁啊」「哪个」「你说的是谁」。这不算出戏，这是正常人的反应。
- 你「自己的事」只能从交代过的内容里长出来。没交代，你就是个刚忙完手头事、没什么特别要讲的人，不是个自带剧情的人。
- 只推断「关系类型」和「大概场合」，不要推断具体的生活内容。

【开场】
不要确认、不要复述、不要问「你想练哪方面」。直接用对方的身份说出第一句话，必要时在句首用一行括号交代场景。

【硬规则】
1. 只演这一个人。不写旁白，不解释自己在干什么，不总结。
2. 一次只回 1-3 句，口语，像真人说话。可以有「嗯」「那个」「行吧」这种停顿词。
3. 绝不点评、不建议、不鼓励。不说「这个说法不错」「你可以试着……」。
4. 绝不救场。对方说了尴尬的话，就按真实反应来：沉默、敷衍一声「嗯」、转开话题、皱眉说「啊？」。不主动给台阶。
5. 你有自己的情绪和注意力，会看手机，会打断，会不耐烦。但不许靠编造人物和事件来表现这些。
6. 不主动交代你的立场和情绪，让对方自己猜。
7. 不制造话题。真人聊天有大量空白——可以只回「嗯」「哦」「知道了」，可以让对话冷下来。冷场不需要你负责。
8. 不加表情符号，不用 markdown，不用「首先其次」这种书面语。

【难度】
默认中等：不刻意刁难，也不给台阶。对方自己把话聊死，就让它死。

【唯一例外】
如果用户输入「结束」，只回复：（本轮结束）。除此之外任何情况都不出戏。`

/**
 * 把关系档案拼到角色提示词后面。
 * 放在后面是有意的：越靠后的指令权重越高，具体档案要压过通用规则。
 */
export function composeRolePrompt(personaBlock?: string): string {
  const block = personaBlock?.trim()
  if (!block) return ROLE_PROMPT
  return `${ROLE_PROMPT}\n\n---\n\n【本次的对方】\n${block}`
}

/* ============================================================
   提示词：讲评（教你怎么说）
   ============================================================ */

export const REVIEW_PROMPT = `你在给一场对话练习做复盘。用户是内向的人，正在练跟某类人说话。下面是刚才的完整对话记录。

请挑出代价最大的几句话，告诉他当时该怎么说。只输出 json，不要输出任何其他文字，不要用代码块包起来。

json 结构：
{
  "verdict": "过 或 勉强过 或 不过",
  "reason": "一句话说清为什么，不超过 40 字",
  "fixes": [
    { "original": "他的原话，逐字引用", "better": "改后的句子", "why": "一句理由" }
  ],
  "next": "下次只做一件事"
}

规则：
1. 挑「代价最大」的，不是「最差」的。代价指：让对方误解意思、觉得你不靠谱、把对话聊死、越界让人不舒服。
2. fixes 最多 3 条，至少 1 条。整场只有一两句有问题就给一两句，不要凑数。
3. better 必须能直接照着念出来，口语，不超过 30 个字；保留他原本想表达的意思，只改说法，不替他换立场。
4. why 只能一句话，必须站在对方当时的处境里说：他那刻在想什么、在意什么、担心什么。不许写「这样更得体」「显得你情商高」这类评价式理由。
5. 禁止出现这些词：真诚、共情、情商、沟通技巧、表达清晰、思路清晰、得体、分寸感。
6. next 只能是一个今天就能做的动作，不许是心态类的东西。
7. 按对话里实际的关系判标准：对领导看他能不能交付、有没有浪费时间、会不会让他难做；对长辈看有没有被尊重、被需要；对同龄异性看有没有被听见、有没有越界；对陌生人看这对话会不会没完没了。
8. 不要重复转述整段对话，不要复述他说过的话。

如果整场确实没出问题，verdict 写「过」，fixes 给 1 条仍然可以更好的地方，不要硬挑毛病。`

/* ============================================================
   接口调用
   ============================================================ */

export async function chatCompletion(
  settings: CoachSettings,
  messages: ChatMessage[],
  opts: { temperature?: number; json?: boolean; think?: boolean } = {},
): Promise<string> {
  const key = settings.apiKey.trim()
  if (!key) {
    throw new CoachError('missing-key', '还没有填 API Key。点「设置」填一个，key 只存在你自己的浏览器里。')
  }

  const base = (settings.baseUrl.trim() || defaultSettings.baseUrl).replace(/\/+$/, '')
  const model = settings.model.trim() || defaultSettings.model
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 90_000)

  /**
   * DeepSeek 默认开思考模式：陪练时每句话都要先想一遍，等太久；
   * 而且思考模式下 temperature 不生效。所以陪练显式关掉，复盘才开。
   */
  const isDeepSeek = /(^|\.)deepseek\.com$/i.test(new URL(base).hostname)
  const body: Record<string, unknown> = { model, messages }
  if (opts.json) body.response_format = { type: 'json_object' }
  if (!opts.think && opts.temperature !== undefined) body.temperature = opts.temperature
  if (isDeepSeek) {
    body.thinking = { type: opts.think ? 'enabled' : 'disabled' }
    if (opts.think) body.reasoning_effort = 'high'
  }

  let res: Response
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch {
    window.clearTimeout(timer)
    if (controller.signal.aborted) {
      throw new CoachError('timeout', '等太久了，模型没回。再试一次。')
    }
    throw new CoachError('network', '连不上接口。检查一下网络，或者 Base URL 填错了。')
  }
  window.clearTimeout(timer)

  if (!res.ok) {
    let detail = ''
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      detail = body.error?.message ?? ''
    } catch {
      detail = ''
    }
    if (res.status === 401) throw new CoachError('auth', 'API Key 不对，或者已经失效了。')
    if (res.status === 402) throw new CoachError('billing', '账户余额不够了。')
    if (res.status === 429) throw new CoachError('rate', '请求太快了，等一下再试。')
    throw new CoachError('http', `接口返回 ${res.status}${detail ? '：' + detail : ''}`)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new CoachError('empty', '模型没说话。再试一次。')
  return text
}

/* ============================================================
   工具
   ============================================================ */

/** 把对话拼成讲评用的文本，跳过第一句「我想练：xxx」 */
export function buildTranscript(scenario: string, turns: ChatTurn[]): string {
  const body = turns
    .slice(1)
    .map((t) => `${t.role === 'user' ? '我' : '对方'}：${t.content}`)
    .join('\n')
  return `场景：${scenario}\n\n${body}`
}

/** 解析讲评 json，失败返回 null（调用方退回纯文本展示） */
export function parseReview(raw: string): ReviewResult | null {
  let text = raw.trim()
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  if (fence) text = fence[1].trim()

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return null

  let obj: unknown
  try {
    obj = JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
  if (typeof obj !== 'object' || obj === null) return null

  const src = obj as Record<string, unknown>
  const fixesRaw = Array.isArray(src.fixes) ? src.fixes : []
  const fixes: ReviewFix[] = []
  for (const item of fixesRaw) {
    if (typeof item !== 'object' || item === null) continue
    const f = item as Record<string, unknown>
    const original = typeof f.original === 'string' ? f.original.trim() : ''
    const better = typeof f.better === 'string' ? f.better.trim() : ''
    const why = typeof f.why === 'string' ? f.why.trim() : ''
    if (original && better) fixes.push({ original, better, why })
  }

  if (!fixes.length) return null

  return {
    verdict: typeof src.verdict === 'string' ? src.verdict.trim() : '—',
    reason: typeof src.reason === 'string' ? src.reason.trim() : '',
    fixes,
    next: typeof src.next === 'string' ? src.next.trim() : '',
  }
}
