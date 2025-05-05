import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useChordStore } from '@/stores/chordStore'


// 检测设备类型
const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  // 检测触摸设备
  const hasTouchScreen = navigator.maxTouchPoints > 0 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 检测屏幕尺寸
  const width = window.innerWidth;
  
  if (hasTouchScreen) {
    if (width < 768) {
      return 'mobile';
    } else {
      return 'tablet';
    }
  }
  
  return 'desktop';
};

export function useKeyboardHandler() {
  const chordStore = useChordStore();
  
  // 设备类型检测
  const deviceType = ref<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  // 存储每个键的持续播放定时器
  
  // 处理键盘按下事件
  function handleKeyDown(event: KeyboardEvent) {
    // 阻止Alt键的默认行为
    if (event.key === 'Alt' || event.altKey) {
      event.preventDefault();
    }
    
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
    } else if (event.altKey && chordStore.KEY_TO_CHORD[key]) {
      event.preventDefault();
    }
    
    // 如果是和弦键盘的按键
    if (chordStore.KEY_TO_CHORD[key]) {
      // 检查按键是否已经在激活列表中，如果已经激活则不重新触发和弦
      if (!chordStore.pressedKeys.has(key)) {
        chordStore.pressedKeys.add(key);
        
        const baseChord = chordStore.KEY_TO_CHORD[key];
        
        // 应用修饰键并播放和弦
        const modifiedChord = chordStore.applyModifiers(baseChord);
        chordStore.playChord(modifiedChord);
      }
    }
  }
  
  // 处理键盘松开事件
  function handleKeyUp(event: KeyboardEvent) {
    // 阻止Alt键的默认行为
    if (event.key === 'Alt') {
      event.preventDefault();
    }
    
    // 更新修饰符状态
    chordStore.setModifiers({
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey
    });
    
    const key = event.key.toLowerCase();
    
    // 移除按键状态
    chordStore.pressedKeys.delete(key);
    
    // 如果是和弦键
    if (chordStore.KEY_TO_CHORD[key]) {
      // 检查是否还有其他键被按下
      const remainingChordKeys = Array.from(chordStore.pressedKeys).filter(k => chordStore.KEY_TO_CHORD[k]);
      
      if (remainingChordKeys.length > 0) {
        // 播放最后一个按下的和弦
        const lastKey = remainingChordKeys[remainingChordKeys.length - 1];
        const baseChord = chordStore.KEY_TO_CHORD[lastKey];
        const modifiedChord = chordStore.applyModifiers(baseChord);
        chordStore.playChord(modifiedChord);
      } else {
        // 停止和弦声音但保留当前和弦显示
        chordStore.stopChord();
      }
    }
  }
  
  // 设置持续播放定时器
  
  // 停止持续播放定时器
  
  // 为指定的键播放和弦
  
  // 初始化设备类型检测
  onMounted(() => {
    deviceType.value = detectDeviceType();
    
    // 窗口大小变化时重新检测设备类型
    window.addEventListener('resize', () => {
      deviceType.value = detectDeviceType();
    });
    
    // 添加事件监听器
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // 专门处理Alt键的事件
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Alt' || e.altKey) {
        e.preventDefault();
      }
    }, true);
    
    // 页面失去焦点时停止所有声音，但保留和弦显示
    window.addEventListener('blur', () => {
      chordStore.stopChord();
    });
  });
  
  // 清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', () => {
      deviceType.value = detectDeviceType();
    });
    
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
    chordMapping: computed(() => chordStore.KEY_TO_CHORD),
    pressedKeys: computed(() => chordStore.pressedKeys),
    activeKeys: computed(() => Array.from(chordStore.pressedKeys)),
    deviceType: computed(() => deviceType.value),
    isMobileDevice: computed(() => deviceType.value !== 'desktop'),
    handleKeyDown,
    handleKeyUp
  };
} 