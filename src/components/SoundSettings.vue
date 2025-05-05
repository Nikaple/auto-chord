<template>
  <div class="sound-settings">
    <h2>音频设置</h2>
    
    <div class="setting-group">
      <h3>音色类型</h3>
      <div class="toggle-container">
        <button 
          :class="{ active: useSampler }" 
          @click="toggleSampler(true)"
          :disabled="!isSamplerAvailable"
        >
          真实钢琴音色
        </button>
        <button 
          :class="{ active: !useSampler }" 
          @click="toggleSampler(false)"
        >
          合成器音色
        </button>
      </div>
      <div v-if="!isSamplerAvailable" class="sampler-loading">
        钢琴音色加载中，请稍候...
      </div>
    </div>
    
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
    
    <div class="setting-group" v-if="!useSampler">
      <h3>音色</h3>
      <div class="select-container">
        <select v-model="oscillatorType" @change="updateSettings">
          <option value="sine">正弦波 (Sine)</option>
          <option value="triangle">三角波 (Triangle)</option>
          <option value="square">方波 (Square)</option>
          <option value="sawtooth">锯齿波 (Sawtooth)</option>
        </select>
      </div>
    </div>
    
    <div class="setting-group" v-if="!useSampler">
      <h3>ADSR包络</h3>
      
      <div class="slider-row">
        <label>起音 (Attack)</label>
        <div class="slider-container">
          <input 
            type="range" 
            min="0.01" 
            max="1" 
            step="0.01" 
            v-model="attack" 
            @input="updateSettings"
          >
          <span>{{ attack }}s</span>
        </div>
      </div>
      
      <div class="slider-row">
        <label>衰减 (Decay)</label>
        <div class="slider-container">
          <input 
            type="range" 
            min="0.01" 
            max="1" 
            step="0.01" 
            v-model="decay" 
            @input="updateSettings"
          >
          <span>{{ decay }}s</span>
        </div>
      </div>
      
      <div class="slider-row">
        <label>延音 (Sustain)</label>
        <div class="slider-container">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            v-model="sustain" 
            @input="updateSettings"
          >
          <span>{{ Math.round(sustain * 100) }}%</span>
        </div>
      </div>
      
      <div class="slider-row">
        <label>释音 (Release)</label>
        <div class="slider-container">
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1" 
            v-model="release" 
            @input="updateSettings"
          >
          <span>{{ release }}s</span>
        </div>
      </div>
    </div>
    
    <div class="preset-buttons">
      <button @click="applyPreset('default')">默认设置</button>
      <button @click="applyPreset('soft')" v-if="!useSampler">柔和</button>
      <button @click="applyPreset('bright')" v-if="!useSampler">明亮</button>
      <button @click="applyPreset('organ')" v-if="!useSampler">风琴</button>
      <button @click="applyPreset('pluck')" v-if="!useSampler">拨弦</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useKeyboardHandler } from '@/composables/useKeyboardHandler'

const { audioSystem } = useKeyboardHandler();

// 音频参数
const volume = ref(0.7);
const attack = ref(0.05);
const decay = ref(0.3);
const sustain = ref(0.8);
const release = ref(2);
const oscillatorType = ref('triangle');

// 采样器设置
const useSampler = ref(true);
const isSamplerAvailable = ref(false);

// 监听采样器加载状态
const checkSamplerStatus = () => {
  isSamplerAvailable.value = audioSystem.isSamplerLoaded();
  if (!isSamplerAvailable.value) {
    // 如果采样器未加载，先使用合成器
    useSampler.value = false;
    // 每秒检查一次，直到加载完成
    setTimeout(checkSamplerStatus, 1000);
  }
};

// 切换音色类型
const toggleSampler = (use: boolean) => {
  useSampler.value = use;
  updateSettings();
};

// 获取当前设置
onMounted(() => {
  const settings = audioSystem.getSettings();
  volume.value = settings.volume;
  attack.value = settings.attack;
  decay.value = settings.decay;
  sustain.value = settings.sustain;
  release.value = settings.release;
  oscillatorType.value = settings.oscillatorType;
  
  // 检查采样器状态
  checkSamplerStatus();
});

// 更新设置
const updateSettings = () => {
  audioSystem.applySettings({
    volume: volume.value,
    attack: attack.value,
    decay: decay.value,
    sustain: sustain.value,
    release: release.value,
    oscillatorType: oscillatorType.value,
    useSampler: useSampler.value && isSamplerAvailable.value
  });
};

// 预设
const applyPreset = (preset: string) => {
  switch (preset) {
    case 'default':
      volume.value = 0.7;
      attack.value = 0.05;
      decay.value = 0.3;
      sustain.value = 0.8;
      release.value = 2;
      oscillatorType.value = 'triangle';
      break;
    case 'soft':
      attack.value = 0.1;
      decay.value = 0.4;
      sustain.value = 0.6;
      release.value = 3;
      oscillatorType.value = 'sine';
      break;
    case 'bright':
      attack.value = 0.02;
      decay.value = 0.1;
      sustain.value = 0.9;
      release.value = 1;
      oscillatorType.value = 'sawtooth';
      break;
    case 'organ':
      attack.value = 0.01;
      decay.value = 0.1;
      sustain.value = 1;
      release.value = 0.5;
      oscillatorType.value = 'square';
      break;
    case 'pluck':
      attack.value = 0.01;
      decay.value = 0.5;
      sustain.value = 0.3;
      release.value = 0.5;
      oscillatorType.value = 'triangle';
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
  width: 50px;
  text-align: right;
  color: #666;
}

.slider-row {
  margin-bottom: 0.8rem;
}

.slider-row label {
  display: block;
  margin-bottom: 0.3rem;
  color: #666;
  font-size: 0.9rem;
}

.select-container {
  width: 100%;
}

.select-container select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  font-size: 0.9rem;
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

.toggle-container {
  display: flex;
  gap: 0.5rem;
}

.toggle-container button {
  flex: 1;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-container button.active {
  background-color: var(--color-primary, #4a6072);
  color: white;
  border-color: var(--color-primary, #4a6072);
}

.toggle-container button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sampler-loading {
  font-size: 0.9rem;
  color: #999;
  margin-top: 0.5rem;
  font-style: italic;
}
</style> 