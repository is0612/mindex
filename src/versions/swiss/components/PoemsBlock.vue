<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatDate, poemOfDay, poems, years, type Poem } from '@/data/poems'

const activeYear = ref('全部')
const expanded = ref<string | null>(poemOfDay().id)

const years$ = computed(() => ['全部', ...years])
const filtered = computed<Poem[]>(() =>
  activeYear.value === '全部' ? poems : poems.filter((p) => p.date.startsWith(activeYear.value)),
)
const shown = computed(() => filtered.value.slice(0, 60))

watch(activeYear, () => {
  if (!filtered.value.some((p) => p.id === expanded.value)) {
    expanded.value = filtered.value[0]?.id ?? null
  }
})

function toggle(id: string) {
  expanded.value = expanded.value === id ? null : id
}
</script>

<template>
  <section id="poetry" class="section">
    <div class="shell">
      <header class="head">
        <span class="head__no">02</span>
        <h2>诗词</h2>
        <span class="head__en">POEMS — {{ poems.length }}</span>
        <p class="head__note">点任意一行展开全文，再点收起。</p>
      </header>

      <div class="tabs">
        <button
          v-for="y in years$"
          :key="y"
          type="button"
          class="tabs__item"
          :class="{ 'is-on': activeYear === y }"
          @click="activeYear = y"
        >
          {{ y }}
        </button>
        <span class="tabs__count">{{ filtered.length }} 首</span>
      </div>

      <div class="table">
        <div v-for="(poem, i) in shown" :key="poem.id" class="row" v-reveal>
          <button
            type="button"
            class="row__head"
            :class="{ 'is-open': expanded === poem.id }"
            :aria-expanded="expanded === poem.id"
            @click="toggle(poem.id)"
          >
            <span class="row__no">{{ String(i + 1).padStart(3, '0') }}</span>
            <span class="row__title">{{ poem.title }}</span>
            <span class="row__genre">{{ poem.genre }}</span>
            <span class="row__date">{{ formatDate(poem.date) }}</span>
          </button>

          <div v-if="expanded === poem.id" class="row__body">
            <p v-for="(line, j) in poem.body.map((l) => l.trim()).filter(Boolean)" :key="j">
              {{ line }}
            </p>
          </div>
        </div>
      </div>

      <p v-if="filtered.length > shown.length" class="more">
        仅列出前 {{ shown.length }} 首，共 {{ filtered.length }} 首
      </p>
    </div>
  </section>
</template>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--rule);
}

.tabs__item {
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--gray);
  transition: color var(--fast);
}

.tabs__item:hover {
  color: var(--ink);
}

.tabs__item.is-on {
  color: var(--ink);
  font-weight: 700;
  box-shadow: inset 0 -2px 0 var(--red);
}

.tabs__count {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--gray-2);
}

/* —— 表格 —— */
.table {
  border-bottom: 1px solid var(--hair);
}

.row__head {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 90px 96px;
  align-items: baseline;
  gap: 16px;
  width: 100%;
  padding: 13px 8px;
  text-align: left;
  border-bottom: 1px solid var(--hair);
  transition: background var(--fast);
}

.row__no {
  font-size: 10px;
  font-weight: 600;
  color: var(--gray-2);
}

.row__title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row__genre,
.row__date {
  font-size: 10.5px;
  letter-spacing: 0.06em;
  color: var(--gray);
}

.row__head:hover {
  background: var(--white);
}

.row__head.is-open {
  background: var(--ink);
  color: var(--white);
}

.row__head.is-open .row__no {
  color: rgba(255, 255, 255, 0.55);
}

.row__head.is-open .row__genre,
.row__head.is-open .row__date {
  color: rgba(255, 255, 255, 0.6);
}

.row__body {
  padding: 22px 8px 26px 72px;
  border-bottom: 1px solid var(--hair);
}

.row__body p {
  font-size: clamp(1.02rem, 1.4vw, 1.18rem);
  line-height: 2;
  letter-spacing: 0.05em;
  color: var(--ink);
}

.more {
  margin-top: 12px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--gray-2);
}

@media (max-width: 720px) {
  .row__head {
    grid-template-columns: 40px minmax(0, 1fr) 76px;
  }

  .row__genre {
    display: none;
  }

  .row__body {
    padding-left: 56px;
  }
}
</style>
