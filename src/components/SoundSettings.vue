<template>
  <div class="sound-settings">
    <h2>钢琴音色设置</h2>
    
    <div v-if="!samplerLoaded" class="sampler-loading">
      钢琴音色加载中，请稍候...
    </div>
    
    <div v-else>
      <div class="setting-group">
        <h3>主音量</h3>
        <div class="slider-container">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            v-model="volume" 
            @input="updateSettings"
          >
          <span>{{ Math.round(volume * 100) }}%</span>
        </div>
      </div>
      
      <div class="setting-group">
        <h3>混响</h3>
        <div class="slider-container">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            v-model="reverb" 
            @input="updateSettings"
          >
          <span>{{ Math.round(reverb * 100) }}%</span>
        </div>
      </div>
      
      <div class="setting-group">
        <h3>释放时间</h3>
        <div class="slider-container">
          <input 
            type="range" 
            min="0.5" 
            max="4" 
            step="0.1" 
            v-model="release" 
            @input="updateSettings"
          >
          <span>{{ release }}秒</span>
        </div>
      </div>
      
      <div class="setting-group">
        <h3>亮度</h3>
        <div class="slider-container">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            v-model="brightness" 
            @input="updateSettings"
          >
          <span>{{ brightness < 0.5 ? '暗' : brightness > 0.5 ? '亮' : '中性' }}</span>
        </div>
      </div>
      
      <div class="setting-group">
        <h3>力度</h3>
        <div class="slider-container">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            v-model="dynamics" 
            @input="updateSettings"
          >
          <span>{{ dynamics < 0.33 ? '柔和' : dynamics > 0.66 ? '强烈' : '中等' }}</span>
        </div>
      </div>
      
      <div class="preset-buttons">
        <button @click="applyPreset('default')">默认</button>
        <button @click="applyPreset('soft')">柔和</button>
        <button @click="applyPreset('bright')">明亮</button>
        <button @click="applyPreset('concert')">音乐厅</button>
        <button @click="applyPreset('intimate')">私密</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useKeyboardHandler } from '@/composables/useKeyboardHandler';

const { audioSystem } = useKeyboardHandler();

// 钢琴音色参数
const volume = ref(0.7);
const release = ref(1.5);
const reverb = ref(0.3);
const brightness = ref(0.5);
const dynamics = ref(0.7);

// 采样器状态
const samplerLoaded = ref(false);

// 监听采样器加载状态
const checkSamplerStatus = () => {
  samplerLoaded.value = audioSystem.isSamplerLoaded();
  if (!samplerLoaded.value) {
    // 每秒检查一次，直到加载完成
    setTimeout(checkSamplerStatus, 1000);
  }
};

// 获取当前设置
onMounted(() => {
  const settings = audioSystem.getSettings();
  volume.value = settings.volume;
  release.value = settings.release;
  reverb.value = settings.reverb;
  brightness.value = settings.brightness;
  dynamics.value = settings.dynamics;
  
  // 检查采样器状态
  checkSamplerStatus();
});

// 更新设置
const updateSettings = () => {
  audioSystem.applySettings({
    volume: volume.value,
    release: release.value,
    reverb: reverb.value,
    brightness: brightness.value,
    dynamics: dynamics.value
  });
};

// 预设
const applyPreset = (preset: string) => {
  switch (preset) {
    case 'default':
      volume.value = 0.7;
      release.value = 1.5;
      reverb.value = 0.3;
      brightness.value = 0.5;
      dynamics.value = 0.7;
      break;
    case 'soft':
      volume.value = 0.6;
      release.value = 2.5;
      reverb.value = 0.4;
      brightness.value = 0.3;
      dynamics.value = 0.3;
      break;
    case 'bright':
      volume.value = 0.75;
      release.value = 1.2;
      reverb.value = 0.2;
      brightness.value = 0.8;
      dynamics.value = 0.8;
      break;
    case 'concert':
      volume.value = 0.8;
      release.value = 2.0;
      reverb.value = 0.7;
      brightness.value = 0.6;
      dynamics.value = 0.65;
      break;
    case 'intimate':
      volume.value = 0.65;
      release.value = 1.8;
      reverb.value = 0.1;
      brightness.value = 0.4;
      dynamics.value = 0.5;
      break;
  }
  updateSettings();
};
</script>

<style scoped>
.sound-settings {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  color: var(--color-dark);
}

h3 {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: #444;
}

.setting-group {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.setting-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider-container input {
  flex: 1;
}

.slider-container span {
  width: 60px;
  text-align: right;
  color: #666;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.preset-buttons button {
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.preset-buttons button:hover {
  background-color: #eee;
}

.sampler-loading {
  font-size: 0.9rem;
  color: #999;
  padding: 2rem;
  text-align: center;
  font-style: italic;
}
</style> 