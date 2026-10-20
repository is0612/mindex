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
          <p class="note">© {{ year }} · 用 Vue 3 + Vite + Sass 搭的</p>
        </div>
      </div>

      <div class="links">
        <a
          v-for="social in profile.socials"
          :key="social.label"
          :href="social.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ social.label }}
        </a>
        <a v-if="profile.email" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        <a class="top" href="#home">回到顶部 <span aria-hidden="true">↑</span></a>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@use '../styles/mixins' as *;

.footer {
  padding: 40px 0 52px;
  border-top: 1px solid var(--line);
  background: linear-gradient(180deg, transparent, rgba(88, 132, 196, 0.05));
}

.inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
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
  padding-top: 1px;
  border-radius: 10px;
  background: linear-gradient(145deg, #86a9e2, #4b70ae);
  box-shadow: 0 6px 16px -10px rgba(55, 91, 151, 0.85);
  color: #fff;
  font-family: var(--font-serif);
  font-size: 17px;
  rotate: -3deg;
}

.name {
  font-family: var(--font-serif);
  font-size: 16px;
  letter-spacing: 0.12em;
}

.note {
  color: var(--ink-3);
  font-size: 12.5px;
}

.links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 22px;
  color: var(--ink-3);
  font-size: 13.5px;

  a {
    transition: color var(--dur) var(--ease);

    &:hover {
      color: var(--accent);
    }

    @include focus-ring(2px);
  }

  .top {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border: 1px solid var(--line-2);
    border-radius: 999px;
    color: var(--ink-2);
    font-size: 12.5px;
    transition:
      color var(--dur) var(--ease),
      border-color var(--dur) var(--ease),
      background var(--dur) var(--ease);

    span {
      transition: translate var(--dur) var(--ease);
    }

    &:hover {
      border-color: var(--accent);
      background: #fff;
      color: var(--accent);

      span {
        translate: 0 -2px;
      }
    }
  }

  @include mq(sm) {
    gap: 14px 18px;
    font-size: 13px;
  }
}
</style>
