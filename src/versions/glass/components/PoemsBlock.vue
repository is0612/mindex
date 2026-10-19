<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatDate, poemOfDay, poems, years, type Poem } from '@/data/poems'

const activeYear = ref('全部')
const current = ref<Poem>(poemOfDay())
const years$ = computed(() => ['全部', ...years])

const filtered = computed<Poem[]>(() =>
  activeYear.value === '全部' ? poems : poems.filter((p) => p.date.startsWith(activeYear.value)),
)
const shown = computed(() => filtered.value.slice(0, 40))
const lines = computed(() => current.value.body.map((l) => l.trim()).filter(Boolean))
const no = computed(() => poems.findIndex((p) => p.id === current.value.id) + 1)

watch(activeYear, () => {
  if (!filtered.value.some((p) => p.id === current.value.id) && filtered.value[0]) {
    current.value = filtered.value[0]
  }
})

function random() {
  const pool = filtered.value.filter((p) => p.id !== current.value.id)
  current.value = pool[Math.floor(Math.random() * pool.length)] ?? current.value
}
</script>

<template>
  <section id="poetry" class="section">
    <div class="shell">
      <header class="head">
        <span class="head__badge">02 · 诗词</span>
        <h2>Poems &amp; Verses</h2>
        <p class="head__note">{{ poems.length }} 首，平仄之间记一点心绪。</p>
      </header>

      <div class="layout">
        <!-- 阅读卡 -->
        <article class="reader card">
          <div class="reader__top">
            <span class="reader__no">NO. {{ String(no).padStart(3, '0') }}</span>
            <span class="reader__meta">{{ current.genre }} · {{ formatDate(current.date) }}</span>
          </div>

          <Transition name="swap" mode="out-in">
            <div :key="current.id">
              <h3 class="reader__title">{{ current.title }}</h3>
              <div class="reader__rule" aria-hidden="true" />
              <div class="reader__lines">
                <p v-for="(line, i) in lines" :key="i">{{ line }}</p>
              </div>
            </div>
          </Transition>

          <div class="reader__foot">
            <button type="button" class="mini" @click="random">↻ 随手一首</button>
            <button type="button" class="mini" @click="current = poemOfDay()">今日一首</button>
          </div>
        </article>

        <!-- 目录卡 -->
        <aside class="catalog card">
          <div class="catalog__years">
            <button
              v-for="y in years$"
              :key="y"
              type="button"
              class="ypill"
              :class="{ 'is-on': activeYear === y }"
              @click="activeYear = y"
            >
              {{ y }}
            </button>
          </div>

          <div class="catalog__list">
            <button
              v-for="poem in shown"
              :key="poem.id"
              type="button"
              class="item"
              :class="{ 'is-on': poem.id === current.id }"
              @click="current = poem"
            >
              <span class="item__title">{{ poem.title }}</span>
              <span class="item__date">{{ formatDate(poem.date).slice(0, 7) }}</span>
            </button>
          </div>

          <p class="catalog__foot">已显示 {{ shown.length }} / {{ filtered.length }} 首</p>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
  gap: 22px;
  align-items: start;
}

/* —— 阅读卡 —— */
.reader {
  padding: 34px 38px 24px;
  min-height: 430px;
  display: flex;
  flex-direction: column;
}

.reader__top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--ink-3);
}

.reader__title {
  margin-top: 20px;
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  color: var(--ink);
}

.reader__rule {
  width: 46px;
  height: 3px;
  border-radius: 3px;
  margin: 20px 0;
  background: linear-gradient(90deg, var(--blue), var(--blue-2));
}

.reader__lines {
  font-size: clamp(1.02rem, 1.4vw, 1.18rem);
  line-height: 2.1;
  letter-spacing: 0.05em;
  color: var(--ink-2);
}

.reader__foot {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 24px;
}

.mini {
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--card-strong);
  border: 1px solid var(--card-line);
  font-size: 12px;
  font-weight: 600;
  color: var(--blue-deep);
  transition:
    background 0.25s var(--ease),
    transform 0.25s var(--ease);
}

.mini:hover {
  background: #fff;
  transform: translateY(-1px);
}

/* —— 目录卡 —— */
.catalog {
  position: sticky;
  top: calc(var(--nav-h) + 24px);
  padding: 20px 18px 14px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - var(--nav-h) - 60px);
}

.catalog__years {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(65, 86, 107, 0.1);
}

.ypill {
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 11.5px;
  color: var(--ink-3);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition:
    background 0.2s var(--ease),
    color 0.2s var(--ease);
}

.ypill:hover {
  background: #fff;
  color: var(--ink);
}

.ypill.is-on {
  background: var(--blue);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
}

.catalog__list {
  flex: 1;
  overflow-y: auto;
  margin-top: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(65, 86, 107, 0.25) transparent;
}

.item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 11px 12px;
  border-radius: 14px;
  text-align: left;
  transition: background 0.2s var(--ease);
}

.item:hover {
  background: rgba(255, 255, 255, 0.85);
}

.item.is-on {
  background: rgba(47, 124, 214, 0.12);
}

.item__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item.is-on .item__title {
  color: var(--blue-deep);
}

.item__date {
  flex-shrink: 0;
  font-size: 10.5px;
  color: var(--ink-4);
}

.catalog__foot {
  margin-top: 10px;
  font-size: 10.5px;
  color: var(--ink-4);
  text-align: right;
}

.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.25s var(--ease),
    transform 0.25s var(--ease);
}

.swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .catalog {
    position: static;
    max-height: 420px;
  }

  .reader {
    min-height: 360px;
    padding: 26px 24px 20px;
  }
}
</style>
