import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAudioSettingsStore } from '../../../src/stores/audioSettings'

describe('Audio设置状态管理', () => {
  beforeEach(() => {
    // 创建一个新的pinia实例并将其设置为活动pinia
    setActivePinia(createPinia())
  })

  it('初始化时应该使用默认设置', () => {
    const store = useAudioSettingsStore()
    expect(store.settings).toEqual({
      volume: 0.7,
      attack: 0.05,
      decay: 0.1,
      sustain: 0.3,
      release: 1,
      oscillatorType: 'triangle'
    })
  })

  it('updateSettings方法应该正确更新部分设置', () => {
    const store = useAudioSettingsStore()
    
    // 更新部分设置
    store.updateSettings({
      volume: 0.5,
      decay: 0.2
    })
    
    // 检查是否正确更新了指定的设置
    expect(store.settings.volume).toBe(0.5)
    expect(store.settings.decay).toBe(0.2)
    
    // 确保其他设置保持不变
    expect(store.settings.attack).toBe(0.05)
    expect(store.settings.sustain).toBe(0.3)
    expect(store.settings.release).toBe(1)
    expect(store.settings.oscillatorType).toBe('triangle')
  })

  it('resetSettings方法应该将所有设置恢复为默认值', () => {
    const store = useAudioSettingsStore()
    
    // 首先修改设置
    store.updateSettings({
      volume: 0.1,
      attack: 0.2,
      decay: 0.3,
      sustain: 0.4,
      release: 0.5,
      oscillatorType: 'sine'
    })
    
    // 确认设置已被修改
    expect(store.settings).not.toEqual({
      volume: 0.7,
      attack: 0.05,
      decay: 0.1,
      sustain: 0.3,
      release: 1,
      oscillatorType: 'triangle'
    })
    
    // 重置设置
    store.resetSettings()
    
    // 确认设置已恢复为默认
    expect(store.settings).toEqual({
      volume: 0.7,
      attack: 0.05,
      decay: 0.1,
      sustain: 0.3,
      release: 1,
      oscillatorType: 'triangle'
    })
  })

  it('oscillatorTypes应该包含正确的振荡器选项', () => {
    const store = useAudioSettingsStore()
    expect(store.oscillatorTypes).toEqual([
      { value: 'sine', label: '正弦波' },
      { value: 'square', label: '方波' },
      { value: 'triangle', label: '三角波' },
      { value: 'sawtooth', label: '锯齿波' }
    ])
  })
}) 