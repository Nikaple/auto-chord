<template>
  <div class="sound-settings">
    <h2>音频设置</h2>
    
    <div class="settings-form">
      <div class="form-group">
        <label for="volume">音量</label>
        <input 
          type="range" 
          id="volume" 
          v-model="localSettings.volume" 
          min="0" 
          max="1" 
          step="0.01"
          @change="updateSettings"
        />
        <span class="value">{{ Math.round(localSettings.volume * 100) }}%</span>
      </div>
      
      <div class="form-group">
        <label for="oscillatorType">音色</label>
        <select 
          id="oscillatorType" 
          v-model="localSettings.oscillatorType"
          @change="updateSettings"
        >
          <option 
            v-for="type in oscillatorTypes" 
            :key="type.value" 
            :value="type.value"
          >
            {{ type.label }}
          </option>
        </select>
      </div>
      
      <div class="adsr-controls">
        <h3>ADSR包络</h3>
        
        <div class="form-group">
          <label for="attack">起音(Attack)</label>
          <input 
            type="range" 
            id="attack" 
            v-model="localSettings.attack" 
            min="0.01" 
            max="1" 
            step="0.01"
            @change="updateSettings"
          />
          <span class="value">{{ localSettings.attack }}s</span>
        </div>
        
        <div class="form-group">
          <label for="decay">衰减(Decay)</label>
          <input 
            type="range" 
            id="decay" 
            v-model="localSettings.decay" 
            min="0.01" 
            max="1" 
            step="0.01"
            @change="updateSettings"
          />
          <span class="value">{{ localSettings.decay }}s</span>
        </div>
        
        <div class="form-group">
          <label for="sustain">延音(Sustain)</label>
          <input 
            type="range" 
            id="sustain" 
            v-model="localSettings.sustain" 
            min="0" 
            max="1" 
            step="0.01"
            @change="updateSettings"
          />
          <span class="value">{{ Math.round(localSettings.sustain * 100) }}%</span>
        </div>
        
        <div class="form-group">
          <label for="release">释放(Release)</label>
          <input 
            type="range" 
            id="release" 
            v-model="localSettings.release" 
            min="0.1" 
            max="5" 
            step="0.1"
            @change="updateSettings"
          />
          <span class="value">{{ localSettings.release }}s</span>
        </div>
      </div>
      
      <button class="reset-btn" @click="resetSettings">重置设置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAudioSettingsStore } from '@/stores/audioSettings'
import { useKeyboardHandler } from '@/composables/useKeyboardHandler'

// 获取状态管理
const audioSettingsStore = useAudioSettingsStore();
const { audioSystem } = useKeyboardHandler();

// 本地设置状态，从store初始化
const localSettings = ref({ ...audioSettingsStore.settings });

// 可用的振荡器类型
const { oscillatorTypes } = audioSettingsStore;

// 更新设置
function updateSettings() {
  // 更新store
  audioSettingsStore.updateSettings(localSettings.value);
  
  // 更新音频系统
  if (audioSystem) {
    audioSystem.applySettings(localSettings.value);
  }
}

// 重置设置
function resetSettings() {
  audioSettingsStore.resetSettings();
  localSettings.value = { ...audioSettingsStore.settings };
  updateSettings();
}

// 监听store设置变化
watch(() => audioSettingsStore.settings, (newSettings) => {
  localSettings.value = { ...newSettings };
}, { deep: true });

// 组件挂载时应用设置
onMounted(() => {
  updateSettings();
});
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
  margin-bottom: 1rem;
  font-size: 1.4rem;
  color: var(--color-dark);
}

h3 {
  font-size: 1.1rem;
  margin: 1rem 0 0.5rem;
  color: var(--color-dark);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

label {
  min-width: 100px;
  font-size: 0.9rem;
}

input[type="range"] {
  flex: 1;
}

select {
  flex: 1;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.value {
  min-width: 50px;
  text-align: right;
  font-family: monospace;
}

.adsr-controls {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.reset-btn {
  background-color: var(--color-dark);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
}

.reset-btn:hover {
  background-color: var(--color-primary);
}
</style> 