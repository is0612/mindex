<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import {
  CoachError,
  MODEL_PRESETS,
  PRESETS,
  REVIEW_PROMPT,
  buildTranscript,
  chatCompletion,
  composeRolePrompt,
  defaultSettings,
  loadSettings,
  parseReview,
  saveSettings,
  type ChatTurn,
  type CoachSettings,
  type ReviewResult,
} from '@/data/coach'
import {
  buildAnalyzePrompt,
  buildSample,
  parseChatLog,
  parsePersonaSeed,
  type ParseResult,
  type PersonaSeed,
  type SampleStats,
} from '@/data/chatlog'
import {
  buildPersonaBlock,
  loadActiveId,
  loadPersonas,
  newPersona,
  saveActiveId,
  savePersonas,
  splitLines,
  type Persona,
} from '@/data/personas'

type Phase = 'idle' | 'chat' | 'review'
type Busy = '' | 'role' | 'review'
type PersonaMode = 'manual' | 'import'

/** 编辑器里全用字符串，一行一条，存的时候再拆 */
interface PersonaDraft {
  id: string
  name: string
  relation: string
  facts: string
  topics: string
  voice: string
  avoid: string
}

const phase = ref<Phase>('idle')
const busy = ref<Busy>('')
const scenario = ref('')
const turns = ref<ChatTurn[]>([])
const draft = ref('')
const review = ref<ReviewResult | null>(null)
const reviewRaw = ref('')
const errorText = ref('')
const copied = ref(false)

const settings = ref<CoachSettings>({ ...defaultSettings })
const draftSettings = ref<CoachSettings>({ ...defaultSettings })
const showSettings = ref(false)

/* 关系档案 */
const personas = ref<Persona[]>([])
const activeId = ref('')
const showPersona = ref(false)
const personaError = ref('')
const personaDraft = reactive<PersonaDraft>(emptyDraft())
const personaEditing = ref(false)
const personaMode = ref<PersonaMode>('manual')
/** 从聊天记录生成后给个提示，免得直接保存了没检查 */
const importedHint = ref(false)

/* 聊天记录导入 */
const importText = ref('')
const importMe = ref('')
const importFrom = ref('')
const parsed = ref<ParseResult | null>(null)
const sampleStats = ref<SampleStats | null>(null)
const analysing = ref(false)
const importError = ref('')
const showPasteJson = ref(false)
const pasteJson = ref('')
const copiedAnalyze = ref(false)

const logEl = ref<HTMLElement | null>(null)
const draftEl = ref<HTMLTextAreaElement | null>(null)
const reportEl = ref<HTMLElement | null>(null)
const personaEl = ref<HTMLElement | null>(null)

const hasKey = computed(() => settings.value.apiKey.trim().length > 0)
const rounds = computed(() => Math.max(0, turns.value.filter((t) => t.role === 'user').length - 1))
const canSend = computed(() => phase.value === 'chat' && busy.value === '' && draft.value.trim().length > 0)
const canReview = computed(() => phase.value === 'chat' && busy.value === '' && turns.value.length >= 3)

const activePersona = computed(() => personas.value.find((p) => p.id === activeId.value) ?? null)
const personaBlock = computed(() => (activePersona.value ? buildPersonaBlock(activePersona.value) : ''))
/** 场景占位文案：选了人就换成带人的提示，比通用那句有用 */
const scenarioPlaceholder = computed(() =>
  activePersona.value ? `比如：跟${activePersona.value.name}说这周末不回家` : '比如：跟领导请假',
)

onMounted(() => {
  settings.value = loadSettings()
  draftSettings.value = { ...settings.value }
  personas.value = loadPersonas()
  const saved = loadActiveId()
  if (saved && personas.value.some((p) => p.id === saved)) activeId.value = saved
})

function emptyDraft(): PersonaDraft {
  return { id: '', name: '', relation: '', facts: '', topics: '', voice: '', avoid: '' }
}

function toDraft(p: Persona): PersonaDraft {
  return {
    id: p.id,
    name: p.name,
    relation: p.relation,
    facts: p.facts.join('\n'),
    topics: p.topics.join('\n'),
    voice: p.voice.join('\n'),
    avoid: p.avoid.join('\n'),
  }
}

function fromDraft(d: PersonaDraft): Persona {
  return {
    id: d.id || newPersona().id,
    name: d.name.trim(),
    relation: d.relation.trim(),
    facts: splitLines(d.facts),
    topics: splitLines(d.topics),
    voice: splitLines(d.voice),
    avoid: splitLines(d.avoid),
    updatedAt: Date.now(),
  }
}

/** 面板在 .coach 顶部展开，用户可能正看着下面，得把它拉进视口（顶部导航是 fixed，留 88px） */
function revealPersonaPanel() {
  nextTick(() => {
    const el = personaEl.value
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 88
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  })
}

function openNewPersona() {
  Object.assign(personaDraft, emptyDraft())
  personaEditing.value = false
  showPersona.value = true
  personaMode.value = 'manual'
  importedHint.value = false
  resetImport()
  personaError.value = ''
  errorText.value = ''
  showSettings.value = false
  revealPersonaPanel()
}

function openEditPersona(p: Persona) {
  Object.assign(personaDraft, toDraft(p))
  personaEditing.value = true
  showPersona.value = true
  personaMode.value = 'manual'
  importedHint.value = false
  resetImport()
  personaError.value = ''
  errorText.value = ''
  showSettings.value = false
  revealPersonaPanel()
}

function closePersona() {
  showPersona.value = false
  personaEditing.value = false
  personaError.value = ''
  errorText.value = ''
}

function commitPersona() {
  const name = personaDraft.name.trim()
  if (!name) {
    personaError.value = '至少给它起个称呼，比如「妈」「王经理」。'
    return
  }
  const next = fromDraft(personaDraft)
  const idx = personas.value.findIndex((p) => p.id === next.id)
  if (idx >= 0) personas.value[idx] = next
  else personas.value.push(next)
  savePersonas(personas.value)
  activeId.value = next.id
  saveActiveId(next.id)
  importedHint.value = false
  closePersona()
}

function removePersona() {
  if (!personaEditing.value) return
  const id = personaDraft.id
  personas.value = personas.value.filter((p) => p.id !== id)
  savePersonas(personas.value)
  if (activeId.value === id) pickPersona('')
  closePersona()
}

/** 选人；空字符串 = 不指定，回到原来一句话场景的行为 */
function pickPersona(id: string) {
  activeId.value = id
  saveActiveId(id)
}

/** 顶栏那个「人物」按钮：开着就关，没选人就新建，选了就改 */
function togglePersonaPanel() {
  if (showPersona.value) {
    closePersona()
    return
  }
  if (activePersona.value) openEditPersona(activePersona.value)
  else openNewPersona()
}

/* ============================================================
   聊天记录 → 档案
   ============================================================ */

function resetImport() {
  importText.value = ''
  importMe.value = ''
  importFrom.value = ''
  parsed.value = null
  sampleStats.value = null
  importError.value = ''
  pasteJson.value = ''
  showPasteJson.value = false
}

function refreshStats() {
  if (!parsed.value || !importMe.value) {
    sampleStats.value = null
    return
  }
  // 「我是谁」和「对方是谁」不能是同一个人
  if (importMe.value === importFrom.value) {
    const other = parsed.value.speakers.find((s) => s.name !== importMe.value)
    importFrom.value = other?.name ?? ''
  }
  sampleStats.value = buildSample(parsed.value.lines, importMe.value).stats
}

watch([importMe, importFrom], () => refreshStats())

function doParse() {
  importError.value = ''
  parsed.value = null
  sampleStats.value = null
  const r = parseChatLog(importText.value)
  if (!r.lines.length) {
    const only = r.speakers[0]
    importError.value =
      r.speakers.length === 1
        ? `只认出一个说话人（${only.name}，${only.count} 条）。要两个人的对话才能提炼，检查一下是不是只复制了一方的话。`
        : '没认出说话人。确认一下贴的是聊天记录原文，或者换一份 txt 再试（微信多选复制、QQ 导出 txt 都行）。'
    return
  }
  parsed.value = r
  const guess = r.speakers.find((s) => /^(我|自己|本人|me|i)$/i.test(s.name)) ?? r.speakers[0]
  importMe.value = guess.name
  importFrom.value = r.speakers.find((s) => s.name !== guess.name)?.name ?? ''
  refreshStats()
}

/** QQ 导出的 txt 常是 GBK，UTF-8 读出来会满屏问号，这里自动换一次编码 */
function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  importError.value = ''
  const reader = new FileReader()
  reader.onerror = () => {
    importError.value = '这个文件读不了，换一个 txt 试试。'
  }
  reader.onload = () => {
    const buf = reader.result as ArrayBuffer
    let text = new TextDecoder('utf-8').decode(buf)
    if ((text.match(/\uFFFD/g)?.length ?? 0) > 3) {
      try {
        text = new TextDecoder('gbk').decode(buf)
      } catch {
        // 浏览器不支持 gbk 就算了，utf-8 的结果留着
      }
    }
    importText.value = text
    doParse()
  }
  reader.readAsArrayBuffer(file)
}

function applySeed(seed: PersonaSeed) {
  Object.assign(personaDraft, {
    name: seed.name || importFrom.value || personaDraft.name,
    relation: seed.relation,
    facts: seed.facts.join('\n'),
    topics: seed.topics.join('\n'),
    voice: seed.voice.join('\n'),
    avoid: seed.avoid.join('\n'),
  })
  personaMode.value = 'manual'
  importedHint.value = true
  importError.value = ''
  personaError.value = ''
}

async function doAnalyze() {
  if (!parsed.value || !importMe.value || !importFrom.value) return
  if (!hasKey.value) {
    importError.value = '还没有 API Key。点右上角「设置」填一个；或者在下面直接粘贴模型返回的 json。'
    return
  }
  importError.value = ''
  analysing.value = true
  try {
    const { text } = buildSample(parsed.value.lines, importMe.value)
    const raw = await chatCompletion(
      settings.value,
      [
        { role: 'system', content: buildAnalyzePrompt(importFrom.value, importMe.value) },
        { role: 'user', content: text },
      ],
      { json: true, temperature: 0.3 },
    )
    const seed = parsePersonaSeed(raw)
    if (!seed) {
      importError.value = '模型返回的不是能用的档案。再生成一次，或者用下面的「粘贴 JSON」。'
      return
    }
    applySeed(seed)
  } catch (err) {
    importError.value = err instanceof CoachError ? err.message : '提炼失败了，再试一次。'
  } finally {
    analysing.value = false
  }
}

/** 手动粘 json 的兜底：没 key、或者模型返回格式飘了，都能走这条路 */
function applyPastedJson() {
  const seed = parsePersonaSeed(pasteJson.value)
  if (!seed) {
    importError.value = '这段内容解析不出档案，确认是模型返回的 json（要有 facts / topics / voice 字段）。'
    return
  }
  applySeed(seed)
}

/** 没 key 的人：把提示词和样本一起复制走，去网页版跑，再把 json 粘回来 */
async function copyAnalyzePrompt() {
  if (!parsed.value || !importMe.value || !importFrom.value) return
  const { text } = buildSample(parsed.value.lines, importMe.value)
  const full = `${buildAnalyzePrompt(importFrom.value, importMe.value)}\n\n---\n\n${text}`
  const ok = await writeClipboard(full)
  if (!ok) {
    importError.value = '这个浏览器不让复制。换成 https 打开，或者手动选中提示词。'
    return
  }
  importError.value = ''
  copiedAnalyze.value = true
  window.setTimeout(() => (copiedAnalyze.value = false), 1800)
}

function scrollDown() {
  nextTick(() => {
    const el = logEl.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

function fail(err: unknown) {
  errorText.value = err instanceof CoachError ? err.message : '出了点问题，再试一次。'
  busy.value = ''
  // 第一句就没演起来，退回未开始，改完设置能直接重来
  if (phase.value === 'chat' && turns.value.length <= 1) {
    turns.value = []
    phase.value = 'idle'
  }
}

function start(text?: string) {
  const s = (text ?? scenario.value).trim()
  if (!s) {
    errorText.value = '先说一句你想练什么，比如「跟领导请假」。'
    return
  }
  scenario.value = s
  if (!hasKey.value) {
    errorText.value = '还没有填 API Key。点右上角「设置」，或者用下面的「复制提示词」拿到 DeepSeek 里练。'
    openSettings()
    return
  }

  errorText.value = ''
  review.value = null
  reviewRaw.value = ''
  const lead = activePersona.value ? `我想练：${s}（对方是${activePersona.value.name}）` : `我想练：${s}`
  turns.value = [{ role: 'user', content: lead }]
  phase.value = 'chat'
  busy.value = 'role'
  scrollDown()
  void roleTurn()
}

async function roleTurn() {
  try {
    const reply = await chatCompletion(
      settings.value,
      [{ role: 'system', content: composeRolePrompt(personaBlock.value) }, ...turns.value],
      { temperature: 1.1, think: false },
    )
    turns.value.push({ role: 'assistant', content: reply })
    busy.value = ''
    scrollDown()
  } catch (err) {
    fail(err)
  }
}

async function send() {
  if (!canSend.value) return
  const text = draft.value.trim()
  draft.value = ''
  shrink()
  turns.value.push({ role: 'user', content: text })
  busy.value = 'role'
  scrollDown()
  await roleTurn()
}

async function finish() {
  if (!canReview.value) return
  errorText.value = ''
  busy.value = 'review'
  try {
    const raw = await chatCompletion(
      settings.value,
      [
        { role: 'system', content: REVIEW_PROMPT },
        { role: 'user', content: buildTranscript(scenario.value, turns.value) },
      ],
      { json: true, think: true },
    )
    const parsed = parseReview(raw)
    if (parsed) {
      review.value = parsed
      reviewRaw.value = ''
    } else {
      review.value = null
      reviewRaw.value = raw
    }
    phase.value = 'review'
    busy.value = ''
    scrollDown()
    nextTick(() => {
      reportEl.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
  } catch (err) {
    fail(err)
  }
}

function reset(keepScenario = true) {
  turns.value = []
  review.value = null
  reviewRaw.value = ''
  draft.value = ''
  errorText.value = ''
  busy.value = ''
  phase.value = 'idle'
  if (!keepScenario) scenario.value = ''
}

/** 同一个场景重新开练，不用再输一遍 */
function restart() {
  reset(true)
  void start()
}

function usePreset(p: string) {
  scenario.value = p
  start(p)
}

function openSettings() {
  draftSettings.value = { ...settings.value }
  showSettings.value = true
  showPersona.value = false
}

function closeSettings() {
  showSettings.value = false
}

function commitSettings() {
  settings.value = {
    baseUrl: draftSettings.value.baseUrl.trim() || defaultSettings.baseUrl,
    apiKey: draftSettings.value.apiKey.trim(),
    model: draftSettings.value.model.trim() || defaultSettings.model,
  }
  saveSettings(settings.value)
  showSettings.value = false
  errorText.value = ''
}

function clearKey() {
  draftSettings.value.apiKey = ''
  settings.value = { ...settings.value, apiKey: '' }
  saveSettings(settings.value)
  errorText.value = ''
}

/** 直接双击打开构建产物时没有 https，navigator.clipboard 用不了，退回 execCommand */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // 继续走下面的兜底
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.top = '-9999px'
    ta.setAttribute('readonly', '')
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

async function copyPrompt() {
  const s = scenario.value.trim() || '跟领导请假'
  const text = `${composeRolePrompt(personaBlock.value)}\n\n---\n\n我想练：${s}`
  const ok = await writeClipboard(text)
  if (ok) {
    copied.value = true
    window.setTimeout(() => (copied.value = false), 1800)
  } else {
    errorText.value = '这个浏览器不让复制，换成 https 打开，或者手动选中提示词。'
  }
}

function grow() {
  const el = draftEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

function shrink() {
  const el = draftEl.value
  if (el) el.style.height = 'auto'
}

function onDraftKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    void send()
  }
}

const verdictTone = computed(() => {
  const v = review.value?.verdict ?? ''
  if (v.includes('不过')) return 'bad'
  if (v.includes('勉强')) return 'warn'
  return 'good'
})
</script>

<template>
  <div class="coach">
    <!-- 状态栏 -->
    <div class="coach-bar">
      <div class="status">
        <span class="dot" :class="{ live: phase === 'chat' && busy !== 'review' }" aria-hidden="true" />
        <span v-if="phase === 'idle'">还没开始</span>
        <span v-else-if="phase === 'chat'">演练中<span v-if="rounds > 0"> · 第 {{ rounds }} 轮</span></span>
        <span v-else>复盘完成</span>
      </div>

      <div class="bar-actions">
        <button v-if="phase !== 'idle'" class="mini" @click="reset(false)">换个场景</button>
        <button v-if="phase !== 'idle'" class="mini" @click="restart">重来</button>
        <button class="mini" :class="{ on: showPersona }" @click="togglePersonaPanel">人物</button>
        <button class="mini" :class="{ on: showSettings }" @click="showSettings ? closeSettings() : openSettings()">
          设置
        </button>
      </div>
    </div>

    <!-- 设置抽屉 -->
    <div v-if="showSettings" class="settings">
      <p class="settings-lead">
        填自己的 API Key，页面会直接连到接口。<strong>Key 只存在这台设备的浏览器里</strong>，不会写进代码，也不会发给别处。
      </p>

      <label class="field">
        <span>API Key</span>
        <input v-model="draftSettings.apiKey" type="password" placeholder="sk-..." autocomplete="off" spellcheck="false" />
      </label>

      <div class="field-row">
        <label class="field">
          <span>Base URL</span>
          <input v-model="draftSettings.baseUrl" type="text" spellcheck="false" />
        </label>
        <label class="field">
          <span>模型</span>
          <input
            v-model="draftSettings.model"
            type="text"
            list="coach-models"
            spellcheck="false"
          />
          <datalist id="coach-models">
            <option v-for="m in MODEL_PRESETS" :key="m.id" :value="m.id">{{ m.note }}</option>
          </datalist>
        </label>
      </div>

      <p class="settings-note">
        <strong>{{ draftSettings.model || 'deepseek-flash' }}</strong> —— 陪练会把思考模式关掉，不然每句话都要先想十几秒；
        复盘才开，让它想清楚再开口。换成别的 OpenAI 兼容接口时，这两个参数会自动不发。
      </p>

      <p class="settings-note">
        没有 Key 也能用：点「复制提示词」，把提示词粘到
        <a href="https://chat.deepseek.com" target="_blank" rel="noopener noreferrer">DeepSeek 网页版</a>
        里，一样能聊、能复盘，只是复盘要另开一个对话。
      </p>

      <div class="settings-actions">
        <button class="btn btn-solid" @click="commitSettings">保存</button>
        <button v-if="hasKey" class="btn btn-ghost" @click="clearKey">清除 Key</button>
      </div>
    </div>

    <!-- 人物档案 -->
    <div v-if="showPersona" ref="personaEl" class="settings">
      <div class="mode-tabs" role="tablist">
        <button role="tab" :class="{ on: personaMode === 'manual' }" @click="personaMode = 'manual'">
          手动填写
        </button>
        <button role="tab" :class="{ on: personaMode === 'import' }" @click="personaMode = 'import'">
          从聊天记录生成
        </button>
      </div>

      <!-- ========== 导入视图 ========== -->
      <template v-if="personaMode === 'import'">
        <p class="settings-lead">
          贴一段和这个人的聊天记录，在本地解析成档案。<strong>文件不离开这台设备</strong>——
          只有抽样、脱敏之后的那几句，会在你点「生成」时发给模型。
        </p>

        <label class="field field-block first">
          <span>第 1 步 · 把记录贴进来</span>
          <textarea
            v-model="importText"
            class="tall"
            rows="5"
            spellcheck="false"
            :placeholder="'微信 PC 端：选中一段消息 → 右键「复制」→ 粘在这里\nQQ：消息管理器 → 右键「导出消息记录」→ 存成 txt → 点下面的选文件\n\n格式不用管，能认出「谁说了什么」就行'"
          ></textarea>
        </label>

        <div class="import-tools">
          <label class="file-pick">
            <input type="file" accept=".txt,.log,text/plain" @change="onImportFile" />
            <span>选 txt 文件</span>
          </label>
          <button class="btn btn-ghost" :disabled="!importText.trim()" @click="resetImport">清空</button>
          <button class="btn btn-solid" :disabled="!importText.trim()" @click="doParse">解析</button>
        </div>

        <p v-if="importError" class="err inline" role="alert">{{ importError }}</p>

        <div v-if="parsed" class="parse-box">
          <p class="parse-line">
            认出 <strong>{{ parsed.lines.length }}</strong> 条 · {{ parsed.mode }}
          </p>

          <div class="field-row">
            <label class="field">
              <span>我是</span>
              <select v-model="importMe">
                <option v-for="s in parsed.speakers" :key="s.name" :value="s.name">
                  {{ s.name }}（{{ s.count }} 条）
                </option>
              </select>
            </label>
            <label class="field">
              <span>要提炼的人是</span>
              <select v-model="importFrom">
                <option v-for="s in parsed.speakers" :key="s.name" :value="s.name">
                  {{ s.name }}（{{ s.count }} 条）
                </option>
              </select>
            </label>
          </div>

          <p v-if="sampleStats" class="persona-hint">
            会取 TA 的 {{ sampleStats.used }} 条（共 {{ sampleStats.total }} 条），约
            {{ sampleStats.chars }} 字<template v-if="sampleStats.redacted">，脱敏 {{ sampleStats.redacted }} 处</template>。
            你自己说的话不会发出去。
          </p>

          <div class="settings-actions">
            <button class="btn btn-solid" :disabled="analysing || !importFrom" @click="doAnalyze">
              {{ analysing ? '正在提炼……' : '生成档案' }}
            </button>
            <button class="btn btn-ghost" @click="copyAnalyzePrompt">
              {{ copiedAnalyze ? '已复制 ✓' : '复制提示词' }}
            </button>
          </div>

          <p class="persona-hint">
            没有 Key 也能用：复制提示词 → 粘到
            <a href="https://chat.deepseek.com" target="_blank" rel="noopener noreferrer">DeepSeek 网页版</a>
            → 把返回的 json 用下面的「直接粘贴」贴回来。
          </p>
        </div>

        <p class="import-alt">
          已经有模型返回的 json？
          <button class="link" @click="showPasteJson = !showPasteJson">
            {{ showPasteJson ? '收起' : '直接粘贴' }}
          </button>
        </p>

        <div v-if="showPasteJson" class="paste-box">
          <textarea
            v-model="pasteJson"
            rows="5"
            spellcheck="false"
            placeholder='{"name":"妈","relation":"58 岁，老家退休","facts":["…"],"topics":["…"],"voice":["…"],"avoid":[]}'
          ></textarea>
          <div class="settings-actions">
            <button class="btn btn-solid" :disabled="!pasteJson.trim()" @click="applyPastedJson">
              用这份 json
            </button>
          </div>
        </div>
      </template>

      <!-- ========== 手动视图 ========== -->
      <template v-else>
        <p class="settings-lead">
          把这个人是谁、你们之间发生过什么写清楚。<strong>陪练只在这个范围里演</strong>——
          档案里没有的人，它不会问起。只存在这台设备的浏览器里，不上传，也不进代码。
        </p>

        <p v-if="importedHint" class="hint-box">
          从聊天记录提炼好了。检查一遍再保存——尤其「绝对不提」那栏，模型看不准哪些是雷区，得你自己补。
        </p>

        <div class="field-row narrow-first">
          <label class="field">
            <span>称呼</span>
            <input v-model="personaDraft.name" type="text" placeholder="妈 / 王经理 / 老陈" />
          </label>
          <label class="field">
            <span>这人是谁</span>
            <input v-model="personaDraft.relation" type="text" placeholder="58 岁，老家退休，每周通一次电话" />
          </label>
        </div>

        <label class="field field-block">
          <span>你们之间发生过什么<em>一行一件</em></span>
          <textarea
            v-model="personaDraft.facts"
            rows="3"
            :placeholder="'上个月为了催婚吵过一次，最后没说完就挂了\n她腰不好，去年做过理疗\n她不知道我换过工作'"
          ></textarea>
        </label>

        <label class="field field-block">
          <span>TA 常问的、在意的<em>一行一件</em></span>
          <textarea
            v-model="personaDraft.topics"
            rows="3"
            :placeholder="'吃饭了没、几点睡\n工资涨了没有\n什么时候带人回来'"
          ></textarea>
        </label>

        <label class="field field-block">
          <span>TA 说话的方式<em>一行一条</em></span>
          <textarea
            v-model="personaDraft.voice"
            rows="3"
            :placeholder="'句子短，爱反问「你说呢」\n说方言，管吃饭叫「食饭」\n不高兴就不接话，隔很久回一个「嗯」'"
          ></textarea>
        </label>

        <label class="field field-block">
          <span>绝对不提的人和事<em>一行一件</em></span>
          <textarea
            v-model="personaDraft.avoid"
            rows="3"
            :placeholder="'二姨家的事\n上次住院的细节\n任何她不认识的人'"
          ></textarea>
        </label>

        <p class="settings-note">
          最后一项最管用：写进去的人和事它一句都不会碰。怕它乱问人，就把「她不认识的人」写进来。
        </p>

        <p v-if="personaError" class="err inline" role="alert">{{ personaError }}</p>

        <div class="settings-actions">
          <button class="btn btn-solid" @click="commitPersona">保存并选用</button>
          <button v-if="personaEditing" class="btn btn-ghost" @click="removePersona">删掉这个档案</button>
          <button class="btn btn-ghost" @click="closePersona">取消</button>
        </div>
      </template>
    </div>

    <!-- 错误提示 -->
    <p v-if="errorText" class="err" role="alert">{{ errorText }}</p>

    <!-- 未开始 -->
    <div v-if="phase === 'idle'" class="intro">
      <h3 class="intro-title">今天想练什么？</h3>
      <p class="intro-desc">一句话就行。它会直接变成那个人开口，不会先问你一堆问题。</p>

      <div class="persona-bar">
        <div class="persona-head">
          <span class="persona-label">这次面对谁</span>
          <button v-if="activePersona" class="link" @click="openEditPersona(activePersona)">改档案</button>
        </div>
        <div class="persona-chips">
          <button class="chip" :class="{ on: !activeId }" @click="pickPersona('')">不指定</button>
          <button
            v-for="p in personas"
            :key="p.id"
            class="chip"
            :class="{ on: p.id === activeId }"
            @click="pickPersona(p.id)"
          >
            {{ p.name }}
          </button>
          <button class="chip chip-add" @click="openNewPersona">+ 新建人物</button>
        </div>
        <p class="persona-hint">
          <template v-if="activePersona">
            档案里有 {{ activePersona.facts.length }} 件共同经历、{{ activePersona.avoid.length }} 条禁区，
            没写进去的人和事它不会提。
          </template>
          <template v-else>
            不指定的话，它只能靠你那一句话猜你是谁，容易自己编出不存在的人和事。
          </template>
        </p>
      </div>

      <div class="start-row">
        <input
          v-model="scenario"
          class="start-input"
          type="text"
          :placeholder="scenarioPlaceholder"
          @keyup.enter="start()"
        />
        <button class="btn btn-solid" @click="start()">开始</button>
      </div>

      <div class="presets">
        <button v-for="p in PRESETS" :key="p" class="chip" @click="usePreset(p)">{{ p }}</button>
      </div>

      <p class="intro-foot">
        没有 API Key？
        <button class="link" @click="copyPrompt">{{ copied ? '已复制 ✓' : '复制提示词' }}</button>
        ，粘到任何 AI 聊天窗口里也能练。
      </p>
    </div>

    <!-- 对话 / 复盘 -->
    <template v-else>
      <div ref="logEl" class="log" :class="{ short: phase === 'review' }" aria-live="polite">
        <div
          v-for="(t, i) in turns.slice(1)"
          :key="i"
          class="row"
          :class="t.role === 'user' ? 'me' : 'them'"
        >
          <div class="bubble">{{ t.content }}</div>
        </div>

        <div v-if="busy === 'role'" class="row them">
          <div class="bubble typing" aria-label="对方正在输入">
            <i></i><i></i><i></i>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div v-if="phase === 'chat'" class="composer">
        <textarea
          ref="draftEl"
          v-model="draft"
          class="draft"
          rows="1"
          placeholder="回它一句……（Enter 发送，Shift + Enter 换行）"
          :disabled="busy !== ''"
          @input="grow"
          @keydown="onDraftKeydown"
        ></textarea>
        <div class="composer-actions">
          <button class="btn btn-ghost" :disabled="!canReview" title="至少聊三轮再复盘" @click="finish">结束并复盘</button>
          <button class="btn btn-solid" :disabled="!canSend" @click="send">发送</button>
        </div>
      </div>

      <p v-else-if="busy === 'review'" class="reviewing">
        正在复盘刚才这几轮……
      </p>

      <!-- 复盘结果 -->
      <div v-else-if="phase === 'review'" ref="reportEl" class="report">
        <template v-if="review">
          <div class="verdict" :class="verdictTone">
            <span class="verdict-tag">{{ review.verdict }}</span>
            <span class="verdict-reason">{{ review.reason }}</span>
          </div>

          <ol class="fixes">
            <li v-for="(f, i) in review.fixes" :key="i" class="fix">
              <p class="fix-line">
                <span class="fix-label">你原话</span>
                <span class="fix-original">{{ f.original }}</span>
              </p>
              <p class="fix-line">
                <span class="fix-label better">改成</span>
                <span class="fix-better">{{ f.better }}</span>
              </p>
              <p v-if="f.why" class="fix-why">{{ f.why }}</p>
            </li>
          </ol>

          <div v-if="review.next" class="next">
            <span class="next-label">下次只做一件事</span>
            <p class="next-text">{{ review.next }}</p>
          </div>
        </template>

        <pre v-else class="raw">{{ reviewRaw }}</pre>

        <div class="report-actions">
          <button class="btn btn-solid" @click="reset(true)">再练一遍</button>
          <button class="btn btn-ghost" @click="reset(false)">换个场景</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/mixins' as *;

.coach {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  text-align: left;
}

/* ---------- 状态栏 ---------- */
.coach-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.5);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  letter-spacing: 0.06em;
  color: var(--ink-3);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--line-2);
}

.dot.live {
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-wash);
}

.bar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mini {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  color: var(--ink-3);
  border: 1px solid transparent;
  transition:
    color 0.2s var(--ease),
    border-color 0.2s var(--ease),
    background 0.2s var(--ease);
}

.mini:hover,
.mini.on {
  color: var(--accent);
  border-color: var(--line-2);
  background: #fff;
}

/* ---------- 设置 ---------- */
.settings {
  padding: 20px 22px 22px;
  border-bottom: 1px solid var(--line);
  background: var(--bg-2);
}

.settings-lead {
  font-size: 13px;
  line-height: 1.8;
  color: var(--ink-2);
  margin-bottom: 16px;
}

.settings-lead strong {
  color: var(--ink);
  font-weight: 600;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--ink-3);
  letter-spacing: 0.04em;
}

.field input {
  font: inherit;
  font-size: 14px;
  color: var(--ink);
  padding: 9px 12px;
  border: 1px solid var(--line-2);
  border-radius: 8px;
  background: #fff;
  outline: none;
  transition: border-color 0.2s var(--ease);
}

.field input:focus {
  border-color: var(--accent-2);
}

.field textarea {
  font: inherit;
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--ink);
  padding: 9px 12px;
  border: 1px solid var(--line-2);
  border-radius: 8px;
  background: #fff;
  outline: none;
  resize: vertical;
  min-height: 76px;
  transition: border-color 0.2s var(--ease);
  /* 内容多就自己长高，别把生成出来的条目裁掉；不支持的浏览器退回 rows */
  field-sizing: content;
  max-height: 280px;
}

.field textarea.tall {
  min-height: 134px;
}

.field textarea:focus {
  border-color: var(--accent-2);
}

.field span em {
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.06em;
  opacity: 0.68;
  margin-left: 6px;
}

.field-block {
  margin-top: 14px;
}

.field-block.first {
  margin-top: 0;
}

.field select {
  font: inherit;
  font-size: 14px;
  color: var(--ink);
  padding: 9px 12px;
  border: 1px solid var(--line-2);
  border-radius: 8px;
  background: #fff;
  outline: none;
  transition: border-color 0.2s var(--ease);
}

.field select:focus {
  border-color: var(--accent-2);
}

/* ---------- 档案面板：模式切换 ---------- */
.mode-tabs {
  display: flex;
  gap: 4px;
  width: fit-content;
  margin-bottom: 16px;
  padding: 3px;
  border-radius: 999px;
  background: rgba(27, 43, 73, 0.05);
}

.mode-tabs button {
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 12.5px;
  color: var(--ink-3);
  transition:
    color 0.2s var(--ease),
    background 0.2s var(--ease);
}

.mode-tabs button.on {
  color: var(--accent);
  background: #fff;
  box-shadow: 0 1px 3px rgba(27, 43, 73, 0.1);
}

/* ---------- 导入 ---------- */
.import-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.import-tools .btn {
  padding: 8px 18px;
  font-size: 13px;
}

.file-pick {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px dashed var(--line-2);
  border-radius: 999px;
  font-size: 13px;
  color: var(--ink-2);
  cursor: pointer;
  transition:
    color 0.2s var(--ease),
    border-color 0.2s var(--ease);
}

.file-pick:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.file-pick input {
  display: none;
}

.parse-box {
  margin-top: 16px;
  padding: 14px 16px 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
}

.parse-line {
  font-size: 13px;
  color: var(--ink-2);
}

.parse-line strong {
  font-family: var(--font-serif);
  font-size: 15px;
  color: var(--accent);
}

.import-alt {
  margin-top: 16px;
  font-size: 12.5px;
  color: var(--ink-3);
}

.paste-box textarea {
  width: 100%;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--ink);
  padding: 10px 12px;
  border: 1px solid var(--line-2);
  border-radius: 8px;
  background: #fff;
  outline: none;
  resize: vertical;
}

.paste-box textarea:focus {
  border-color: var(--accent-2);
}

.hint-box {
  margin-bottom: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  border-left: 3px solid var(--accent);
  background: var(--accent-wash);
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--ink-2);
}

.field-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

/** 档案里「称呼 / 这人是谁」反过来：称呼短，关系那句长 */
.field-row.narrow-first {
  grid-template-columns: 1fr 2fr;
}

/** 解析结果里两个下拉一样宽 */
.parse-box .field-row {
  grid-template-columns: 1fr 1fr;
}

.settings-note {
  margin-top: 14px;
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--ink-3);
}

.settings-note a {
  color: var(--accent);
  border-bottom: 1px solid rgba(63, 102, 160, 0.35);
}

.settings-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

/* ---------- 未开始 ---------- */
.intro {
  padding: 30px 26px 28px;
}

.intro-title {
  font-size: 21px;
  color: var(--ink);
}

.intro-desc {
  margin-top: 8px;
  font-size: 14px;
  color: var(--ink-2);
}

/* ---------- 人物选择 ---------- */
.persona-bar {
  margin-top: 18px;
  padding: 14px 16px 12px;
  border: 1px dashed var(--line-2);
  border-radius: 10px;
  background: var(--bg-2);
}

.persona-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.persona-head .link {
  font-size: 12px;
}

.persona-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--ink-3);
}

.persona-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.persona-hint {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.75;
  color: var(--ink-3);
}

.persona-hint a {
  color: var(--accent);
  border-bottom: 1px solid rgba(63, 102, 160, 0.35);
}

.chip.on {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-wash);
}

.chip-add {
  border-style: dashed;
  color: var(--ink-3);
}

.chip-add:hover {
  border-style: solid;
}

.start-row {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.start-input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-size: 15px;
  color: var(--ink);
  padding: 11px 16px;
  border: 1px solid var(--line-2);
  border-radius: 999px;
  background: #fff;
  outline: none;
  transition: border-color 0.2s var(--ease);
}

.start-input:focus {
  border-color: var(--accent-2);
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.chip {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--line-2);
  font-size: 12.5px;
  color: var(--ink-2);
  background: rgba(255, 255, 255, 0.6);
  transition:
    color 0.2s var(--ease),
    border-color 0.2s var(--ease),
    background 0.2s var(--ease);
}

.chip:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: #fff;
}

.intro-foot {
  margin-top: 20px;
  font-size: 12.5px;
  color: var(--ink-3);
}

.link {
  color: var(--accent);
  border-bottom: 1px solid rgba(63, 102, 160, 0.35);
  padding: 0;
  font-size: inherit;
}

/* ---------- 对话 ---------- */
.log {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: clamp(320px, 46vh, 440px);
  overflow-y: auto;
  padding: 22px 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 120px);
  scroll-behavior: smooth;
}

.log.short {
  height: 210px;
  background: rgba(255, 255, 255, 0.35);
}

.row {
  display: flex;
}

.row.them {
  justify-content: flex-start;
}

.row.me {
  justify-content: flex-end;
}

.bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 13px;
  font-size: 14.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.them .bubble {
  border: 1px solid var(--line);
  border-bottom-left-radius: 4px;
  background: #fff;
  color: var(--ink);
}

.me .bubble {
  border: 1px solid transparent;
  border-bottom-right-radius: 4px;
  background: linear-gradient(135deg, #4f77b1, #3f66a0);
  box-shadow: 0 8px 18px -14px rgba(56, 91, 147, 0.9);
  color: #f7faff;
}

.typing {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 13px 16px;
}

.typing i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ink-3);
  animation: blink 1.4s var(--ease) infinite;
}

.typing i:nth-child(2) {
  animation-delay: 0.2s;
}

.typing i:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  60%,
  100% {
    opacity: 0.25;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

/* ---------- 输入区 ---------- */
.composer {
  border-top: 1px solid var(--line);
  padding: 12px 16px 14px;
  background: rgba(255, 255, 255, 0.55);
}

.draft {
  width: 100%;
  font: inherit;
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--ink);
  padding: 10px 14px;
  border: 1px solid var(--line-2);
  border-radius: 10px;
  background: #fff;
  outline: none;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  transition: border-color 0.2s var(--ease);
}

.draft:focus {
  border-color: var(--accent-2);
}

.draft:disabled {
  background: var(--bg-2);
  color: var(--ink-3);
}

.composer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.composer-actions .btn {
  padding: 8px 18px;
  font-size: 13.5px;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.reviewing {
  padding: 26px 24px;
  border-top: 1px solid var(--line);
  font-size: 13.5px;
  color: var(--ink-3);
  text-align: center;
}

/* ---------- 复盘 ---------- */
.report {
  padding: 22px 24px 24px;
  border-top: 1px solid var(--line);
  background: var(--bg-2);
}

.verdict {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.verdict-tag {
  font-family: var(--font-serif);
  font-size: 17px;
  padding: 2px 12px;
  border-radius: 6px;
  border: 1px solid currentColor;
}

.verdict.good .verdict-tag {
  color: var(--accent);
}

.verdict.warn .verdict-tag {
  color: var(--warn);
}

.verdict.bad .verdict-tag {
  color: var(--danger);
}

.verdict-reason {
  font-size: 14px;
  color: var(--ink-2);
}

.fixes {
  list-style: none;
  margin: 20px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  counter-reset: fix;
}

.fix {
  position: relative;
  padding: 14px 16px 14px 42px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: #fff;
}

.fix::before {
  counter-increment: fix;
  content: counter(fix);
  position: absolute;
  left: 14px;
  top: 15px;
  font-family: var(--font-serif);
  font-size: 13px;
  color: var(--ink-3);
}

.fix-line {
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 14px;
  line-height: 1.75;
}

.fix-line + .fix-line {
  margin-top: 6px;
}

.fix-label {
  flex-shrink: 0;
  min-width: 38px;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--ink-3);
  padding-top: 1px;
}

.fix-label.better {
  color: var(--accent);
}

.fix-original {
  color: var(--ink-2);
  text-decoration: line-through;
  text-decoration-color: rgba(27, 43, 73, 0.32);
}

.fix-better {
  color: var(--ink);
  font-weight: 500;
}

.fix-why {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--line);
  font-size: 13px;
  line-height: 1.8;
  color: var(--ink-2);
}

.next {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 10px;
  border-left: 3px solid var(--accent);
  background: var(--accent-wash);
}

.next-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--accent);
}

.next-text {
  margin-top: 6px;
  font-size: 14.5px;
  color: var(--ink);
}

.raw {
  margin: 0;
  padding: 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--ink-2);
  white-space: pre-wrap;
  word-break: break-word;
}

.report-actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.report-actions .btn {
  padding: 9px 20px;
  font-size: 13.5px;
}

.err {
  margin: 0;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(180, 69, 58, 0.14);
  background: var(--danger-wash);
  color: var(--danger);
  font-size: 13px;
  line-height: 1.7;
}

/* 面板内联提示，不要整条 banner */
.err.inline {
  margin-top: 14px;
  padding: 9px 14px;
  border: 1px solid rgba(180, 69, 58, 0.18);
  border-radius: 8px;
}

@media (max-width: 720px) {
  .intro {
    padding: 24px 18px 22px;
  }

  .start-row {
    flex-direction: column;
  }

  .start-row .btn {
    width: 100%;
  }

  .log {
    height: clamp(280px, 42vh, 380px);
    padding: 18px 14px;
  }

  .bubble {
    max-width: 86%;
  }

  .field-row {
    grid-template-columns: 1fr;
  }

  .composer-actions .btn {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .typing i {
    animation: none;
    opacity: 0.5;
  }

  .log {
    scroll-behavior: auto;
  }
}
</style>
