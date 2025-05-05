import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { Chord, ChordType, ALL_NOTES, getChordByDegree } from '@/utils/music'
import AudioSystem from '@/utils/audioSystem'

// 键盘映射到级数（而不是固定的和弦）
const KEY_TO_DEGREE: Record<string, { degree: number, octave: number, forceType?: ChordType }> = {
  // 第二排按键 - 白键基础和弦（I ii iii IV V vi vii°）
  's': { degree: 1, octave: 3 },      // I  (C in C major)
  'd': { degree: 2, octave: 3 },      // ii (D in C major)
  'f': { degree: 3, octave: 3 },      // iii(E in C major)
  'g': { degree: 4, octave: 3 },      // IV (F in C major)
  'h': { degree: 5, octave: 3 },      // V  (G in C major)
  'j': { degree: 6, octave: 3 },      // vi (A in C major)
  'k': { degree: 7, octave: 3 },      // vii°(B in C major)
  'l': { degree: 1, octave: 4 },      // I  (C in C major, 高八度)
  
  // 黑键 - 变化和弦
  'e': { degree: 1.5, octave: 3, forceType: ChordType.DIMINISHED },     // ♯I/♭II (C♯dim)
  'r': { degree: 2.5, octave: 3, forceType: ChordType.AUGMENTED },      // ♯II/♭III (D♯aug)
  'y': { degree: 4.5, octave: 3, forceType: ChordType.DIMINISHED },     // ♯IV/♭V (F♯dim)
  'u': { degree: 5.5, octave: 3, forceType: ChordType.DIMINISHED },     // ♯V/♭VI (G♯dim)
  'i': { degree: 6.5, octave: 3, forceType: ChordType.MAJOR },          // ♯VI/♭VII (A♯maj)
  
  // 第一排按键 - 七和弦
  'z': { degree: 1, octave: 3, forceType: ChordType.MAJOR_SEVENTH },      // IM7
  'x': { degree: 2, octave: 3, forceType: ChordType.MINOR_SEVENTH },      // iim7
  'c': { degree: 3, octave: 3, forceType: ChordType.MINOR_SEVENTH },      // iiim7
  'v': { degree: 4, octave: 3, forceType: ChordType.MAJOR_SEVENTH },      // IVM7
  'b': { degree: 5, octave: 3, forceType: ChordType.DOMINANT_SEVENTH },   // V7
  'n': { degree: 6, octave: 3, forceType: ChordType.MINOR_SEVENTH },      // vim7
  'm': { degree: 7, octave: 3, forceType: ChordType.HALF_DIMINISHED_SEVENTH }, // viiø7
  ',': { degree: 1, octave: 4, forceType: ChordType.MAJOR_SEVENTH },      // IM7（高八度）
}

export const useChordStore = defineStore('chord', () => {
  const currentChord = ref<Chord | null>(null)
  const currentKey = ref('C') // 当前调性，默认为C调
  const modifiers = ref({
    shift: false,
    ctrl: false,
    alt: false
  })
  const audioSystem = new AudioSystem()
  const pressedKeys = reactive(new Set<string>())
  const isAudioInitialized = ref(false)
  
  // 计算当前调性下的和弦映射
  const KEY_TO_CHORD = computed(() => {
    const mapping: Record<string, { root: string, type: ChordType, octave?: number }> = {};
    
    // 获取当前调性在音阶中的位置（0-11）
    const currentKeyIndex = ALL_NOTES.indexOf(currentKey.value);
    
    // 处理每个键位映射
    for (const [key, config] of Object.entries(KEY_TO_DEGREE)) {
      const chord = getChordByDegree(currentKey.value, config.degree, config.octave, config.forceType);
      
      // 获取和弦根音在音阶中的位置
      const chordRootIndex = ALL_NOTES.indexOf(chord.root);
      
      // 计算八度调整
      let adjustedOctave = config.octave;
      
      // 对于基础和弦（白键区域和七和弦区域）进行特殊处理
      if ('sdfghjkl'.includes(key) || 'zxcvbnm,'.includes(key)) {
        // G调到B调的情况（音高索引7-11）
        if (currentKeyIndex >= 7 && currentKeyIndex <= 11) {
          // 对于基础和弦区域，基础八度降低1
          adjustedOctave = config.octave - 1;
          // 如果和弦根音的音高低于当前调的主音，则升高八度
          if (chordRootIndex < currentKeyIndex) {
            adjustedOctave = config.octave;
          }
        } else {
          // C调到F#调的情况保持不变
          if (chordRootIndex < currentKeyIndex) {
            adjustedOctave = config.octave + 1;
          }
        }
      }

      mapping[key] = { 
        ...chord, 
        octave: adjustedOctave 
      };
    }
    
    return mapping;
  })

  // 转调函数
  function transpose(newKey: string) {
    if (ALL_NOTES.includes(newKey)) {
      currentKey.value = newKey;
      // 如果有正在播放的和弦，更新它
      if (currentChord.value) {
        const pressedKey = Array.from(pressedKeys)[0];
        if (pressedKey && KEY_TO_DEGREE[pressedKey]) {
          const degree = KEY_TO_DEGREE[pressedKey].degree;
          const octave = KEY_TO_DEGREE[pressedKey].octave;
          const newChord = getChordByDegree(currentKey.value, degree, octave);
          playChord(new Chord(newChord.root, octave, newChord.type));
        }
      }
    }
  }

  // 升调
  function transposeUp() {
    const currentIndex = ALL_NOTES.indexOf(currentKey.value);
    const newKey = ALL_NOTES[(currentIndex + 1) % 12];
    transpose(newKey);
  }

  // 降调
  function transposeDown() {
    const currentIndex = ALL_NOTES.indexOf(currentKey.value);
    const newKey = ALL_NOTES[(currentIndex - 1 + 12) % 12];
    transpose(newKey);
  }

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
    const chordConfig = KEY_TO_CHORD.value[key]
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
    if (KEY_TO_DEGREE[key]) {
      // 检查是否还有其他和弦键被按下
      const remainingChordKeys = Array.from(pressedKeys).filter(k => KEY_TO_DEGREE[k])
      
      if (remainingChordKeys.length > 0) {
        // 播放最后一个按下的和弦
        const lastKey = remainingChordKeys[remainingChordKeys.length - 1]
        const degreeConfig = KEY_TO_DEGREE[lastKey]
        const chordConfig = getChordByDegree(currentKey.value, degreeConfig.degree, degreeConfig.octave)
        const chord = applyModifiers({ ...chordConfig, octave: degreeConfig.octave })
        playChord(chord)
      } else {
        // 没有其他和弦键被按下，停止播放
        stopChord()
      }
    }
  }
  
  return {
    currentChord,
    currentKey,
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
    applyModifiers,
    transpose,
    transposeUp,
    transposeDown
  }
}) 