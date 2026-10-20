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

/** 长调先露 10 行，其余进弹层读，避免一张卡片把整页撑到几千像素 */
const DAILY_PREVIEW = 10
const dailyVisible = computed(() => dailyLines.value.slice(0, DAILY_PREVIEW))
const dailyClipped = computed(() => dailyLines.value.length > DAILY_PREVIEW)

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

      <div class="daily-verse" :class="{ 'is-short': dailyShort, 'is-clipped': dailyClipped }">
        <div class="verse-body">
          <p v-for="(line, i) in dailyVisible" :key="i" :class="{ blank: !line }">{{ line }}</p>
        </div>
      </div>

      <div v-if="dailyClipped" class="daily-more">
        <button class="btn btn-ghost" type="button" @click="openDaily">
          读全文 <span class="dim">共 {{ dailyLines.length }} 行</span>
        </button>
      </div>

      <footer class="daily-foot">
        <button class="daily-title" type="button" @click="openDaily">
          {{ daily.title }}
        </button>
        <span class="daily-meta">
          <template v-if="daily.genre">{{ daily.genre }}</template>
          <template v-if="daily.genre && daily.date"> · </template>
          <template v-if="daily.date">{{ formatDate(daily.date) }}</template>
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

<style scoped lang="scss">
@use '../styles/mixins' as *;

// ---------- 今日一首 ----------
.daily {
  position: relative;
  overflow: hidden;
  margin-bottom: 36px;
  padding: 26px 30px 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(120% 90% at 50% -20%, rgba(165, 196, 241, 0.22), transparent 60%),
    var(--surface);
  box-shadow: var(--shadow-sm);

  @include mq(md) {
    margin-bottom: 24px;
    padding: 20px 18px 16px;
  }
}

.daily-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.daily-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--seal);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.24em;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
}

.swap {
  padding: 4px 10px;
  border-radius: 999px;
  color: var(--ink-3);
  font-size: 12.5px;
  transition:
    color var(--dur) var(--ease),
    background var(--dur) var(--ease);

  &:hover {
    background: rgba(255, 255, 255, 0.7);
    color: var(--accent);
  }

  @include focus-ring(2px);
}

.daily-verse {
  display: flex;
  justify-content: center;
  padding: 26px 0 22px;

  // 长词只露 10 行，最后两行淡出，提示还能往下读
  &.is-clipped {
    padding-bottom: 4px;

    .verse-body {
      mask-image: linear-gradient(180deg, #000 80%, transparent 100%);
      -webkit-mask-image: linear-gradient(180deg, #000 80%, transparent 100%);
    }
  }

  @include mq(md) {
    padding: 20px 0 16px;
  }
}

.verse-body {
  width: 100%;
  max-width: 660px;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: clamp(15px, 1.1vw, 16.5px);
  line-height: 2.1;
  letter-spacing: 0.04em;
  text-align: center;
  text-wrap: pretty;

  p {
    white-space: pre-wrap;
  }

  // 词的上下阕之间：撑满一行高度，才是真的空一行
  p.blank::before {
    content: '\00a0';
  }

  // 绝句只有四行，给大一点的字
  .is-short & {
    font-size: clamp(17px, 1.35vw, 19px);
    letter-spacing: 0.08em;
    line-height: 2.15;
  }

  @include mq(md) {
    font-size: 15.5px;
    line-height: 2.05;

    .is-short & {
      font-size: 17px;
      line-height: 2.1;
    }
  }
}

.daily-more {
  display: flex;
  justify-content: center;
  margin: 0 0 18px;

  .btn {
    padding: 7px 18px;
    font-size: 12.5px;
  }

  .dim {
    color: var(--ink-3);
    font-size: 11px;
  }
}

.daily-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--line);

  @include mq(sm) {
    gap: 10px;
  }
}

.daily-title {
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 16px;
  letter-spacing: 0.06em;
  transition: color var(--dur) var(--ease);

  &:hover {
    color: var(--seal);
  }

  @include focus-ring(2px);
}

.daily-meta {
  color: var(--ink-3);
  font-size: 11.5px;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

// ---------- 列表 ----------
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;

  @include mq(md) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  overflow: hidden;
  min-height: 112px;
  padding: 20px 22px 18px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
  text-align: left;
  transition:
    border-color 0.3s var(--ease),
    background 0.3s var(--ease),
    translate 0.3s var(--ease),
    box-shadow 0.3s var(--ease);

  // 悬停时顶部亮起一条渐变
  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), #a5c5f6);
    scale: 0 1;
    transform-origin: left;
    transition: scale 0.3s var(--ease);
  }

  &:hover {
    translate: 0 -3px;
    border-color: var(--line-2);
    background: #fff;
    box-shadow: var(--shadow-sm);

    &::before {
      scale: 1 1;
    }
  }

  @include mq(md) {
    min-height: 0;
    padding: 16px 18px 14px;
  }

  @include focus-ring(2px);
}

.card-title {
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 16.5px;
  letter-spacing: 0.04em;
}

.card-line {
  @include clamp-lines(2);

  color: var(--ink-2);
  font-family: var(--font-serif);
  font-size: 13.5px;
  line-height: 1.9;
}

.card-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-top: 2px;
  color: var(--ink-3);
  font-size: 11px;
  letter-spacing: 0.08em;
}

.card-genre {
  color: var(--seal);
  opacity: 0.9;
}

.card-date {
  font-variant-numeric: tabular-nums;
}

.more {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

.empty {
  padding: 40px 0;
  color: var(--ink-3);
  font-size: 13.5px;
  text-align: center;
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
  border: 1px solid rgba(91, 124, 177, 0.25);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  color: var(--ink-2);
  font-size: 13.5px;
  transition:
    color var(--dur) var(--ease),
    border-color var(--dur) var(--ease),
    background var(--dur) var(--ease),
    translate var(--dur) var(--ease);

  span {
    transition: translate var(--dur) var(--ease);
  }

  &:hover {
    translate: 0 -1px;
    border-color: rgba(87, 126, 187, 0.52);
    background: #fff;
    color: var(--accent);

    span {
      translate: 3px 0;
    }
  }

  @include focus-ring(3px);
}
</style>
