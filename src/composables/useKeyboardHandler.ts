import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { ChordType, Chord } from '@/utils/music'
import { useChordStore } from '@/stores/chordStore'

// 键盘到和弦的映射（C大调）
const KEY_TO_CHORD: Record<string, { root: string, type: ChordType }> = {
  // 第二排按键 - C大调基础和弦 (I ii iii IV V vi viio) - 向右移动一位
  's': { root: 'C', type: ChordType.MAJOR },         // C大三和弦 (I)，原来是A
  'd': { root: 'D', type: ChordType.MINOR },         // D小三和弦 (ii)，原来是S
  'f': { root: 'E', type: ChordType.MINOR },         // E小三和弦 (iii)，原来是D
  'g': { root: 'F', type: ChordType.MAJOR },         // F大三和弦 (IV)，原来是F
  'h': { root: 'G', type: ChordType.MAJOR },         // G大三和弦 (V)，原来是G
  'j': { root: 'A', type: ChordType.MINOR },         // A小三和弦 (vi)，原来是H
  'k': { root: 'B', type: ChordType.DIMINISHED },    // B减三和弦 (viio)，原来是J
  
  // 第一排按键 - 根音离调的和弦 - 向右移动一位
  'e': { root: 'C#', type: ChordType.DIMINISHED },   // C#减三和弦，原来是W
  'r': { root: 'D#', type: ChordType.AUGMENTED },    // D#增三和弦，原来是E
  'y': { root: 'F#', type: ChordType.DIMINISHED },   // F#减三和弦，原来是T
  'u': { root: 'G#', type: ChordType.DIMINISHED },   // G#减三和弦，原来是Y
  'i': { root: 'A#', type: ChordType.MAJOR },        // A#大三和弦，原来是U
  
  // 第三排按键 - C大调常见七和弦
  'z': { root: 'C', type: ChordType.MAJOR_SEVENTH },       // Cmaj7 (I7)
  'x': { root: 'D', type: ChordType.MINOR_SEVENTH },       // Dm7 (ii7)
  'c': { root: 'E', type: ChordType.MINOR_SEVENTH },       // Em7 (iii7)
  'v': { root: 'F', type: ChordType.MAJOR_SEVENTH },       // Fmaj7 (IV7)
  'b': { root: 'G', type: ChordType.DOMINANT_SEVENTH },    // G7 (V7)
  'n': { root: 'A', type: ChordType.MINOR_SEVENTH },       // Am7 (vi7)
  'm': { root: 'B', type: ChordType.HALF_DIMINISHED_SEVENTH }  // Bm7b5 (viio7) - 半减七和弦
};

// 默认八度
const DEFAULT_OCTAVE = 4;
// 对于高八度键的八度偏移 - 由于删除了高八度键，此处可以清空
const HIGH_OCTAVE_KEYS: string[] = [];

// 持续播放的间隔时间（毫秒）
const SUSTAIN_INTERVAL = 1000;

export function useKeyboardHandler() {
  const chordStore = useChordStore();
  
  // 存储每个键的持续播放定时器
  const sustainTimers = reactive(new Map<string, number>());
  
  // 处理键盘按下事件
  function handleKeyDown(event: KeyboardEvent) {
    // 更新修饰符状态
    chordStore.setModifiers({
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey
    });
    
    const key = event.key.toLowerCase();
    
    // 阻止浏览器默认行为，如Ctrl+W关闭标签页、Ctrl+A全选等
    if (event.ctrlKey && /^[a-z]$/i.test(key)) {
      event.preventDefault();
    } else if (event.altKey && KEY_TO_CHORD[key]) {
      event.preventDefault();
    }
    
    // 如果是和弦键盘的按键
    if (KEY_TO_CHORD[key]) {
      // 检查按键是否已经在激活列表中，如果已经激活则不重新触发和弦
      if (!chordStore.pressedKeys.has(key)) {
        chordStore.pressedKeys.add(key);
        
        const baseChord = KEY_TO_CHORD[key];
        
        // 应用修饰键并播放和弦
        const modifiedChord = chordStore.applyModifiers(baseChord);
        chordStore.playChord(modifiedChord);
      }
    }
  }
  
  // 处理键盘松开事件
  function handleKeyUp(event: KeyboardEvent) {
    // 更新修饰符状态
    chordStore.setModifiers({
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey
    });
    
    const key = event.key.toLowerCase();
    
    // 如果释放的是和弦按键（而不是修饰键），则停止声音
    if (KEY_TO_CHORD[key]) {
      // 从pressedKeys中移除当前释放的键
      chordStore.pressedKeys.delete(key);
      
      // 立即停止当前声音
      chordStore.stopChord();
      
      // 检查是否还有其他和弦按键被按下
      const remainingChordKeys = Array.from(chordStore.pressedKeys).filter(k => KEY_TO_CHORD[k]);
      
      if (remainingChordKeys.length > 0) {
        // 如果还有其他和弦按键，播放最近按下的那个
        const latestKey = remainingChordKeys[remainingChordKeys.length - 1];
        const baseChord = KEY_TO_CHORD[latestKey];
        const modifiedChord = chordStore.applyModifiers(baseChord);
        chordStore.playChord(modifiedChord);
      }
    } else {
      // 如果释放的是修饰键，且有和弦按键被按下，更新和弦
      const chordKeys = Array.from(chordStore.pressedKeys).filter(k => KEY_TO_CHORD[k]);
      if (chordKeys.length > 0) {
        // 先停止所有声音
        chordStore.stopChord();
        
        const activeKey = chordKeys[chordKeys.length - 1];
        const baseChord = KEY_TO_CHORD[activeKey];
        const modifiedChord = chordStore.applyModifiers(baseChord);
        chordStore.playChord(modifiedChord);
      }
    }
  }
  
  // 设置持续播放定时器
  function startSustainTimer(key: string) {
    // 先清除可能存在的定时器
    stopSustainTimer(key);
    
    // 设置新的定时器，每隔一段时间重新触发和弦
    const timerId = window.setInterval(() => {
      if (chordStore.pressedKeys.has(key)) {
        playChordForKey(key);
      } else {
        stopSustainTimer(key);
      }
    }, SUSTAIN_INTERVAL);
    
    sustainTimers.set(key, timerId);
  }
  
  // 停止持续播放定时器
  function stopSustainTimer(key: string) {
    const timerId = sustainTimers.get(key);
    if (timerId) {
      clearInterval(timerId);
      sustainTimers.delete(key);
    }
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
    
    // 应用修饰符并播放和弦
    const chord = chordStore.applyModifiers(baseChordConfig);
    chordStore.playChord(chord);
  }
  
  // 生命周期钩子
  onMounted(() => {
    // 添加事件监听器
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // 页面失去焦点时停止所有声音
    window.addEventListener('blur', () => {
      chordStore.stopChord();
    });
  });
  
  onUnmounted(() => {
    // 移除事件监听器
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('blur', () => {
      chordStore.stopChord();
    });
    
    // 停止所有声音
    chordStore.stopChord();
  });
  
  return {
    modifiers: computed(() => chordStore.modifiers),
    chordMapping: KEY_TO_CHORD,
    pressedKeys: computed(() => chordStore.pressedKeys),
    activeKeys: computed(() => Array.from(chordStore.pressedKeys)),
    handleKeyDown,
    handleKeyUp
  };
} 