import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { Chord, ChordType } from '@/utils/music'
import AudioSystem from '@/utils/audioSystem'
import * as Tone from 'tone'

// 键盘映射配置
const KEY_TO_CHORD: Record<string, { root: string, type: ChordType, octave?: number }> = {
  // 第二排按键 - 白键基础和弦（FGABCDE）
  's': { root: 'F', type: ChordType.MAJOR, octave: 3 },      // F3
  'd': { root: 'G', type: ChordType.MAJOR, octave: 3 },      // G3
  'f': { root: 'A', type: ChordType.MINOR, octave: 3 },      // A3
  'g': { root: 'B', type: ChordType.DIMINISHED, octave: 3 }, // B3
  'h': { root: 'C', type: ChordType.MAJOR, octave: 4 },      // C4 (中央C)
  'j': { root: 'D', type: ChordType.MINOR, octave: 4 },      // D4
  'k': { root: 'E', type: ChordType.MINOR, octave: 4 },      // E4
  
  // 第一排按键 - 黑键和弦
  'e': { root: 'F♯', type: ChordType.DIMINISHED, octave: 3 },
  'r': { root: 'G♯', type: ChordType.DIMINISHED, octave: 3 },
  'y': { root: 'A♯', type: ChordType.MAJOR, octave: 3 },
  'u': { root: 'C♯', type: ChordType.DIMINISHED, octave: 4 },
  'i': { root: 'D♯', type: ChordType.AUGMENTED, octave: 4 },
  
  // 第三排按键 - 七和弦
  'z': { root: 'F', type: ChordType.MAJOR_SEVENTH, octave: 3 },
  'x': { root: 'G', type: ChordType.DOMINANT_SEVENTH, octave: 3 },
  'c': { root: 'A', type: ChordType.MINOR_SEVENTH, octave: 3 },
  'v': { root: 'B', type: ChordType.HALF_DIMINISHED_SEVENTH, octave: 3 },
  'b': { root: 'C', type: ChordType.MAJOR_SEVENTH, octave: 4 },
  'n': { root: 'D', type: ChordType.MINOR_SEVENTH, octave: 4 },
  'm': { root: 'E', type: ChordType.MINOR_SEVENTH, octave: 4 }
}

export const useChordStore = defineStore('chord', () => {
  const currentChord = ref<Chord | null>(null)
  const modifiers = ref({
    shift: false,
    ctrl: false,
    alt: false
  })
  const audioSystem = new AudioSystem()
  const pressedKeys = reactive(new Set<string>())
  const isAudioInitialized = ref(false)
  
  // 初始化音频系统
  async function initAudio(): Promise<boolean> {
    if (isAudioInitialized.value) {
      return audioSystem.isSamplerLoaded();
    }

    try {
      const success = await audioSystem.init();
      if (success && audioSystem.isSamplerLoaded()) {
        isAudioInitialized.value = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }
  
  // 更新当前和弦
  function setCurrentChord(chord: Chord | null) {
    currentChord.value = chord
  }
  
  // 更新修饰键状态
  function setModifiers(newModifiers: { shift: boolean; ctrl: boolean; alt: boolean }) {
    modifiers.value = newModifiers
  }
  
  // 应用修饰符到和弦
  function applyModifiers(baseChord: { root: string, type: ChordType, octave?: number }): Chord {
    let type = baseChord.type;
    
    // 组合修饰键处理 - 优先级最高
    if (modifiers.value.shift && modifiers.value.ctrl && modifiers.value.alt) {
      // 三个修饰键同时按下 - 减和弦
      type = ChordType.DIMINISHED;
    } else if (modifiers.value.shift && modifiers.value.ctrl) {
      // 属七和弦
      type = ChordType.DOMINANT_SEVENTH;
    } else if (modifiers.value.shift && modifiers.value.alt) {
      // 大七和弦
      type = ChordType.MAJOR_SEVENTH;
    } else if (modifiers.value.ctrl && modifiers.value.alt) {
      // 小七和弦
      type = ChordType.MINOR_SEVENTH;
    }
    // 单个修饰键处理 - 优先级较低
    else if (modifiers.value.shift) {
      // Shift键特殊处理：切换大小和弦类型
      if (baseChord.type === ChordType.MAJOR) {
        type = ChordType.MINOR;
      } else if (baseChord.type === ChordType.MINOR) {
        type = ChordType.MAJOR;
      }
      // 其他类型的和弦保持不变
    } else if (modifiers.value.ctrl) {
      // sus4和弦
      type = ChordType.SUSPENDED_FOURTH;
    } else if (modifiers.value.alt) {
      // sus2和弦
      type = ChordType.SUSPENDED_SECOND;
    }
    
    return new Chord(baseChord.root, baseChord.octave || 4, type);
  }
  
  // 播放和弦
  function playChord(chord: Chord) {
    if (!isAudioInitialized.value) {
      console.warn('Audio system not initialized');
      return;
    }
    if (!audioSystem.isSamplerLoaded()) {
      console.warn('Audio system not ready');
      // 尝试重新初始化
      initAudio().then(success => {
        if (success) {
          audioSystem.playChord(chord);
          currentChord.value = chord;
        }
      });
      return;
    }
    audioSystem.playChord(chord);
    currentChord.value = chord;
  }
  
  // 停止播放
  function stopChord() {
    audioSystem.stopAll()
    // 不再清除当前和弦信息
    // currentChord.value = null
  }
  
  // 清除当前和弦（仅在需要时调用）
  function clearChord() {
    currentChord.value = null
  }
  
  // 处理键盘按下事件
  function handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    
    // 更新修饰键状态
    setModifiers({
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey
    })
    
    // 防止重复触发
    if (pressedKeys.has(key)) return
    
    // 记录按下的键
    pressedKeys.add(key)
    
    // 获取和弦配置
    const chordConfig = KEY_TO_CHORD[key]
    if (!chordConfig) return
    
    // 应用修饰符并播放和弦
    const chord = applyModifiers(chordConfig)
    playChord(chord)
  }
  
  // 处理键盘松开事件
  function handleKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    
    // 更新修饰键状态
    setModifiers({
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey
    })
    
    // 从按下的键集合中移除
    pressedKeys.delete(key)
    
    // 如果是和弦键
    if (KEY_TO_CHORD[key]) {
      // 检查是否还有其他和弦键被按下
      const remainingChordKeys = Array.from(pressedKeys).filter(k => KEY_TO_CHORD[k])
      
      if (remainingChordKeys.length > 0) {
        // 播放最后一个按下的和弦
        const lastKey = remainingChordKeys[remainingChordKeys.length - 1]
        const chord = applyModifiers(KEY_TO_CHORD[lastKey])
        playChord(chord)
      } else {
        // 没有其他和弦键被按下，停止播放
        stopChord()
      }
    }
  }
  
  return {
    currentChord,
    modifiers,
    pressedKeys,
    isAudioInitialized,
    KEY_TO_CHORD,
    audioSystem,
    setCurrentChord,
    setModifiers,
    playChord,
    stopChord,
    clearChord,
    handleKeyDown,
    handleKeyUp,
    initAudio,
    applyModifiers
  }
}) 