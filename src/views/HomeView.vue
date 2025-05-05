<template>
  <div class="container">
    <h1>自动和弦</h1>
    <p class="subtitle">使用键盘演奏和弦，探索音乐的世界</p>
    
    <div class="main-layout">
      <div class="left-section">
        <div class="piano-container">
          <Keyboard />
        </div>
      </div>
      
      <div class="right-section">
        <ChordDisplay class="panel" />
        <SoundSettings class="panel" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Keyboard from '@/components/Keyboard.vue'
import ChordDisplay from '@/components/ChordDisplay.vue'
import SoundSettings from '@/components/SoundSettings.vue'
</script>

<style scoped>
.subtitle {
  font-size: 1.2rem;
  color: var(--color-dark);
  margin-bottom: 2rem;
}

.main-layout {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  margin-top: 2rem;
}

.left-section {
  flex: 1;
  min-width: 0;
}

.right-section {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.piano-container {
  width: 100%;
}

.panel {
  width: 100%;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .main-layout {
    flex-direction: column;
  }
  
  .right-section {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .panel {
    flex: 1;
    min-width: 320px;
  }
}
</style> 