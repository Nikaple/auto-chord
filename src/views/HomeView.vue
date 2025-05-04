<template>
  <div class="container">
    <h1>自动和弦</h1>
    <p class="subtitle">使用键盘演奏和弦，探索音乐的世界</p>
    
    <div class="piano-container">
      <Keyboard />
    </div>
    
    <div class="controls">
      <ChordDisplay />
      <SoundSettings />
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

.piano-container {
  width: 100%;
  margin: 2rem 0;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 2rem;
}
</style> 