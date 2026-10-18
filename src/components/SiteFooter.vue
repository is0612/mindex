<script setup lang="ts">
import { profile } from '@/data/profile'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container inner">
      <div class="brand-block">
        <span class="seal" aria-hidden="true">{{ profile.initial }}</span>
        <div>
          <p class="name">{{ profile.name }}</p>
          <p class="note">© {{ year }} · 用 Vue 3 + Vite 搭的</p>
        </div>
      </div>

      <div class="links">
        <a v-for="social in profile.socials" :key="social.label" :href="social.href" target="_blank" rel="noopener noreferrer">
          {{ social.label }}
        </a>
        <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 40px 0 52px;
  border-top: 1px solid var(--line);
  background: linear-gradient(180deg, transparent, rgba(47, 93, 80, 0.035));
}

.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
}

.seal {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 4px;
  background: var(--seal);
  color: #fff8f2;
  font-family: var(--font-serif);
  font-size: 18px;
  padding-top: 1px;
  rotate: -3deg;
}

.name {
  font-family: var(--font-serif);
  font-size: 16px;
  letter-spacing: 0.12em;
}

.note {
  font-size: 12.5px;
  color: var(--ink-3);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  font-size: 13.5px;
  color: var(--ink-3);
}

.links a {
  transition: color 0.25s var(--ease);
}

.links a:hover {
  color: var(--accent);
}

@media (max-width: 560px) {
  .links {
    gap: 16px;
    font-size: 13px;
  }
}
</style>
