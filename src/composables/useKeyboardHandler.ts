import { ref, onMounted, onUnmounted } from 'vue'
import { ChordType, Chord } from '@/utils/music'
import AudioSystem from '@/utils/audioSystem'

// 键盘到音符的映射
const KEY_TO_NOTE: Record<string, string> = {
  'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E',
  'f': 'F', 't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A',
  'u': 'A#', 'j': 'B', 'k': 'C', 'o': 'C#', 'l': 'D',
  'p': 'D#', ';': 'E'
};

// 默认八度
const DEFAULT_OCTAVE = 4;

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
  function applyModifiers(baseChord: Chord): Chord {
    const rootNote = baseChord.root.name;
    const octave = baseChord.root.octave;
    let chordType = ChordType.MAJOR;
    
    if (modifiers.value.shift && modifiers.value.ctrl) {
      chordType = ChordType.DOMINANT_SEVENTH;
    } else if (modifiers.value.shift && modifiers.value.alt) {
      chordType = ChordType.MAJOR_SEVENTH;
    } else if (modifiers.value.ctrl && modifiers.value.alt) {
      chordType = ChordType.MINOR_SEVENTH;
    } else if (modifiers.value.shift) {
      chordType = ChordType.MINOR;
    } else if (modifiers.value.ctrl) {
      chordType = ChordType.SUSPENDED_FOURTH;
    } else if (modifiers.value.alt) {
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
    
    // 检查是否是音符键
    const key = event.key.toLowerCase();
    if (KEY_TO_NOTE[key]) {
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
    // 获取音符
    const noteName = KEY_TO_NOTE[key];
    if (!noteName) return;
    
    // 创建基础和弦
    const baseChord = new Chord(noteName, DEFAULT_OCTAVE);
    
    // 应用修饰符
    const chord = applyModifiers(baseChord);
    
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
    audioSystem
  };
} 