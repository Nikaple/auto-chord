import { ref, computed } from 'vue'
import { useChordStore } from '@/stores/chordStore'

export function useKeyboardHandler() {
  const chordStore = useChordStore()
  
  // 设备类型检测
  const isMobileDevice = ref(false)
  
  // 检测设备类型
  function detectDeviceType(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
  
  // 计算属性：当前调性下的和弦映射
  const chordMapping = computed(() => chordStore.KEY_TO_CHORD)
  
  // 当前按下的键
  const pressedKeys = computed(() => chordStore.pressedKeys)
  
  // 当前活跃的键（用于UI显示）
  const activeKeys = computed(() => Array.from(chordStore.pressedKeys))
  
  // 处理键盘按下事件
  function handleKeyDown(event: KeyboardEvent) {
    return chordStore.handleKeyDown(event)
  }
  
  // 处理键盘抬起事件
  function handleKeyUp(event: KeyboardEvent) {
    return chordStore.handleKeyUp(event)
  }
  
  // 处理数字键
  function handleNumberKey(key: string, withShift: boolean = false) {
    return chordStore.handleNumberKey(key, withShift)
  }
  
  // 初始化音频系统
  async function initAudio() {
    return await chordStore.initAudio()
  }
  
  // 切换调性
  function changeKey(newKey: string) {
    return chordStore.transpose(newKey)
  }
  
  return {
    isMobileDevice,
    chordMapping,
    pressedKeys,
    activeKeys,
    detectDeviceType,
    handleKeyDown,
    handleKeyUp,
    handleNumberKey,
    initAudio,
    changeKey
  }
} 