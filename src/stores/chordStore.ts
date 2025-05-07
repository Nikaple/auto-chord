import { defineStore } from 'pinia'
import { ref, reactive, computed, markRaw, Raw } from 'vue'
import { Chord, ChordType, ALL_NOTES, getChordByDegree } from '@/utils/music'
import AudioSystem from '@/utils/audioSystem'

// 键盘映射到级数（而不是固定的和弦）
export const KEY_TO_DEGREE: Record<string, { degree: number, octave: number, forceType?: ChordType }> = {
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
  'e': { degree: 1.5, octave: 3, forceType: ChordType.DIMINISHED },     // #I/bII (C#dim)
  'r': { degree: 2.5, octave: 3, forceType: ChordType.AUGMENTED },      // #II/bIII (D#aug)
  'y': { degree: 4.5, octave: 3, forceType: ChordType.DIMINISHED },     // #IV/bV (F#dim)
  'u': { degree: 5.5, octave: 3, forceType: ChordType.DIMINISHED },     // #V/bVI (G#dim)
  'i': { degree: 6.5, octave: 3, forceType: ChordType.MAJOR },          // #VI/bVII (A#maj)
  
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
  const currentChord = ref<Raw<Chord> | null>(null)
  const currentKey = ref('C') // 当前调性，默认为C调
  const audioSystem = new AudioSystem()
  const pressedKeys = reactive(new Set<string>())
  const isAudioInitialized = ref(false)
  const activeChordType = ref<ChordType | null>(null)
  const currentInversion = ref<number>(0)  // 添加当前转位状态
  
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
      const initSuccess = await audioSystem.init();
      if (!initSuccess) {
        console.error('Failed to initialize audio system');
        return false;
      }
      
      // 等待采样器完全加载
      const loadSuccess = await audioSystem.waitForSamplerLoad();
      
      if (loadSuccess && audioSystem.isSamplerLoaded()) {
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
    currentChord.value = chord ? markRaw(chord) : null
  }
  
  // 更新和弦类型切换逻辑
  function applyModifiers(baseChord: { root: string, type: ChordType, octave?: number }): Chord {
    let type = baseChord.type;
    
    // 如果有激活的和弦类型，优先使用它
    if (activeChordType.value !== null) {
      type = activeChordType.value;
    }
    
    const chord = new Chord(baseChord.root, baseChord.octave || 4, type);
    // 应用当前的转位设置
    chord.setInversion(currentInversion.value);
    return chord;
  }
  
  // 播放和弦
  function playChord(chord: Chord) {
    if (!isAudioInitialized.value) {
      console.warn('Audio system not initialized');
      return;
    }
    
    if (!audioSystem.isSamplerLoaded()) {
      console.warn('Audio system not ready');
      // 不再尝试重新初始化，因为这可能导致竞态条件
      // 只有在音频系统完全加载后才能播放和弦
      return;
    }
    
    try {
      audioSystem.playChord(chord);
      currentChord.value = markRaw(chord);
    } catch (error) {
      console.error('Failed to play chord:', error);
      // 如果出现错误，尝试重新初始化
      isAudioInitialized.value = false;
    }
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
  
  // 处理和弦转位
  function handleInversion(isShiftKey: boolean = false) {
    if (isShiftKey) {
      // Shift+Q：重置为原位
      currentInversion.value = 0;
    } else {
      // Q：循环切换转位
      currentInversion.value = (currentInversion.value + 1) % 4;
    }
  }
  
  // 处理键盘按下事件
  function handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    
    // 处理 Q 键的转位功能
    if (key === 'q') {
      handleInversion(event.shiftKey);
      return;
    }
    
    // 处理数字键 - 使用event.code来判断是否是数字键
    if (event.code.startsWith('Digit')) {
      const digit = event.code.slice(5); // 获取数字部分
      handleNumberKey(digit, event.shiftKey);
      return;
    }
    
    // 防止重复触发
    if (pressedKeys.has(key)) return
    
    // 记录按下的键
    pressedKeys.add(key)
    
    // 获取和弦配置
    const chordConfig = KEY_TO_CHORD.value[key]
    if (!chordConfig) return
    
    // 应用修饰符并播放和弦
    const chord = applyModifiers(chordConfig)
    if (currentChord.value && currentChord.value.inversion > 0) {
      // 如果当前有转位设置，应用到新和弦
      chord.setInversion(currentChord.value.inversion);
    }
    playChord(chord)
  }
  
  // 处理键盘松开事件
  function handleKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    
    // 如果是数字键，不做任何处理
    if (/^[1-9]$/.test(key)) {
      return
    }
    
    // 从按下的键集合中移除
    pressedKeys.delete(key)
    
    // 如果是和弦键
    if (KEY_TO_CHORD.value[key]) {
      // 检查是否还有其他和弦键被按下
      const remainingChordKeys = Array.from(pressedKeys).filter(k => KEY_TO_CHORD.value[k])
      
      if (remainingChordKeys.length > 0) {
        // 播放最后一个按下的和弦
        const lastKey = remainingChordKeys[remainingChordKeys.length - 1]
        const chordConfig = KEY_TO_CHORD.value[lastKey]
        const chord = applyModifiers(chordConfig)
        playChord(chord)
      } else {
        // 没有其他和弦键被按下，停止播放
        stopChord()
      }
    }
  }
  
  // 处理数字键和弦类型切换
  function handleNumberKey(key: string, withShift: boolean = false) {
    let newType: ChordType | null = null;
    const currentType = activeChordType.value;
    
    switch (key) {
      case '1':
        // 1: 切换为小和弦，Shift+1: 切换为大和弦
        if (withShift) {
          newType = currentType === ChordType.MAJOR ? null : ChordType.MAJOR;
        } else {
          newType = currentType === ChordType.MINOR ? null : ChordType.MINOR;
        }
        break;
      case '2':
        // 2: 切换为sus4，Shift+2: 切换为sus2
        if (withShift) {
          newType = currentType === ChordType.SUSPENDED_SECOND ? null : ChordType.SUSPENDED_SECOND;
        } else {
          newType = currentType === ChordType.SUSPENDED_FOURTH ? null : ChordType.SUSPENDED_FOURTH;
        }
        break;
      case '3':
        // 切换小七和弦/大七和弦
        if (withShift) {
          newType = currentType === ChordType.MAJOR_SEVENTH ? null : ChordType.MAJOR_SEVENTH;
        } else {
          newType = currentType === ChordType.MINOR_SEVENTH ? null : ChordType.MINOR_SEVENTH;
        }
        break;
      case '4':
        // 切换属七和弦/小大七和弦
        if (withShift) {
          newType = currentType === ChordType.MINOR_MAJOR_SEVENTH ? null : ChordType.MINOR_MAJOR_SEVENTH;
        } else {
          newType = currentType === ChordType.DOMINANT_SEVENTH ? null : ChordType.DOMINANT_SEVENTH;
        }
        break;
      case '5':
        // 切换小六和弦/大六和弦
        if (withShift) {
          newType = currentType === ChordType.SIXTH ? null : ChordType.SIXTH;
        } else {
          newType = currentType === ChordType.MINOR_SIXTH ? null : ChordType.MINOR_SIXTH;
        }
        break;
      case '6':
        // 切换减和弦/增和弦
        if (withShift) {
          newType = currentType === ChordType.AUGMENTED ? null : ChordType.AUGMENTED;
        } else {
          newType = currentType === ChordType.DIMINISHED ? null : ChordType.DIMINISHED;
        }
        break;
      case '7':
        // 切换小九和弦/大九和弦
        if (withShift) {
          newType = currentType === ChordType.MAJOR_NINTH ? null : ChordType.MAJOR_NINTH;
        } else {
          newType = currentType === ChordType.MINOR_NINTH ? null : ChordType.MINOR_NINTH;
        }
        break;
    }
    
    // 更新激活的和弦类型
    activeChordType.value = newType;
    
    // 如果当前有和弦在播放，立即更新它
    if (pressedKeys.size > 0) {
      const pressedKey = Array.from(pressedKeys)[0];
      if (pressedKey && KEY_TO_CHORD.value[pressedKey]) {
        const chord = applyModifiers(KEY_TO_CHORD.value[pressedKey]);
        playChord(chord);
      }
    }
  }
  
  return {
    currentChord,
    currentKey,
    audioSystem,
    pressedKeys,
    isAudioInitialized,
    KEY_TO_CHORD,
    setCurrentChord,
    playChord,
    stopChord,
    clearChord,
    handleKeyDown,
    handleKeyUp,
    initAudio,
    applyModifiers,
    transpose,
    transposeUp,
    transposeDown,
    handleNumberKey,
    activeChordType,
    handleInversion,
    currentInversion  // 导出当前转位状态
  }
}) 