<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import FilterTabs from '@/components/FilterTabs.vue'
import PoemDialog from '@/components/PoemDialog.vue'
import { linesOf, firstLine, formatDate, poemOfDay, type Poem } from '@/data/poems'
import { loadPoems, poems, years } from '@/stores/poetry'

onMounted(loadPoems)

/* ---------- 今日一首 ---------- */
/** 换过就固定这一首 */
const picked = ref<Poem | null>(null)
const daily = computed<Poem | null>(() => picked.value ?? poemOfDay(poems.value))

/** 整首完整显示，不截断 */
const dailyLines = computed<string[]>(() => (daily.value ? linesOf(daily.value) : []))
const dailyShort = computed(() => dailyLines.value.filter(Boolean).length <= 4)

function swapDaily() {
  const list = poems.value
  if (list.length < 2) return
  const current = daily.value?.id
  let next = current
  while (next === current) next = list[Math.floor(Math.random() * list.length)].id
  picked.value = list.find((p) => p.id === next) ?? null
}

function openDaily() {
  if (daily.value) openPoem(daily.value, poems.value)
}

/* ---------- 年份筛选 ---------- */
const activeYear = ref('全部')
const filters = computed(() => ['全部', ...years.value])

const filtered = computed(() =>
  activeYear.value === '全部'
    ? poems.value
    : poems.value.filter((p) => p.date.startsWith(activeYear.value)),
)

const PAGE = 9
const shown = ref(PAGE)
const visible = computed(() => filtered.value.slice(0, shown.value))
const hasMore = computed(() => filtered.value.length > shown.value)

/* ---------- 全文弹层 ---------- */
const activePoem = ref<Poem | null>(null)
const activeList = ref<Poem[]>([])

function openPoem(poem: Poem, list: Poem[]) {
  activeList.value = list
  activePoem.value = poem
}

// 换年份时重置分页，顺手关掉弹层
watch(activeYear, () => {
  shown.value = PAGE
  activePoem.value = null
})
</script>

<template>
  <div class="poetry">
    <!-- 今日一首 -->
    <article v-if="daily" class="daily" v-reveal>
      <header class="daily-head">
        <span class="daily-label">今日一首</span>
        <button class="swap" type="button" @click="swapDaily">换一首</button>
      </header>

      <div class="daily-verse" :class="{ 'is-short': dailyShort }">
        <div class="verse-body">
          <p v-for="(line, i) in dailyLines" :key="i" :class="{ blank: !line }">{{ line }}</p>
        </div>
      </div>

      <footer class="daily-foot">
        <button class="daily-title" type="button" @click="openDaily">
          {{ daily.title }}
        </button>
        <span class="daily-meta">
          <template v-if="daily.genre">{{ daily.genre }}</template>
          <template v-if="daily.genre && daily.date"> · </template>
          <template v-if="daily.date">{{ formatDate(daily.date) }}</template>
          <template v-if="dailyLines.length > 8"> · 共 {{ dailyLines.length }} 行</template>
        </span>
      </footer>
    </article>

    <!-- 年份筛选 -->
    <FilterTabs
      v-model="activeYear"
      :options="filters"
      label="按年份筛选"
      :count="`${filtered.length} 首`"
    />

    <!-- 诗词列表 -->
    <div :key="activeYear" class="grid">
      <button
        v-for="(poem, i) in visible"
        :key="poem.id"
        v-reveal="(i % 3) * 70"
        type="button"
        class="card"
        :aria-label="`读《${poem.title}》`"
        @click="openPoem(poem, filtered)"
      >
        <span class="card-title">{{ poem.title }}</span>
        <span class="card-line">{{ firstLine(poem) }}</span>
        <span class="card-foot">
          <span class="card-genre">{{ poem.genre }}</span>
          <span class="card-date">{{ formatDate(poem.date) }}</span>
        </span>
      </button>
    </div>

    <div v-if="hasMore" class="more">
      <button class="btn btn-ghost" type="button" @click="shown += PAGE">
        再看 {{ Math.min(PAGE, filtered.length - shown) }} 首
      </button>
    </div>

    <p v-else-if="filtered.length === 0" class="empty">这一年还没有留下字。</p>

    <!-- 进管理页看全部 -->
    <div v-if="poems.length" class="archive">
      <a class="archive-link" href="#/poems">
        查看全部 {{ poems.length }} 首 · 管理诗词
        <span aria-hidden="true">→</span>
      </a>
    </div>

    <PoemDialog
      v-if="activePoem"
      :poem="activePoem"
      :list="activeList"
      @update:poem="activePoem = $event"
      @close="activePoem = null"
    />
  </div>
</template>

<style scoped>
/* ---------- 今日一首 ---------- */
.daily {
  display: flex;
  flex-direction: column;
  padding: 26px 30px 22px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.28));
  box-shadow: var(--shadow-sm);
  margin-bottom: 40px;
}

.daily-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.daily-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--seal);
}

.swap {
  font-size: 12.5px;
  color: var(--ink-3);
  transition: color 0.22s var(--ease);
}

.swap:hover {
  color: var(--accent);
}

.daily-verse {
  display: flex;
  justify-content: center;
  padding: 28px 0 24px;
}

.verse-body {
  width: 100%;
  max-width: 660px;
  font-family: var(--font-serif);
  font-size: clamp(15px, 1.1vw, 16.5px);
  line-height: 2.1;
  letter-spacing: 0.04em;
  color: var(--ink);
  text-align: center;
  text-wrap: pretty;
}

/* 绝句只有四行，给大一点的字，不然太小一块 */
.is-short .verse-body {
  font-size: clamp(17px, 1.35vw, 19px);
  line-height: 2.15;
  letter-spacing: 0.08em;
}

.verse-body p {
  white-space: pre-wrap;
}

/* 词的上下阕之间：撑满一行高度，才是真的空一行 */
.verse-body p.blank::before {
  content: '\00a0';
}

.daily-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.daily-title {
  font-family: var(--font-serif);
  font-size: 16px;
  letter-spacing: 0.06em;
  color: var(--ink);
  transition: color 0.22s var(--ease);
}

.daily-title:hover {
  color: var(--seal);
}

.daily-meta {
  font-size: 11.5px;
  letter-spacing: 0.1em;
  color: var(--ink-3);
  white-space: nowrap;
}

/* ---------- 列表 ---------- */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
  gap: 16px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 22px 18px;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.42);
  transition:
    border-color 0.3s var(--ease),
    background 0.3s var(--ease),
    translate 0.3s var(--ease),
    box-shadow 0.3s var(--ease);
}

.card:hover {
  translate: 0 -3px;
  border-color: var(--line-2);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-family: var(--font-serif);
  font-size: 16.5px;
  letter-spacing: 0.04em;
  color: var(--ink);
}

.card-line {
  font-family: var(--font-serif);
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--ink-2);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-top: 2px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--ink-3);
}

.card-genre {
  color: var(--seal);
  opacity: 0.8;
}

.more {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

.empty {
  padding: 40px 0;
  text-align: center;
  font-size: 13.5px;
  color: var(--ink-3);
}

.archive {
  display: flex;
  justify-content: center;
  margin-top: 34px;
  padding-top: 26px;
  border-top: 1px solid var(--line);
}

.archive-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 22px;
  border-radius: 999px;
  border: 1px solid rgba(91, 124, 177, 0.25);
  background: rgba(255, 255, 255, 0.62);
  font-size: 13.5px;
  color: var(--ink-2);
  transition:
    color 0.25s var(--ease),
    border-color 0.25s var(--ease),
    background 0.25s var(--ease),
    transform 0.25s var(--ease);
}

.archive-link span {
  transition: transform 0.25s var(--ease);
}

.archive-link:hover {
  color: var(--accent);
  border-color: rgba(87, 126, 187, 0.52);
  background: #fff;
}

.archive-link:hover span {
  transform: translateX(3px);
}

@media (max-width: 720px) {
  .daily {
    padding: 20px 18px 18px;
  }

  .daily-verse {
    padding: 22px 0 18px;
  }

  .verse-body {
    font-size: 15.5px;
    line-height: 2.05;
  }

  .is-short .verse-body {
    font-size: 17px;
    line-height: 2.1;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
