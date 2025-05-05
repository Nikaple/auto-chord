<!-- 音频初始化组件 -->
<template>
  <Transition name="fade">
    <div v-if="!isInitialized" class="audio-initializer" @click="initializeAudio">
      <div class="content" :class="{ 'is-loading': isLoading }">
        <div v-if="!isLoading" class="start-prompt">
          <div class="piano-icon">🎹</div>
          <h2>开始您的音乐之旅</h2>
          <p>点击任意位置开始加载音源</p>
        </div>
        <div v-else class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在加载音源...</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChordStore } from '@/stores/chordStore'

const chordStore = useChordStore()
const isLoading = ref(false)
const isInitialized = ref(false)

const initializeAudio = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    const success = await chordStore.initAudio()
    if (success) {
      isInitialized.value = true
    }
  } catch (error) {
    console.error('Failed to initialize audio:', error)
  }
  
  isLoading.value = false
}
</script>

<style scoped>
.audio-initializer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.content {
  text-align: center;
  padding: 2rem;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.content:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.piano-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

.start-prompt h2 {
  margin: 0 0 1rem;
  color: #333;
  font-size: 1.5rem;
}

.start-prompt p {
  color: #666;
  margin: 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state p {
  color: #666;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 