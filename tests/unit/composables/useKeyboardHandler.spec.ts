import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useKeyboardHandler } from '../../../src/composables/useKeyboardHandler'
import { setActivePinia, createPinia } from 'pinia'
import { useChordStore } from '../../../src/stores/chordStore'

// 模拟全局 navigator 对象
const mockNavigator = {
  userAgent: ''
};

vi.stubGlobal('navigator', mockNavigator);

// 模拟 chordStore
vi.mock('../../../src/stores/chordStore', () => {
  const mockChordStore = {
    KEY_TO_CHORD: {
      's': { root: 'C', type: 'major' },
      'd': { root: 'D', type: 'minor' }
    },
    pressedKeys: new Set(['s']),
    handleKeyDown: vi.fn(),
    handleKeyUp: vi.fn(),
    handleNumberKey: vi.fn(),
    transpose: vi.fn(),
    initAudio: vi.fn().mockImplementation(() => Promise.resolve(true))
  };
  
  return {
    useChordStore: vi.fn().mockImplementation(() => mockChordStore)
  }
});

describe('useKeyboardHandler 组合式函数', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('正确检测移动设备', () => {
    const { detectDeviceType } = useKeyboardHandler()
    
    // 默认非移动设备
    mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    expect(detectDeviceType()).toBe(false)
    
    // 测试移动设备
    mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
    expect(detectDeviceType()).toBe(true)
    
    // 测试 Android 设备
    mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 12; Pixel 6)'
    expect(detectDeviceType()).toBe(true)
  })

  it('正确获取和弦映射', () => {
    const { chordMapping } = useKeyboardHandler()
    expect(chordMapping.value).toEqual({
      's': { root: 'C', type: 'major' },
      'd': { root: 'D', type: 'minor' }
    })
  })

  it('正确获取按下的键', () => {
    const { pressedKeys } = useKeyboardHandler()
    expect(pressedKeys.value).toBeInstanceOf(Set)
    expect(pressedKeys.value.size).toBe(1)
    expect(pressedKeys.value.has('s')).toBe(true)
  })

  it('正确获取活跃键数组', () => {
    const { activeKeys } = useKeyboardHandler()
    expect(activeKeys.value).toEqual(['s'])
  })
  
  it('正确调用键盘事件处理函数', () => {
    const { handleKeyDown, handleKeyUp } = useKeyboardHandler()
    const mockEvent = { key: 'a', code: 'KeyA' } as KeyboardEvent
    
    // 测试键盘按下事件
    handleKeyDown(mockEvent)
    const chordStore = useChordStore()
    expect(chordStore.handleKeyDown).toHaveBeenCalledWith(mockEvent)
    
    // 测试键盘抬起事件
    handleKeyUp(mockEvent)
    expect(chordStore.handleKeyUp).toHaveBeenCalledWith(mockEvent)
  })
  
  it('正确处理数字键', () => {
    const { handleNumberKey } = useKeyboardHandler()
    
    // 数字键没有shift
    handleNumberKey('1', false)
    const chordStore = useChordStore()
    expect(chordStore.handleNumberKey).toHaveBeenCalledWith('1', false)
    
    // 数字键带有shift
    handleNumberKey('1', true)
    expect(chordStore.handleNumberKey).toHaveBeenCalledWith('1', true)
  })
  
  it('正确调用音频初始化', async () => {
    const { initAudio } = useKeyboardHandler()
    const chordStore = useChordStore()
    
    const result = await initAudio()
    expect(result).toBe(true)
    expect(chordStore.initAudio).toHaveBeenCalled()
  })
  
  it('正确处理转调', () => {
    const { changeKey } = useKeyboardHandler()
    const chordStore = useChordStore()
    
    changeKey('G')
    expect(chordStore.transpose).toHaveBeenCalledWith('G')
  })
}) 