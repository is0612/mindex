<script setup lang="ts">
import { useSlots } from 'vue'
import SectionHead from '@/components/SectionHead.vue'

const slots = useSlots()
</script>

<template>
  <section id="poetry" class="section">
    <div class="container">
      <SectionHead
        v-reveal
        eyebrow="POETRY"
        title="个人诗词"
        desc="平仄之间，记一点心绪。点开读全文，键盘左右键也能翻。"
      />

      <!--
        ⬇︎ 诗词模块接入位 ⬇︎
        两种接法，选一种：
        1) 在 App.vue 里写成 <PoetrySlot><PoetryList /></PoetrySlot>，
           外部内容会替换掉下面的占位装饰；
        2) 直接把已有页面的内容粘贴到这个 div 里面，删掉 .placeholder 部分。
      -->
      <div class="module-slot" :class="{ 'is-live': !!slots.default }" v-reveal="60">
        <slot>
          <div class="placeholder">
            <div class="verse" aria-hidden="true">
              <span>落花人独立</span>
              <span>微雨燕双飞</span>
            </div>

            <p class="slot-title">诗词模块待接入</p>
            <p class="slot-desc">
              这一块的间距、宽度和字体已经按诗词排版调好，<br />
              把已有的诗词列表放进来即可，样式会自然接上。
            </p>
          </div>
        </slot>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 有内容进来时，去掉虚线框和「接入位」角标 */
.module-slot.is-live {
  border: 0;
  background: none;
  padding: 0;
  text-align: left;
  overflow: visible;
}

.module-slot.is-live::after {
  content: none;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 220px;
  justify-content: center;
}

.verse {
  writing-mode: vertical-rl;
  display: flex;
  gap: 14px;
  font-family: var(--font-serif);
  font-size: 19px;
  letter-spacing: 0.42em;
  line-height: 1;
  color: var(--ink-2);
  opacity: 0.42;
  margin-bottom: 26px;
}

@media (max-width: 720px) {
  .verse {
    font-size: 16px;
    gap: 10px;
    letter-spacing: 0.3em;
  }
}
</style>
