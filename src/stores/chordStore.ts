import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { Chord, ChordType } from '@/utils/music'
import AudioSystem from '@/utils/audioSystem'
import * as Tone from 'tone'

// 键盘映射配置
const KEY_TO_CHORD: Record<string, { root: string, type: ChordType }> = {
  // 第二排按键 - C大调基础和弦
  's': { root: 'C', type: ChordType.MAJOR },      // C (I)
  'd': { root: 'D', type: ChordType.MINOR },      // Dm (ii)
  'f': { root: 'E', type: ChordType.MINOR },      // Em (iii)
  'g': { root: 'F', type: ChordType.MAJOR },      // F (IV)
  'h': { root: 'G', type: ChordType.MAJOR },      // G (V)
  'j': { root: 'A', type: ChordType.MINOR },      // Am (vi)
  'k': { root: 'B', type: ChordType.DIMINISHED }, // Bdim (vii°)
  
  // 第一排按键 - 特殊和弦
  'e': { root: 'C#', type: ChordType.DIMINISHED },
  'r': { root: 'D#', type: ChordType.AUGMENTED },
  'y': { root: 'F#', type: ChordType.DIMINISHED },
  'u': { root: 'G#', type: ChordType.DIMINISHED },
  'i': { root: 'A#', type: ChordType.MAJOR },
  
  // 第三排按键 - 七和弦
  'z': { root: 'C', type: ChordType.MAJOR_SEVENTH },
  'x': { root: 'D', type: ChordType.MINOR_SEVENTH },
  'c': { root: 'E', type: ChordType.MINOR_SEVENTH },
  'v': { root: 'F', type: ChordType.MAJOR_SEVENTH },
  'b': { root: 'G', type: ChordType.DOMINANT_SEVENTH },
  'n': { root: 'A', type: ChordType.MINOR_SEVENTH },
  'm': { root: 'B', type: ChordType.HALF_DIMINISHED_SEVENTH }
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
  async function initAudio() {
    if (!isAudioInitialized.value) {
      try {
        await Tone.start()
        isAudioInitialized.value = true
      } catch (error) {
        console.error('Failed to initialize audio:', error)
      }
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
  function applyModifiers(baseChord: { root: string, type: ChordType }): Chord {
    const type = modifiers.value.shift && modifiers.value.ctrl ? ChordType.DOMINANT_SEVENTH :
                modifiers.value.shift && modifiers.value.alt ? ChordType.MAJOR_SEVENTH :
                modifiers.value.ctrl && modifiers.value.alt ? ChordType.MINOR_SEVENTH :
                modifiers.value.shift ? (baseChord.type === ChordType.MAJOR ? ChordType.MINOR : ChordType.MAJOR) :
                modifiers.value.ctrl ? ChordType.SUSPENDED_FOURTH :
                modifiers.value.alt ? ChordType.SUSPENDED_SECOND :
                baseChord.type
    
    return new Chord(baseChord.root, 4, type)
  }
  
  // 播放和弦
  function playChord(chord: Chord) {
    if (!isAudioInitialized.value) return
    audioSystem.playChord(chord)
    currentChord.value = chord
  }
  
  // 停止播放
  function stopChord() {
    audioSystem.stopAll()
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
    handleKeyDown,
    handleKeyUp,
    initAudio,
    applyModifiers
  }
}) 