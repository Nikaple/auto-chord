import { defineStore } from 'pinia'
import { ref } from 'vue'

interface AudioSettings {
  volume: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  oscillatorType: string;
}

export const useAudioSettingsStore = defineStore('audioSettings', () => {
  // 默认音频设置
  const defaultSettings: AudioSettings = {
    volume: 0.7,
    attack: 0.05,
    decay: 0.1,
    sustain: 0.3,
    release: 1,
    oscillatorType: 'triangle'
  };
  
  // 当前音频设置
  const settings = ref<AudioSettings>({ ...defaultSettings });
  
  // 可用的振荡器类型
  const oscillatorTypes = [
    { value: 'sine', label: '正弦波' },
    { value: 'square', label: '方波' },
    { value: 'triangle', label: '三角波' },
    { value: 'sawtooth', label: '锯齿波' }
  ];
  
  // 更新设置
  function updateSettings(newSettings: Partial<AudioSettings>) {
    settings.value = { ...settings.value, ...newSettings };
  }
  
  // 重置为默认设置
  function resetSettings() {
    settings.value = { ...defaultSettings };
  }
  
  return {
    settings,
    oscillatorTypes,
    updateSettings,
    resetSettings
  };
}); 