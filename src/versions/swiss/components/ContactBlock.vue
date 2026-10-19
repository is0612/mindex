<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { profile } from '@/data/profile'

const copied = ref(false)
let timer = 0

async function copy() {
  try {
    await navigator.clipboard.writeText(profile.email)
  } catch {
    /* 忽略，按钮文案仍会变化提示 */
  }
  copied.value = true
  window.clearTimeout(timer)
  timer = window.setTimeout(() => (copied.value = false), 1800)
}

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <section id="contact" class="section contact">
    <div class="shell">
      <header class="head">
        <span class="head__no">04</span>
        <h2>联系</h2>
        <span class="head__en">CONTACT</span>
        <p class="head__note">两三天之内一定回。</p>
      </header>

      <a class="mail" :href="`mailto:${profile.email}`">{{ profile.email }}</a>

      <div class="row">
        <a class="btn" :href="`mailto:${profile.email}`">写信</a>
        <button type="button" class="copy" :class="{ 'is-done': copied }" @click="copy">
          {{ copied ? '✓ COPIED' : 'COPY EMAIL' }}
        </button>
      </div>

      <div class="socials">
        <a
          v-for="s in profile.socials"
          :key="s.label"
          :href="s.href"
          target="_blank"
          rel="noreferrer noopener"
        >
          <span class="socials__label">{{ s.label }}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <footer class="foot">
        <span>© 2026 {{ profile.name }} / {{ profile.location }}</span>
        <span class="foot__mid">EDITION V.02 — SWISS GRID</span>
        <a href="#top">↑ TOP</a>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding-bottom: 40px;
}

.mail {
  display: inline-block;
  font-size: clamp(1.9rem, 5.6vw, 4.4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  border-bottom: 3px solid var(--ink);
  padding-bottom: 6px;
  transition:
    color var(--fast),
    border-color var(--fast);
}

.mail:hover {
  color: var(--red);
  border-bottom-color: var(--red);
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 26px;
  flex-wrap: wrap;
}

.copy {
  min-height: 44px;
  padding: 0 22px;
  border: 1px solid var(--ink);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  transition:
    background var(--fast),
    color var(--fast);
}

.copy:hover,
.copy.is-done {
  background: var(--ink);
  color: var(--white);
}

.copy.is-done {
  border-color: var(--red);
  background: var(--red);
}

.socials {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 44px;
}

.socials a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border: 1px solid var(--hair);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition:
    background var(--fast),
    color var(--fast),
    border-color var(--fast);
}

.socials a:hover {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--white);
}

.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 64px;
  padding-top: 14px;
  border-top: 1px solid var(--rule);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--gray);
}

.foot a:hover {
  color: var(--red);
}

@media (max-width: 720px) {
  .socials {
    grid-template-columns: 1fr;
  }

  .foot {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .foot__mid {
    display: none;
  }
}
</style>
