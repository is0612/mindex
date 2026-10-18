<script setup lang="ts">
import { useSlots } from 'vue'
import SectionHead from '@/components/SectionHead.vue'

const slots = useSlots()
</script>

<template>
  <section id="ai" class="section">
    <div class="container">
      <SectionHead
        v-reveal
        eyebrow="AI COACH"
        title="AI 陪练"
        desc="练口语、练面试、练那几句总说不出口的话 —— 聊完，它会逐句告诉你本来该怎么说。"
      />

      <!--
        ⬇︎ AI 陪练模块接入位 ⬇︎
        两种接法，选一种：
        1) 在 App.vue 里写成 <AiCoachSlot><CoachPanel /></AiCoachSlot>；
        2) 直接把对话界面粘贴到这个 div 里，删掉 .placeholder 部分。
        注意：如果陪练组件需要固定高度，在这里给 .module-slot 加 min-height 即可。
      -->
      <div class="module-slot" :class="{ 'is-live': !!slots.default }" v-reveal="60">
        <slot>
          <div class="placeholder">
            <div class="chat-sketch" aria-hidden="true">
              <span class="bubble left"></span>
              <span class="bubble right"></span>
              <span class="typing"><i></i><i></i><i></i></span>
            </div>

            <p class="slot-title">AI 陪练模块待接入</p>
            <p class="slot-desc">
              对话区域已经留白，建议放进一个高度 420–520px 的面板，<br />
              与相册的卡片圆角、间距保持一致即可。
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

.chat-sketch {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(100%, 320px);
  margin-bottom: 28px;
  opacity: 0.5;
}

.bubble {
  height: 26px;
  border-radius: 13px;
  border: 1px dashed var(--line-2);
  background: rgba(255, 255, 255, 0.55);
}

.bubble.left {
  width: 62%;
  border-bottom-left-radius: 4px;
}

.bubble.right {
  width: 46%;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
  background: var(--accent-wash);
  border-color: rgba(47, 93, 80, 0.22);
}

.typing {
  display: inline-flex;
  gap: 5px;
  align-self: flex-start;
  padding: 9px 14px;
  border-radius: 13px;
  border-bottom-left-radius: 4px;
  border: 1px dashed var(--line-2);
}

.typing i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ink-3);
  animation: blink 1.4s var(--ease) infinite;
}

.typing i:nth-child(2) {
  animation-delay: 0.2s;
}

.typing i:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  60%,
  100% {
    opacity: 0.25;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .typing i {
    animation: none;
    opacity: 0.5;
  }
}
</style>
