<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { bundledPoems, formatDate, trimLines, type Poem } from '@/data/poems'
import { profile } from '@/data/profile'
import {
  clearError,
  createPoem,
  deletePoems,
  discardSnapshot,
  error,
  genres,
  loadPoems,
  mode,
  parsePoemsJson,
  poems,
  replacePoems,
  restoreBundled,
  saving,
  stats,
  undoLast,
  updatePoem,
  years,
} from '@/stores/poetry'

/* ---------- 筛选与分页 ---------- */
const query = ref('')
const year = ref('全部')
const genre = ref('全部')
const order = ref<'desc' | 'asc'>('desc')
const pageSize = ref(20)
const page = ref(1)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const y = year.value
  const g = genre.value
  // 单次遍历完成年份、体裁、关键词过滤，避免多次 filter 产生中间数组
  const list = poems.value.filter((p) => {
    if (y !== '全部' && !p.date.startsWith(y)) return false
    if (g !== '全部' && p.genre !== g) return false
    if (!q) return true
    return (
      p.title.toLowerCase().includes(q) ||
      p.body.join('').toLowerCase().includes(q) ||
      p.genre.toLowerCase().includes(q)
    )
  })
  // filter 已返回新数组，原地 reverse 即可，省掉一次拷贝
  return order.value === 'desc' ? list : list.reverse()
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const pageList = computed<(number | string)[]>(() => {
  const total = pageCount.value
  const cur = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | string)[] = [1]
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  if (start > 2) out.push('…')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push('…')
  out.push(total)
  return out
})

watch([query, year, genre, order, pageSize], () => {
  page.value = 1
})
watch(pageCount, (n) => {
  if (page.value > n) page.value = n
})

/* ---------- 展开预览 ---------- */
const expanded = ref<string | null>(null)
function toggle(id: string) {
  expanded.value = expanded.value === id ? null : id
}

/* ---------- 多选 ---------- */
// 用 Set 存选中 id，has 为 O(1)；此前用数组 includes 在列表较大时是 O(n²)
const selected = ref<Set<string>>(new Set())
const allPagedSelected = computed(
  () => paged.value.length > 0 && paged.value.every((p) => selected.value.has(p.id)),
)

function togglePick(id: string) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

function togglePickPage() {
  const next = new Set(selected.value)
  if (allPagedSelected.value) {
    for (const p of paged.value) next.delete(p.id)
  } else {
    for (const p of paged.value) next.add(p.id)
  }
  selected.value = next
}

const selectedPoems = computed(() => poems.value.filter((p) => selected.value.has(p.id)))

/* ---------- 提示条 ---------- */
interface Toast {
  id: number
  text: string
  undo?: boolean
}

const toasts = ref<Toast[]>([])
let toastId = 0
const timers = new Map<number, number>()

function toast(text: string, undo = false) {
  const id = ++toastId
  toasts.value = [...toasts.value, { id, text, undo }]
  timers.set(
    id,
    window.setTimeout(() => dismissToast(id), undo ? 7000 : 3200),
  )
}

function dismissToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

async function handleUndo(id: number) {
  const ok = await undoLast()
  dismissToast(id)
  if (ok) toast('已撤销')
}

/* ---------- 确认弹层 ---------- */
interface ConfirmState {
  title: string
  text: string
  ok: string
  danger?: boolean
  run: () => Promise<void> | void
}

const confirming = ref<ConfirmState | null>(null)
const busy = ref(false)

async function runConfirm() {
  const state = confirming.value
  if (!state) return
  busy.value = true
  try {
    await state.run()
  } catch (e) {
    toast((e as Error).message)
  } finally {
    busy.value = false
    confirming.value = null
  }
}

function askDelete(list: Poem[]) {
  if (!list.length) return
  confirming.value = {
    title: list.length === 1 ? `删除《${list[0].title}》？` : `删除这 ${list.length} 首？`,
    text: '删除后 7 秒内还能点提示条上的「撤销」找回；确认前建议先导出一份 JSON 备份。',
    ok: '删除',
    danger: true,
    run: async () => {
      const ids = list.map((p) => p.id)
      const n = await deletePoems(ids)
      const gone = new Set(ids)
      selected.value = new Set([...selected.value].filter((id) => !gone.has(id)))
      if (expanded.value && gone.has(expanded.value)) expanded.value = null
      toast(`已删除 ${n} 首`, true)
    },
  }
}

/* ---------- 新增 / 编辑 ---------- */
interface Draft {
  title: string
  genre: string
  date: string
  volumeNo: number
  body: string
}

const draft = ref<Draft | null>(null)
const editingId = ref<string | null>(null)
const formError = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

function today(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function openCreate() {
  editingId.value = null
  formError.value = ''
  draft.value = {
    title: '',
    genre: genres.value[0] ?? '',
    date: today(),
    volumeNo: Math.max(1, ...poems.value.map((p) => p.volumeNo)),
    body: '',
  }
  requestAnimationFrame(() => titleInput.value?.focus())
}

function openEdit(poem: Poem) {
  editingId.value = poem.id
  formError.value = ''
  draft.value = {
    title: poem.title,
    genre: poem.genre,
    date: poem.date,
    volumeNo: poem.volumeNo,
    body: poem.body.join('\n'),
  }
}

function closeDraft() {
  draft.value = null
  editingId.value = null
  formError.value = ''
}

// 一行一句，中间空行留着（词牌分上下阕），只去掉首尾多打的空行
const draftLines = computed(() => trimLines((draft.value?.body ?? '').split('\n')))

const draftLongest = computed(() =>
  draftLines.value.filter(Boolean).reduce((max, line) => Math.max(max, line.length), 0),
)

async function submitDraft() {
  const d = draft.value
  if (!d) return
  const lines = draftLines.value
  if (!d.title.trim()) {
    formError.value = '标题不能留空'
    return
  }
  if (!lines.some(Boolean)) {
    formError.value = '正文至少写一句'
    return
  }

  busy.value = true
  try {
    const payload = {
      title: d.title,
      genre: d.genre,
      date: d.date,
      volumeNo: d.volumeNo,
      body: lines,
    }
    if (editingId.value) {
      await updatePoem(editingId.value, payload)
      toast('已保存修改')
    } else {
      await createPoem(payload)
      toast('已新增一首')
    }
    closeDraft()
  } catch (e) {
    formError.value = (e as Error).message
  } finally {
    busy.value = false
  }
}

/* ---------- 导入 / 导出 / 恢复 ---------- */
function exportJson() {
  const blob = new Blob([JSON.stringify(poems.value)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'poems.json'
  link.click()
  URL.revokeObjectURL(url)
  toast('已导出 poems.json')
}

const fileInput = ref<HTMLInputElement | null>(null)

async function onImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  let list: Poem[]
  try {
    list = parsePoemsJson(await file.text())
  } catch (e) {
    toast(`导入失败：${(e as Error).message}`)
    return
  }

  confirming.value = {
    title: `用这 ${list.length} 首替换现有 ${poems.value.length} 首？`,
    text: '导入是整表覆盖，当前列表会被替换掉（含你手动改过的内容）。',
    ok: '替换',
    danger: true,
    run: async () => {
      await replacePoems(list)
      selected.value = new Set()
      expanded.value = null
      toast(`已导入 ${list.length} 首`, true)
    },
  }
}

function askRestore() {
  confirming.value = {
    title: '恢复初始数据？',
    text: `丢弃全部改动，回到构建时打包进来的 ${bundledPoems.length} 首。`,
    ok: '恢复',
    danger: true,
    run: async () => {
      await restoreBundled()
      selected.value = new Set()
      expanded.value = null
      toast('已恢复初始数据')
    },
  }
}

/* ---------- 存储状态 ---------- */
const modeInfo = computed(() => {
  switch (mode.value) {
    case 'file':
      return {
        label: '直写 poems.json',
        tone: 'ok',
        hint: '改动已写进 src/data/poems.json，重新 build 后线上生效。',
      }
    case 'browser':
      return {
        label: '浏览器本地',
        tone: 'warn',
        hint: '当前不在开发服务器里，改动只存在这台浏览器。导出 JSON 覆盖 src/data/poems.json 才能永久保存。',
      }
    default:
      return { label: '初始数据', tone: 'idle', hint: '还没有改动，第一次编辑会开始记录。' }
  }
})

/* ---------- 键盘 ---------- */
function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (confirming.value) confirming.value = null
  else if (draft.value) closeDraft()
}

onMounted(async () => {
  window.addEventListener('keydown', onKey)
  window.scrollTo({ top: 0 })
  discardSnapshot()
  await loadPoems()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  timers.forEach((timer) => clearTimeout(timer))
})
</script>

<template>
  <div class="admin">
    <header class="topbar">
      <div class="topbar-inner">
        <a class="back" href="#poetry">← 返回首页</a>

        <div class="title">
          <span class="seal">{{ profile.initial }}</span>
          <div class="title-text">
            <span class="eyebrow">POETRY ARCHIVE</span>
            <h1>诗词管理</h1>
          </div>
        </div>

        <div class="tools">
          <button class="btn btn-ghost sm" type="button" @click="exportJson">导出 JSON</button>
          <button class="btn btn-ghost sm" type="button" @click="fileInput?.click()">导入</button>
          <button class="btn btn-solid sm" type="button" @click="openCreate">＋ 新增</button>
          <input
            ref="fileInput"
            class="hidden-file"
            type="file"
            accept=".json,application/json"
            @change="onImport"
          />
        </div>
      </div>
    </header>

    <main class="body">
      <section class="summary">
        <div class="figures">
          <div class="figure">
            <b>{{ stats.total }}</b><span>首</span>
          </div>
          <div class="figure">
            <b>{{ stats.years }}</b><span>个年份</span>
          </div>
          <div class="figure">
            <b>{{ stats.genres }}</b><span>种体裁</span>
          </div>
          <div class="figure">
            <b>{{ stats.lines }}</b><span>句</span>
          </div>
        </div>

        <div class="store" :class="`is-${modeInfo.tone}`">
          <span class="dot" />
          <div>
            <b>{{ modeInfo.label }}</b>
            <p>{{ modeInfo.hint }}</p>
          </div>
          <button class="link" type="button" @click="askRestore">恢复初始</button>
        </div>

        <p v-if="error" class="alert" role="alert">
          {{ error }}
          <button type="button" class="link" @click="clearError">知道了</button>
        </p>
      </section>

      <section class="filters">
        <div class="search">
          <input
            v-model="query"
            type="search"
            placeholder="搜标题、正文、体裁…"
            aria-label="搜索诗词"
          />
          <button v-if="query" class="clear" type="button" aria-label="清空搜索" @click="query = ''">
            ×
          </button>
        </div>

        <select v-model="year" aria-label="按年份筛选">
          <option value="全部">全部年份</option>
          <option v-for="y in years" :key="y" :value="y">{{ y }} 年</option>
        </select>

        <select v-model="genre" aria-label="按体裁筛选">
          <option value="全部">全部体裁</option>
          <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
        </select>

        <select v-model="order" aria-label="排序方式">
          <option value="desc">日期 新 → 旧</option>
          <option value="asc">日期 旧 → 新</option>
        </select>

        <select v-model.number="pageSize" aria-label="每页数量">
          <option :value="20">每页 20</option>
          <option :value="50">每页 50</option>
          <option :value="100">每页 100</option>
        </select>
      </section>

      <section class="bulk">
        <label class="pick">
          <input type="checkbox" :checked="allPagedSelected" @change="togglePickPage" />
          <span>全选本页</span>
        </label>

        <span class="result">{{ filtered.length }} 首匹配</span>

        <transition name="fade">
          <div v-if="selected.size" class="bulk-actions">
            <span>已选 {{ selected.size }} 首</span>
            <button class="danger sm" type="button" @click="askDelete(selectedPoems)">删除所选</button>
            <button class="link" type="button" @click="selected = new Set()">取消选择</button>
          </div>
        </transition>
      </section>

      <section class="list">
        <article
          v-for="poem in paged"
          :key="poem.id"
          class="row"
          :class="{ 'is-open': expanded === poem.id, 'is-picked': selected.has(poem.id) }"
        >
          <label class="pick-box">
            <input
              type="checkbox"
              :checked="selected.has(poem.id)"
              :aria-label="`选择《${poem.title}》`"
              @change="togglePick(poem.id)"
            />
          </label>

          <button class="row-main" type="button" @click="toggle(poem.id)">
            <span class="row-title">{{ poem.title }}</span>
            <span class="row-meta">
              <span v-if="poem.genre" class="tag">{{ poem.genre }}</span>
              <span class="num">{{ formatDate(poem.date) }}</span>
              <span class="num">卷 {{ poem.volumeNo }}</span>
              <span class="num">{{ poem.body.filter(Boolean).length }} 行</span>
            </span>
          </button>

          <div class="row-actions">
            <button class="ghost sm" type="button" @click="openEdit(poem)">编辑</button>
            <button class="ghost sm danger-text" type="button" @click="askDelete([poem])">删除</button>
          </div>

          <div v-if="expanded === poem.id" class="row-preview">
            <p v-for="(line, i) in poem.body" :key="i" :class="{ blank: !line }">{{ line }}</p>
          </div>
        </article>

        <p v-if="!paged.length" class="empty">
          {{ poems.length ? '没有符合条件的诗词，换个关键词或清空筛选。' : '一首都没有了，点右上角「新增」写第一首。' }}
        </p>
      </section>

      <nav v-if="pageCount > 1" class="pager" aria-label="分页">
        <button type="button" :disabled="page === 1" @click="page = 1">«</button>
        <button type="button" :disabled="page === 1" @click="page--">‹</button>
        <template v-for="(item, i) in pageList" :key="i">
          <span v-if="typeof item === 'string'" class="gap">{{ item }}</span>
          <button
            v-else
            type="button"
            :class="{ active: item === page }"
            @click="page = item"
          >
            {{ item }}
          </button>
        </template>
        <button type="button" :disabled="page === pageCount" @click="page++">›</button>
        <button type="button" :disabled="page === pageCount" @click="page = pageCount">»</button>
        <span class="pager-info">第 {{ page }} / {{ pageCount }} 页</span>
      </nav>
    </main>

    <Teleport to="body">
      <div v-if="draft" class="mask" role="dialog" aria-modal="true" @click.self="closeDraft">
        <form class="sheet" @submit.prevent="submitDraft">
          <h2>{{ editingId ? '编辑诗词' : '新增诗词' }}</h2>

          <div class="field">
            <label for="f-title">标题</label>
            <input id="f-title" ref="titleInput" v-model="draft.title" type="text" placeholder="如：卜算子·故北停新雪" />
          </div>

          <div class="row-2">
            <div class="field">
              <label for="f-genre">体裁</label>
              <input id="f-genre" v-model="draft.genre" list="genre-options" type="text" placeholder="词 / 七言 / 古体…" />
              <datalist id="genre-options">
                <option v-for="g in genres" :key="g" :value="g" />
              </datalist>
            </div>
            <div class="field">
              <label for="f-date">日期</label>
              <input id="f-date" v-model="draft.date" type="date" />
            </div>
            <div class="field narrow">
              <label for="f-vol">卷</label>
              <input id="f-vol" v-model.number="draft.volumeNo" type="number" min="1" max="99" />
            </div>
          </div>

          <div class="field">
            <label for="f-body">正文</label>
            <textarea
              id="f-body"
              v-model="draft.body"
              rows="10"
              placeholder="一行一句，句末标点照写；空行会原样留白（词的上下阕之间空一行）"
            />
            <span class="hint">
              {{ draftLines.filter(Boolean).length }} 行<template v-if="draftLongest"> · 最长 {{ draftLongest }} 字</template>
            </span>
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>

          <footer class="sheet-foot">
            <button class="btn btn-ghost" type="button" @click="closeDraft">取消</button>
            <button class="btn btn-solid" type="submit" :disabled="busy || saving">
              {{ busy || saving ? '保存中…' : '保存' }}
            </button>
          </footer>
        </form>
      </div>

      <div v-if="confirming" class="mask narrow-mask" role="dialog" aria-modal="true" @click.self="confirming = null">
        <div class="sheet confirm">
          <h2>{{ confirming.title }}</h2>
          <p class="confirm-text">{{ confirming.text }}</p>
          <footer class="sheet-foot">
            <button class="btn btn-ghost" type="button" @click="confirming = null">取消</button>
            <button
              class="btn"
              :class="confirming.danger ? 'btn-danger' : 'btn-solid'"
              type="button"
              :disabled="busy"
              @click="runConfirm"
            >
              {{ busy ? '处理中…' : confirming.ok }}
            </button>
          </footer>
        </div>
      </div>
    </Teleport>

    <div class="toasts">
      <transition-group name="toast">
        <div v-for="t in toasts" :key="t.id" class="toast">
          <span>{{ t.text }}</span>
          <button v-if="t.undo" type="button" @click="handleUndo(t.id)">撤销</button>
          <button class="close" type="button" aria-label="关闭" @click="dismissToast(t.id)">×</button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/mixins' as *;

.admin {
  min-height: 100vh;
  padding-bottom: 80px;
}

/* ---------- 顶栏 ---------- */
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(247, 250, 255, 0.86);
  backdrop-filter: blur(18px) saturate(1.25);
  border-bottom: 1px solid var(--line);
}

.topbar-inner {
  width: min(100% - 40px, 1080px);
  margin-inline: auto;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.back {
  font-size: 13px;
  color: var(--ink-3);
  transition: color 0.2s var(--ease);
}

.back:hover {
  color: var(--accent);
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.seal {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: linear-gradient(145deg, #86a9e2, #4b70ae);
  color: #f8fbff;
  font-family: var(--font-serif);
  font-size: 14px;
  box-shadow: 0 5px 14px -9px rgba(55, 91, 151, 0.8);
}

.title-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.title-text .eyebrow {
  font-size: 9.5px;
  letter-spacing: 0.2em;
}

.title-text .eyebrow::before {
  display: none;
}

.title-text h1 {
  font-size: 17px;
  letter-spacing: 0.06em;
}

.tools {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hidden-file {
  display: none;
}

/* ---------- 通用按钮 ---------- */
.btn.sm {
  padding: 7px 15px;
  font-size: 13px;
}

.ghost {
  padding: 5px 12px;
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

.ghost:hover {
  color: var(--accent);
  border-color: rgba(88, 132, 196, 0.45);
  background: #fff;
}

.ghost.danger-text:hover,
.danger.sm {
  color: var(--danger);
  border-color: rgba(180, 69, 58, 0.32);
}

.danger.sm {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(180, 69, 58, 0.32);
  font-size: 12.5px;
  background: rgba(255, 255, 255, 0.7);
  transition: background 0.2s var(--ease);
}

.danger.sm:hover {
  background: rgba(180, 69, 58, 0.08);
}

.btn-danger {
  background: var(--danger);
  color: #fff8f6;
}

.btn-danger:hover {
  background: var(--danger-2);
}

.link {
  font-size: 12.5px;
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  opacity: 0.85;
}

.link:hover {
  opacity: 1;
}

/* ---------- 主体 ---------- */
.body {
  width: min(100% - 40px, 1080px);
  margin: 28px auto 0;
}

.summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  padding: 18px 22px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.5));
  box-shadow: var(--shadow-sm);
}

.figures {
  display: flex;
  gap: 26px;
}

.figure {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.figure b {
  font-family: var(--font-serif);
  font-size: 22px;
  color: var(--ink);
}

.figure span {
  font-size: 12px;
  color: var(--ink-3);
}

.store {
  margin-left: auto;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 460px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--line);
}

.store .dot {
  width: 7px;
  height: 7px;
  margin-top: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--ink-3);
}

.store.is-ok .dot {
  background: var(--good);
}

.store.is-warn .dot {
  background: var(--warn);
}

.store b {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.store p {
  font-size: 11.5px;
  line-height: 1.65;
  color: var(--ink-3);
  margin-top: 2px;
}

.store .link {
  align-self: center;
  flex-shrink: 0;
  white-space: nowrap;
}

.alert {
  flex-basis: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12.5px;
  color: var(--danger);
}

/* ---------- 筛选 ---------- */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.search {
  position: relative;
  flex: 1 1 240px;
}

.search input {
  width: 100%;
  padding: 9px 34px 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--line-2);
  background: rgba(255, 255, 255, 0.78);
  font: inherit;
  font-size: 13.5px;
  color: var(--ink);
  outline: none;
  transition:
    border-color 0.2s var(--ease),
    box-shadow 0.2s var(--ease);
}

.search input:focus {
  border-color: rgba(88, 132, 196, 0.6);
  box-shadow: 0 0 0 3px rgba(88, 132, 196, 0.12);
}

.search input::-webkit-search-cancel-button {
  display: none;
}

.search .clear {
  position: absolute;
  top: 50%;
  right: 10px;
  translate: 0 -50%;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 15px;
  line-height: 1;
  color: var(--ink-3);
}

.search .clear:hover {
  background: rgba(27, 43, 73, 0.06);
  color: var(--ink);
}

.filters select {
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid var(--line-2);
  background: rgba(255, 255, 255, 0.78);
  font: inherit;
  font-size: 13px;
  color: var(--ink-2);
  outline: none;
  cursor: pointer;
}

.filters select:focus {
  border-color: rgba(88, 132, 196, 0.6);
}

/* ---------- 批量栏 ---------- */
.bulk {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 20px 0 10px;
  min-height: 30px;
}

.pick {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--ink-3);
  cursor: pointer;
}

.result {
  font-size: 12.5px;
  color: var(--ink-3);
}

.bulk-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12.5px;
  color: var(--ink-2);
}

input[type='checkbox'] {
  width: 15px;
  height: 15px;
  accent-color: var(--accent);
  cursor: pointer;
}

/* ---------- 列表 ---------- */
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.62);
  transition:
    border-color 0.22s var(--ease),
    background 0.22s var(--ease),
    box-shadow 0.22s var(--ease);
}

.row:hover {
  border-color: var(--line-2);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-sm);
}

.row.is-picked {
  border-color: rgba(88, 132, 196, 0.4);
  background: rgba(238, 245, 255, 0.9);
}

.row.is-open {
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.pick-box {
  display: grid;
  place-items: center;
}

.row-main {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
  min-width: 0;
}

.row-title {
  font-family: var(--font-serif);
  font-size: 15.5px;
  letter-spacing: 0.03em;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row:hover .row-title {
  color: var(--accent);
}

.row-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 11.5px;
  color: var(--ink-3);
}

.tag {
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--accent-wash);
  color: var(--accent);
  font-size: 11px;
}

.num {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.03em;
}

.row-actions {
  display: flex;
  gap: 6px;
  opacity: 0.75;
  transition: opacity 0.2s var(--ease);
}

.row:hover .row-actions,
.row.is-open .row-actions {
  opacity: 1;
}

.row-preview {
  grid-column: 2 / -1;
  margin-top: 4px;
  padding: 16px 18px;
  border-radius: 10px;
  background: rgba(242, 247, 255, 0.6);
  border: 1px solid var(--line);
  max-height: 320px;
  overflow-y: auto;
}

.row-preview p {
  font-family: var(--font-serif);
  font-size: 14.5px;
  line-height: 2;
  letter-spacing: 0.04em;
  color: var(--ink-2);
  white-space: pre-wrap;
  word-break: break-word;
}

.row-preview p:first-child {
  color: var(--ink);
}

/* 空行撑满一行，才是真的空一行 */
.row-preview p.blank::before {
  content: '\00a0';
}

.empty {
  padding: 56px 0;
  text-align: center;
  font-size: 13.5px;
  color: var(--ink-3);
}

/* ---------- 分页 ---------- */
.pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 22px;
}

.pager button {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.7);
  font-size: 12.5px;
  color: var(--ink-2);
  font-variant-numeric: tabular-nums;
  transition:
    border-color 0.18s var(--ease),
    background 0.18s var(--ease),
    color 0.18s var(--ease);
}

.pager button:not(:disabled):hover {
  border-color: rgba(88, 132, 196, 0.45);
  color: var(--accent);
  background: #fff;
}

.pager button.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #f7faff;
}

.pager button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pager .gap {
  padding: 0 2px;
  color: var(--ink-3);
  font-size: 12px;
}

.pager-info {
  margin-left: 10px;
  font-size: 12px;
  color: var(--ink-3);
  letter-spacing: 0.04em;
}

/* ---------- 弹层 ---------- */
.mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 27, 48, 0.48);
  backdrop-filter: blur(6px);
  animation: fade 0.2s var(--ease);
}

.sheet {
  width: min(100%, 620px);
  max-height: min(88vh, 760px);
  overflow-y: auto;
  padding: 26px 28px 22px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow-md);
  animation: rise 0.24s var(--ease);
}

.sheet h2 {
  font-size: 19px;
  letter-spacing: 0.05em;
  margin-bottom: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--ink-3);
}

.field input,
.field textarea {
  width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid var(--line-2);
  background: #fff;
  font: inherit;
  font-size: 14px;
  color: var(--ink);
  outline: none;
  transition:
    border-color 0.2s var(--ease),
    box-shadow 0.2s var(--ease);
}

.field textarea {
  font-family: var(--font-serif);
  font-size: 15px;
  line-height: 1.95;
  letter-spacing: 0.03em;
  resize: vertical;
  min-height: 180px;
}

.field input:focus,
.field textarea:focus {
  border-color: rgba(88, 132, 196, 0.65);
  box-shadow: 0 0 0 3px rgba(88, 132, 196, 0.12);
}

.row-2 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 170px 80px;
  gap: 12px;
}

.hint {
  font-size: 11.5px;
  color: var(--ink-3);
  letter-spacing: 0.04em;
}

.form-error {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--danger-wash);
  color: var(--danger);
  font-size: 12.5px;
}

.sheet-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.sheet-foot .btn.sm,
.sheet-foot .btn {
  padding: 9px 22px;
  font-size: 13.5px;
}

.sheet-foot .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm {
  width: min(100%, 420px);
}

.confirm h2 {
  margin-bottom: 10px;
}

.confirm-text {
  font-size: 13.5px;
  line-height: 1.85;
  color: var(--ink-2);
}

.confirm .sheet-foot {
  margin-top: 20px;
}

/* ---------- 提示条 ---------- */
.toasts {
  position: fixed;
  left: 50%;
  bottom: 26px;
  translate: -50% 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(100% - 32px, 460px);
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 12px;
  background: rgba(29, 47, 80, 0.94);
  color: #f4f8ff;
  font-size: 13px;
  box-shadow: 0 18px 40px -24px rgba(24, 40, 68, 0.9);
}

.toast span {
  flex: 1;
}

.toast button {
  font-size: 12.5px;
  color: #a9c8f2;
  text-underline-offset: 3px;
}

.toast button:hover {
  color: #fff;
  text-decoration: underline;
}

.toast .close {
  font-size: 16px;
  line-height: 1;
  color: rgba(244, 248, 255, 0.6);
}

.toast .close:hover {
  color: #fff;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s var(--ease),
    transform 0.25s var(--ease);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s var(--ease);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

/* ---------- 响应式 ---------- */
@media (max-width: 860px) {
  .topbar-inner {
    height: auto;
    flex-wrap: wrap;
    padding: 10px 0;
    gap: 10px;
  }

  .tools {
    width: 100%;
    margin-left: 0;
  }

  .tools .btn {
    flex: 1;
  }

  .store {
    margin-left: 0;
    max-width: none;
    width: 100%;
  }

  .figures {
    gap: 18px;
  }

  .figure b {
    font-size: 19px;
  }
}

@media (max-width: 620px) {
  .row {
    grid-template-columns: 22px minmax(0, 1fr) auto;
    grid-template-areas: 'pick main act';
    gap: 10px;
    padding: 10px 12px;
  }

  .pick-box {
    grid-area: pick;
  }

  .row-main {
    grid-area: main;
  }

  .row-actions {
    grid-area: act;
    justify-content: flex-end;
    opacity: 1;
  }

  .row-preview {
    grid-column: 1 / -1;
  }

  .row-2 {
    grid-template-columns: 1fr 1fr;
  }

  .row-2 .narrow {
    grid-column: span 2;
  }

  .summary {
    padding: 14px 16px;
  }

  .filters select {
    flex: 1 1 40%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mask,
  .sheet {
    animation: none;
  }
}
</style>
