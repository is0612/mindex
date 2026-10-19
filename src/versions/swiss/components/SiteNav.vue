<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { profile } from '@/data/profile'

const links = [
  { id: 'works', no: '01', label: '作品' },
  { id: 'poetry', no: '02', label: '诗词' },
  { id: 'about', no: '03', label: '关于' },
  { id: 'contact', no: '04', label: '联系' },
]

const stuck = ref(false)
const active = ref('')

function onScroll() {
  stuck.value = window.scrollY > 4
  let current = ''
  for (const l of links) {
    const el = document.getElementById(l.id)
    if (el && el.getBoundingClientRect().top <= 140) current = l.id
  }
  active.value = current
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="nav" :class="{ 'is-stuck': stuck }">
    <div class="nav__inner shell">
      <a class="brand" href="#top">
        <span class="brand__zh">{{ profile.name }}</span>
        <span class="brand__en">SHEN YAN</span>
      </a>

      <nav class="nav__links" aria-label="页面导航">
        <a
          v-for="l in links"
          :key="l.id"
          :href="`#${l.id}`"
          :class="{ 'is-on': active === l.id }"
        >
          <span class="nav__no">{{ l.no }}</span>
          {{ l.label }}
        </a>
      </nav>

      <a class="nav__mail" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background: var(--paper);
  border-bottom: 1px solid var(--hair);
  transition: border-color var(--fast);
}

.nav.is-stuck {
  border-bottom-color: var(--rule);
}

.nav__inner {
  height: var(--nav-h);
  display: flex;
  align-items: center;
  gap: 32px;
}

.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
}

.brand__zh {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.brand__en {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.28em;
  color: var(--gray-2);
}

.nav__links {
  display: flex;
  gap: 26px;
  margin-left: auto;
}

.nav__links a {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--gray);
  padding: 3px 0;
  border-bottom: 2px solid transparent;
  transition:
    color var(--fast),
    border-color var(--fast);
}

.nav__no {
  font-size: 9px;
  font-weight: 600;
  color: var(--gray-2);
}

.nav__links a:hover {
  color: var(--ink);
}

.nav__links a.is-on {
  color: var(--ink);
  border-bottom-color: var(--red);
}

.nav__mail {
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--gray);
}

.nav__mail:hover {
  color: var(--red);
}

@media (max-width: 860px) {
  .nav__mail {
    display: none;
  }

  .nav__links {
    margin-left: auto;
    gap: 16px;
  }

  .nav__no {
    display: none;
  }
}

@media (max-width: 520px) {
  .brand__en {
    display: none;
  }

  .nav__links {
    gap: 12px;
  }

  .nav__links a {
    font-size: 11.5px;
  }
}
</style>
