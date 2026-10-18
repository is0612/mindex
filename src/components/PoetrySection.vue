<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PoemDialog from '@/components/PoemDialog.vue'
import { firstLine, formatDate, poemOfDay, poems, years, type Poem } from '@/data/poems'

/* ---------- 今日一首 ---------- */
const daily = ref<Poem>(poemOfDay())

/** 最多展示四句，长调只露开头 */
const dailyLines = computed(() => daily.value.body.slice(0, 4))
const dailyTrimmed = computed(() => daily.value.body.length > 4)

/**
 * 律绝每句不超过九字，竖排好看；
 * 词的长句竖排会被裁掉，改成横排居中。
 */
const vertical = computed(() => dailyLines.value.every((l) => l.length <= 9))

function swapDaily() {
  if (poems.length < 2) return
  let next = daily.value
  while (next.id === daily.value.id) {
    next = poems[Math.floor(Math.random() * poems.length)]
  }
  daily.value = next
}

/* ---------- 年份筛选 ---------- */
const activeYear = ref('全部')
const filters = ['全部', ...years]

const filtered = computed(() =>
  activeYear.value === '全部'
    ? poems
    : poems.filter((p) => p.date.startsWith(activeYear.value)),
)

const PAGE = 9
const shown = ref(PAGE)
const visible = computed(() => filtered.value.slice(0, shown.value))
const hasMore = computed(() => filtered.value.length > shown.value)

watch(activeYear, () => {
  shown.value = PAGE
})

/* ---------- 全文弹层 ---------- */
const activePoem = ref<Poem | null>(null)
const activeList = ref<Poem[]>(poems)

function openPoem(poem: Poem, list: Poem[]) {
  activeList.value = list
  activePoem.value = poem
}

watch(activeYear, () => {
  activePoem.value = null
})
</script>

<template>
  <section id="poetry" class="section">
    <div class="container">
      <!-- 今日一首 -->
      <article class="daily" v-reveal>
        <header class="daily-head">
          <span class="daily-label">今日一首</span>
          <button class="swap" type="button" @click="swapDaily">换一首</button>
        </header>

        <div class="daily-verse" :class="vertical ? 'is-vertical' : 'is-flat'">
          <div class="daily-lines">
            <span v-for="(line, i) in dailyLines" :key="i">{{ line }}</span>
            <span v-if="dailyTrimmed" class="dots">……</span>
          </div>
        </div>

        <footer class="daily-foot">
          <button class="daily-title" type="button" @click="openPoem(daily, poems)">
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
      <div class="toolbar" v-reveal="60">
        <div class="filters" role="tablist" aria-label="按年份筛选">
          <button
            v-for="y in filters"
            :key="y"
            type="button"
            role="tab"
            :aria-selected="activeYear === y"
            :class="{ active: activeYear === y }"
            @click="activeYear = y"
          >
            {{ y }}
          </button>
        </div>
        <span class="count">{{ filtered.length }} 首</span>
      </div>

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
    </div>

    <PoemDialog
      v-if="activePoem"
      :poem="activePoem"
      :list="activeList"
      @update:poem="activePoem = $event"
      @close="activePoem = null"
    />
  </section>
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
  align-items: center;
  justify-content: center;
  padding: 26px 0 20px;
  overflow-x: auto;
}

.daily-lines {
  font-family: var(--font-serif);
  color: var(--ink);
}

/* 律绝：竖排，从右往左 */
.is-vertical .daily-lines {
  writing-mode: vertical-rl;
  height: clamp(220px, 30vh, 300px);
  font-size: 19px;
  line-height: 1.6;
  letter-spacing: 0.14em;
}

.is-vertical .daily-lines span {
  display: block;
  white-space: nowrap;
  margin-bottom: 20px;
}

/* 长调：句子太长，竖排会被裁掉，改横排居中 */
.is-flat .daily-lines {
  max-width: 660px;
  font-size: 16.5px;
  line-height: 2.1;
  letter-spacing: 0.05em;
  text-align: center;
}

.is-flat .daily-lines span {
  display: block;
}

.daily-lines .dots {
  opacity: 0.45;
  letter-spacing: 0.3em;
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

/* ---------- 筛选 ---------- */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filters button {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 13.5px;
  color: var(--ink-3);
  transition:
    color 0.25s var(--ease),
    background 0.25s var(--ease),
    border-color 0.25s var(--ease);
}

.filters button:hover {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.6);
}

.filters button.active {
  color: var(--accent);
  background: var(--accent-wash);
  border-color: rgba(47, 93, 80, 0.16);
  font-weight: 500;
}

.count {
  font-size: 12.5px;
  letter-spacing: 0.08em;
  color: var(--ink-3);
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

@media (max-width: 720px) {
  .daily {
    padding: 20px 18px 18px;
  }

  .daily-lines {
    font-size: 17px;
    letter-spacing: 0.1em;
  }

  .is-vertical .daily-lines {
    height: 220px;
  }

  .is-flat .daily-lines {
    font-size: 15.5px;
  }

  .is-vertical .daily-lines span {
    margin-bottom: 16px;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
