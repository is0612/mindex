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

function pick(poem: Poem) {
  current.value = poem
}

function random() {
  const pool = filtered.value.filter((p) => p.id !== current.value.id)
  current.value = pool[Math.floor(Math.random() * pool.length)] ?? current.value
}
</script>

<template>
  <section id="poetry" class="section">
    <div class="shell">
      <header class="sec-head">
        <div class="sec-head__left">
          <span class="sec-head__no">第二章</span>
          <h2>诗词</h2>
          <span class="sec-head__en">Poems</span>
        </div>
        <p class="sec-head__note">{{ poems.length }} 首，从二〇一〇年写到现在。竖排右起，读法如旧。</p>
      </header>

      <div class="poetry">
        <!-- 竖排阅读 -->
        <div class="reader">
          <div class="reader__top">
            <span>第 {{ String(no).padStart(3, '0') }} 首</span>
            <span>{{ current.genre }} · {{ formatDate(current.date) }}</span>
          </div>

          <div class="scroll">
            <Transition name="turn" mode="out-in">
              <article :key="current.id" class="vtxt">
                <h3>{{ current.title }}</h3>
                <p v-for="(line, i) in lines" :key="i">{{ line }}</p>
              </article>
            </Transition>
          </div>

          <div class="reader__foot">
            <button type="button" class="link" @click="random">
              随手一首 <span aria-hidden="true">↻</span>
            </button>
            <button type="button" class="link" @click="current = poemOfDay()">
              今日一首
            </button>
            <span class="reader__hint">竖排 · 可横向滚动</span>
          </div>
        </div>

        <!-- 目录 -->
        <aside class="catalog">
          <div class="catalog__years">
            <button
              v-for="y in years$"
              :key="y"
              type="button"
              class="catalog__year"
              :class="{ 'is-on': activeYear === y }"
              @click="activeYear = y"
            >
              {{ y }}
            </button>
          </div>

          <ol class="catalog__list">
            <li v-for="poem in shown" :key="poem.id">
              <button
                type="button"
                class="catalog__item"
                :class="{ 'is-on': poem.id === current.id }"
                @click="pick(poem)"
              >
                <span class="catalog__title">{{ poem.title }}</span>
                <span class="catalog__meta">{{ poem.genre }} · {{ formatDate(poem.date).slice(0, 7) }}</span>
              </button>
            </li>
          </ol>

          <p class="catalog__foot">
            共 {{ filtered.length }} 首<span v-if="filtered.length > shown.length">，先列 {{ shown.length }} 首</span>
          </p>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.poetry {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 56px;
  align-items: start;
}

/* —— 竖排阅读区 —— */
.reader {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.reader__top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 10.5px;
  letter-spacing: 0.14em;
  color: var(--ink-4);
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
}

.scroll {
  writing-mode: vertical-rl;
  height: 440px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 34px 4px 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}

.vtxt {
  height: 100%;
}

/* 竖排里块从右往左排，每个块自成一行（一列） */
.vtxt > * {
  height: 100%;
  margin-block-start: 0;
}

.vtxt > * + * {
  margin-block-start: 34px;
}

.vtxt h3 {
  font-size: clamp(1.4rem, 2.2vw, 1.75rem);
  letter-spacing: 0.16em;
  color: var(--ink);
}

.vtxt p {
  font-family: var(--font-serif);
  font-size: clamp(1rem, 1.4vw, 1.12rem);
  line-height: 2.05;
  letter-spacing: 0.18em;
  color: var(--ink-2);
}

.reader__foot {
  display: flex;
  align-items: center;
  gap: 26px;
  margin-top: 24px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.reader__hint {
  margin-left: auto;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--ink-4);
}

/* —— 目录 —— */
.catalog {
  min-width: 0;
  border-left: 1px solid var(--line);
  padding-left: 28px;
}

.catalog__years {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.catalog__year {
  font-size: 11.5px;
  color: var(--ink-3);
  letter-spacing: 0.06em;
  border-bottom: 1px solid transparent;
  transition:
    color 0.2s var(--ease),
    border-color 0.2s var(--ease);
}

.catalog__year:hover {
  color: var(--ink);
}

.catalog__year.is-on {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.catalog__list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}

.catalog__item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 9px 0;
  text-align: left;
  border-bottom: 1px solid var(--line);
  transition: color 0.2s var(--ease);
}

.catalog__title {
  font-family: var(--font-serif);
  font-size: 14.5px;
  letter-spacing: 0.02em;
  color: var(--ink-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.catalog__meta {
  flex-shrink: 0;
  font-size: 9.5px;
  color: var(--ink-4);
}

.catalog__item:hover .catalog__title {
  color: var(--ink);
}

.catalog__item.is-on .catalog__title {
  color: var(--seal);
}

.catalog__foot {
  margin-top: 12px;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--ink-4);
}

.turn-enter-active,
.turn-leave-active {
  transition: opacity 0.28s var(--ease);
}

.turn-enter-from,
.turn-leave-to {
  opacity: 0;
}

@media (max-width: 980px) {
  .poetry {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .catalog {
    border-left: none;
    border-top: 1px solid var(--line);
    padding-left: 0;
    padding-top: 24px;
  }

  .catalog__list {
    max-height: 340px;
  }
}

/* 手机上竖排会变得难以阅读，改为横排 */
@media (max-width: 720px) {
  .scroll {
    writing-mode: horizontal-tb;
    height: auto;
    overflow: visible;
    padding: 24px 0 0;
  }

  .vtxt {
    height: auto;
    display: block;
  }

  .vtxt > * {
    height: auto;
  }

  .vtxt > * + * {
    margin-block-start: 10px;
  }

  .vtxt p {
    letter-spacing: 0.08em;
    line-height: 2;
  }

  .vtxt h3 {
    margin-bottom: 14px;
  }

  .reader__hint {
    display: none;
  }
}
</style>
