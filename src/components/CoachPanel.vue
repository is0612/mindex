<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import {
  CoachError,
  MODEL_PRESETS,
  PRESETS,
  REVIEW_PROMPT,
  ROLE_PROMPT,
  buildTranscript,
  chatCompletion,
  defaultSettings,
  loadSettings,
  parseReview,
  saveSettings,
  type ChatTurn,
  type CoachSettings,
  type ReviewResult,
} from '@/data/coach'

type Phase = 'idle' | 'chat' | 'review'
type Busy = '' | 'role' | 'review'

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

const logEl = ref<HTMLElement | null>(null)
const draftEl = ref<HTMLTextAreaElement | null>(null)
const reportEl = ref<HTMLElement | null>(null)

const hasKey = computed(() => settings.value.apiKey.trim().length > 0)
const rounds = computed(() => Math.max(0, turns.value.filter((t) => t.role === 'user').length - 1))
const canSend = computed(() => phase.value === 'chat' && busy.value === '' && draft.value.trim().length > 0)
const canReview = computed(() => phase.value === 'chat' && busy.value === '' && turns.value.length >= 3)

onMounted(() => {
  settings.value = loadSettings()
  draftSettings.value = { ...settings.value }
})

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
  turns.value = [{ role: 'user', content: `我想练：${s}` }]
  phase.value = 'chat'
  busy.value = 'role'
  scrollDown()
  void roleTurn()
}

async function roleTurn() {
  try {
    const reply = await chatCompletion(
      settings.value,
      [{ role: 'system', content: ROLE_PROMPT }, ...turns.value],
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
  const text = `${ROLE_PROMPT}\n\n---\n\n我想练：${s}`
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

    <!-- 错误提示 -->
    <p v-if="errorText" class="err" role="alert">{{ errorText }}</p>

    <!-- 未开始 -->
    <div v-if="phase === 'idle'" class="intro">
      <h3 class="intro-title">今天想练什么？</h3>
      <p class="intro-desc">一句话就行。它会直接变成那个人开口，不会先问你一堆问题。</p>

      <div class="start-row">
        <input
          v-model="scenario"
          class="start-input"
          type="text"
          placeholder="比如：跟领导请假"
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

<style scoped>
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

.field-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.settings-note {
  margin-top: 14px;
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--ink-3);
}

.settings-note a {
  color: var(--accent);
  border-bottom: 1px solid rgba(47, 93, 80, 0.3);
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
  border-bottom: 1px solid rgba(47, 93, 80, 0.3);
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
  border: 1px solid rgba(47, 93, 80, 0.16);
  border-bottom-right-radius: 4px;
  background: var(--accent-wash);
  color: var(--ink);
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
  color: #a8752f;
}

.verdict.bad .verdict-tag {
  color: var(--seal);
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
  text-decoration-color: rgba(36, 31, 26, 0.3);
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
  border-left: 3px solid var(--seal);
  background: rgba(180, 83, 58, 0.06);
}

.next-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--seal);
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
  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
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
  font-size: 13px;
  line-height: 1.7;
  color: var(--seal);
  background: rgba(180, 83, 58, 0.06);
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
