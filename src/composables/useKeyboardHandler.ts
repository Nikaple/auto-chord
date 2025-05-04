import { ref, onMounted, onUnmounted } from 'vue'
import { ChordType, Chord } from '@/utils/music'
import AudioSystem from '@/utils/audioSystem'

// 键盘到和弦的映射（C大调）
const KEY_TO_CHORD: Record<string, { root: string, type: ChordType }> = {
  // 第二排按键 - C大调基础和弦 (I ii iii IV V vi viio)
  'a': { root: 'C', type: ChordType.MAJOR },         // C大三和弦 (I)
  's': { root: 'D', type: ChordType.MINOR },         // D小三和弦 (ii)
  'd': { root: 'E', type: ChordType.MINOR },         // E小三和弦 (iii)
  'f': { root: 'F', type: ChordType.MAJOR },         // F大三和弦 (IV)
  'g': { root: 'G', type: ChordType.MAJOR },         // G大三和弦 (V)
  'h': { root: 'A', type: ChordType.MINOR },         // A小三和弦 (vi)
  'j': { root: 'B', type: ChordType.DIMINISHED },    // B减三和弦 (viio)
  'k': { root: 'C', type: ChordType.MAJOR },         // 高八度C大三和弦
  'l': { root: 'D', type: ChordType.MINOR },         // 高八度D小三和弦
  ';': { root: 'E', type: ChordType.MINOR },         // 高八度E小三和弦
  
  // 第一排按键 - 根音离调的三和弦
  'w': { root: 'C#', type: ChordType.DIMINISHED },        // C#大三和弦
  'e': { root: 'D#', type: ChordType.AUGMENTED },        // D#大三和弦
  't': { root: 'F#', type: ChordType.DIMINISHED },        // F#大三和弦
  'y': { root: 'G#', type: ChordType.DIMINISHED },        // G#大三和弦
  'u': { root: 'A#', type: ChordType.MAJOR },        // A#大三和弦
  'o': { root: 'C#', type: ChordType.DIMINISHED },        // 高八度C#大三和弦
  'p': { root: 'D#', type: ChordType.DIMINISHED }         // 高八度D#大三和弦
};

// 默认八度
const DEFAULT_OCTAVE = 4;
// 对于高八度键的八度偏移
const HIGH_OCTAVE_KEYS = ['k', 'l', ';', 'o', 'p'];

export function useKeyboardHandler() {
  // 当前播放的和弦
  const currentChord = ref<Chord | null>(null);
  
  // 按下的键盘修饰符
  const modifiers = ref({
    shift: false,
    ctrl: false,
    alt: false
  });
  
  // 音频系统
  const audioSystem = new AudioSystem();
  
  // 应用修饰符来改变和弦类型
  function applyModifiers(baseChord: { root: string, type: ChordType }): Chord {
    const rootNote = baseChord.root;
    // 确定八度
    let octave = DEFAULT_OCTAVE;
    
    // 基础类型使用传入的类型，除非修饰键改变了类型
    let chordType = baseChord.type;
    
    if (modifiers.value.shift && modifiers.value.ctrl) {
      // 属七和弦 - 保持根音不变
      chordType = ChordType.DOMINANT_SEVENTH;
    } else if (modifiers.value.shift && modifiers.value.alt) {
      // 大七和弦 - 保持根音不变
      chordType = ChordType.MAJOR_SEVENTH;
    } else if (modifiers.value.ctrl && modifiers.value.alt) {
      // 小七和弦 - 保持根音不变
      chordType = ChordType.MINOR_SEVENTH;
    } else if (modifiers.value.shift) {
      // Shift: 大小性质反转
      if (chordType === ChordType.MAJOR) {
        chordType = ChordType.MINOR;
      } else if (chordType === ChordType.MINOR) {
        chordType = ChordType.MAJOR;
      }
    } else if (modifiers.value.ctrl) {
      // Ctrl: sus4和弦
      chordType = ChordType.SUSPENDED_FOURTH;
    } else if (modifiers.value.alt) {
      // Alt: sus2和弦
      chordType = ChordType.SUSPENDED_SECOND;
    }
    
    return new Chord(rootNote, octave, chordType);
  }
  
  // 处理键盘按下事件
  function handleKeyDown(event: KeyboardEvent) {
    // 更新修饰符状态
    modifiers.value = {
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey
    };
    
    // 检查是否是和弦键
    const key = event.key.toLowerCase();
    if (KEY_TO_CHORD[key]) {
      // 仅当不是重复触发时才播放
      if (!event.repeat) {
        playChordForKey(key);
      }
      
      // 阻止默认行为（例如滚动）
      event.preventDefault();
    }
  }
  
  // 处理键盘松开事件
  function handleKeyUp(event: KeyboardEvent) {
    // 更新修饰符状态
    modifiers.value = {
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey
    };
    
    // 不需要立即响应键盘释放事件
    // 声音会自动衰减
  }
  
  // 为指定的键播放和弦
  function playChordForKey(key: string) {
    // 获取和弦配置
    const chordConfig = KEY_TO_CHORD[key];
    if (!chordConfig) return;
    
    // 确定八度
    let octave = DEFAULT_OCTAVE;
    if (HIGH_OCTAVE_KEYS.includes(key)) {
      octave = DEFAULT_OCTAVE + 1;
    }
    
    // 创建基础和弦
    const baseChordConfig = { 
      root: chordConfig.root, 
      type: chordConfig.type 
    };
    
    // 应用修饰符
    const chord = applyModifiers(baseChordConfig);
    
    // 显式设置八度
    chord.root.octave = octave;
    // 重新计算和弦的音符
    chord.notes = chord.calculateChordNotes();
    
    // 播放和弦
    audioSystem.playChord(chord);
    
    // 更新当前和弦
    currentChord.value = chord;
  }
  
  // 停止所有声音
  function stopAllSounds() {
    audioSystem.stopAll();
    currentChord.value = null;
  }
  
  // 生命周期钩子
  onMounted(() => {
    // 添加事件监听器
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // 页面失去焦点时停止所有声音
    window.addEventListener('blur', stopAllSounds);
  });
  
  onUnmounted(() => {
    // 移除事件监听器
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('blur', stopAllSounds);
    
    // 停止所有声音
    stopAllSounds();
  });
  
  return {
    currentChord,
    modifiers,
    audioSystem,
    chordMapping: KEY_TO_CHORD
  };
} 