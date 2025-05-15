import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChordStore, KEY_TO_DEGREE } from '../../../src/stores/chordStore'
import AudioSystem from '../../../src/utils/audioSystem'

// 导入实际的ChordType，而不是从模拟的模块导入
import { ChordType } from '../../../src/utils/music'

// 模拟AudioSystem
vi.mock('../../../src/utils/audioSystem', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      init: vi.fn().mockResolvedValue(true),
      waitForSamplerLoad: vi.fn().mockResolvedValue(true),
      isSamplerLoaded: vi.fn().mockReturnValue(true),
      playChord: vi.fn(),
      stopAll: vi.fn(),
      getSettings: vi.fn().mockReturnValue({
        volume: 0.7,
        release: 1,
        reverb: 0.3,
        brightness: 0.5,
        dynamics: 0.7
      }),
      applySettings: vi.fn()
    }))
  }
})

// 确保在此之前导入ChordType，以便在模拟中使用
vi.mock('../../../src/utils/music', async () => {
  return {
    ChordType: {
      MAJOR: 'major',
      MINOR: 'minor',
      DIMINISHED: 'diminished',
      AUGMENTED: 'augmented',
      SUSPENDED_SECOND: 'suspended_second',
      SUSPENDED_FOURTH: 'suspended_fourth',
      DOMINANT_SEVENTH: 'dominant_seventh',
      MAJOR_SEVENTH: 'major_seventh',
      MINOR_SEVENTH: 'minor_seventh',
      MINOR_MAJOR_SEVENTH: 'minor_major_seventh',
      HALF_DIMINISHED_SEVENTH: 'half_diminished_seventh',
      SIXTH: 'sixth',
      MINOR_SIXTH: 'minor_sixth',
      MAJOR_NINTH: 'major_ninth',
      MINOR_NINTH: 'minor_ninth'
    },
    ALL_NOTES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    getChordByDegree: vi.fn().mockImplementation((tonic, degree, octave, forceType) => {
      // 简单模拟当键是's'(第一级)且调性是'G'时，返回根音为'G'的和弦
      if (degree === 1 && tonic === 'G') {
        return { root: 'G', type: forceType || ChordType.MAJOR };
      }
      // 默认模拟
      return { root: 'C', type: forceType || ChordType.MAJOR };
    }),
    Chord: vi.fn().mockImplementation((root, octave, type) => ({
      root: { name: root },
      octave: octave || 4,
      type: type || 'major',
      noteNames: ['C4', 'E4', 'G4'],
      setInversion: vi.fn(),
      cycleInversion: vi.fn(),
      resetInversion: vi.fn(),
      inversion: 0
    }))
  }
})

describe('和弦状态管理', () => {
  beforeEach(() => {
    // 创建一个新的pinia实例并将其设置为活动pinia
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初始化时应使用默认值并且没有当前和弦', () => {
    const store = useChordStore()
    expect(store.currentChord).toBeNull()
    expect(store.currentKey).toBe('C')
    expect(store.isAudioInitialized).toBe(false)
    expect(store.pressedKeys.size).toBe(0)
    expect(store.activeChordType).toBeNull()
    expect(store.currentInversion).toBe(0)
    expect(store.octaveOffset).toBe(0)
  })

  it('应正确计算键位到和弦的映射', () => {
    const store = useChordStore()
    const mapping = store.KEY_TO_CHORD
    
    // 每个键位都应该有一个和弦映射
    expect(Object.keys(mapping).length).toBe(Object.keys(KEY_TO_DEGREE).length)
    
    // 检查一些特定的映射
    expect(mapping.s).toBeDefined()
    expect(mapping.s.root).toBeDefined()
    expect(mapping.s.type).toBeDefined()
    
    // C调中的s键应该对应C大三和弦
    expect(mapping.s.root).toBe('C')
    expect(mapping.s.type).toBe(ChordType.MAJOR)
  })

  it('应正确处理转调', async () => {
    const store = useChordStore()
    await store.initAudio()
    
    // 原始调性是C
    expect(store.currentKey).toBe('C')
    
    // 模拟按下s键（C调下是C大三和弦）
    await store.handleKeyDown({ key: 's', code: 'KeyS' } as KeyboardEvent)
    
    // 转到G调
    store.transpose('G')
    expect(store.currentKey).toBe('G')
    
    // 在G调下，s键应该对应G大三和弦
    expect(store.KEY_TO_CHORD.s.root).toBe('G')
  })

  it('升调和降调应该正确工作', () => {
    const store = useChordStore()
    
    // 原始调性是C
    expect(store.currentKey).toBe('C')
    
    // 升调
    store.transposeUp()
    expect(store.currentKey).toBe('C#')
    
    // 再次升调
    store.transposeUp()
    expect(store.currentKey).toBe('D')
    
    // 降调
    store.transposeDown()
    expect(store.currentKey).toBe('C#')
    
    // 降调回C
    store.transposeDown()
    expect(store.currentKey).toBe('C')
    
    // 降调到B
    store.transposeDown()
    expect(store.currentKey).toBe('B')
  })

  it('应正确初始化音频系统', async () => {
    const store = useChordStore()
    const result = await store.initAudio()
    
    expect(result).toBe(true)
    expect(store.isAudioInitialized).toBe(true)
    
    // AudioSystem应该被创建和初始化
    expect(AudioSystem).toHaveBeenCalled()
  })

  it('应正确处理和弦修改器（转位和类型）', async () => {
    const store = useChordStore()
    await store.initAudio()
    
    // 按下s键
    await store.handleKeyDown({ key: 's', code: 'KeyS' } as KeyboardEvent)
    
    // 修改转位
    store.handleInversion()
    expect(store.currentInversion).toBe(1)
    
    // 设置活跃和弦类型
    store.activeChordType = ChordType.MINOR
    // 再次按下s键，应该变成小三和弦
    await store.handleKeyDown({ key: 's', code: 'KeyS' } as KeyboardEvent)
    
    // 重置转位
    store.handleInversion(true) // 传入true表示Shift键被按下
    expect(store.currentInversion).toBe(0)
  })

  it('八度调整应该正确工作', () => {
    const store = useChordStore()
    
    // 初始八度偏移是0
    expect(store.octaveOffset).toBe(0)
    
    // 八度上升
    store.octaveUp()
    expect(store.octaveOffset).toBe(1)
    
    // 再次上升
    store.octaveUp()
    expect(store.octaveOffset).toBe(2)
    
    // 八度下降
    store.octaveDown()
    expect(store.octaveOffset).toBe(1)
    
    // 重置八度
    store.resetOctave()
    expect(store.octaveOffset).toBe(0)
  })

  it('应正确处理数字键（和弦类型切换）', async () => {
    const store = useChordStore()
    
    // 按下1键
    await store.handleNumberKey('1')
    expect(store.activeChordType).toBe(ChordType.MINOR)
    
    // 按下2键
    await store.handleNumberKey('2')
    expect(store.activeChordType).toBe(ChordType.SUSPENDED_FOURTH)
    
    // 按下3键
    await store.handleNumberKey('3')
    expect(store.activeChordType).toBe(ChordType.MINOR_SEVENTH)
    
    // 按下4键
    await store.handleNumberKey('4')
    expect(store.activeChordType).toBe(ChordType.DOMINANT_SEVENTH)
    
    // Shift+1
    await store.handleNumberKey('1', true)
    expect(store.activeChordType).toBe(ChordType.MAJOR)
  })

  it('停止和清除和弦应该正确工作', async () => {
    const store = useChordStore()
    await store.initAudio()
    
    // 按下s键
    await store.handleKeyDown({ key: 's', code: 'KeyS' } as KeyboardEvent)
    expect(store.currentChord).not.toBeNull()
    
    // 停止和弦
    store.stopChord()
    
    // 清除和弦
    store.clearChord()
    expect(store.currentChord).toBeNull()
  })

  it('应正确处理键盘按下事件', async () => {
    const store = useChordStore()
    await store.initAudio()
    
    // 模拟按下和弦键
    const keyEvent = { key: 's', code: 'KeyS' } as KeyboardEvent
    await store.handleKeyDown(keyEvent)
    expect(store.currentChord).not.toBeNull()
    
    // 模拟按下和弦修饰键(Q)
    const qKeyEvent = { key: 'q', code: 'KeyQ', shiftKey: false } as KeyboardEvent
    await store.handleKeyDown(qKeyEvent)
    expect(store.currentInversion).toBe(1)
    
    // 模拟按下带Shift的和弦修饰键(Shift+Q)
    const shiftQKeyEvent = { key: 'q', code: 'KeyQ', shiftKey: true } as KeyboardEvent
    await store.handleKeyDown(shiftQKeyEvent)
    expect(store.currentInversion).toBe(0)
    
    // 模拟按下数字键
    const digit1Event = { key: '1', code: 'Digit1', shiftKey: false } as KeyboardEvent
    await store.handleKeyDown(digit1Event)
    expect(store.activeChordType).toBe(ChordType.MINOR)
  })
  
  it('应正确处理键盘松开事件', async () => {
    const store = useChordStore()
    await store.initAudio()
    
    // 模拟多个和弦键被按下
    await store.handleKeyDown({ key: 's', code: 'KeyS' } as KeyboardEvent)
    await store.handleKeyDown({ key: 'd', code: 'KeyD' } as KeyboardEvent)
    
    // 松开第一个和弦键
    await store.handleKeyUp({ key: 's', code: 'KeyS' } as KeyboardEvent)
    expect(store.pressedKeys.size).toBe(1)
    expect(store.pressedKeys.has('d')).toBe(true)
    
    // 松开所有和弦键
    await store.handleKeyUp({ key: 'd', code: 'KeyD' } as KeyboardEvent)
    expect(store.pressedKeys.size).toBe(0)
  })
  
  it('应正确处理特殊键处理', async () => {
    const store = useChordStore()
    await store.initAudio()
    
    // PageUp 键应该增加八度
    await store.handleKeyDown({ key: 'PageUp', code: 'PageUp' } as KeyboardEvent)
    expect(store.octaveOffset).toBe(1)
    
    // PageDown 键应该减少八度
    await store.handleKeyDown({ key: 'PageDown', code: 'PageDown' } as KeyboardEvent)
    expect(store.octaveOffset).toBe(0)
    
    // Home 键应该重置八度
    store.octaveUp() // 先增加八度
    await store.handleKeyDown({ key: 'Home', code: 'Home' } as KeyboardEvent)
    expect(store.octaveOffset).toBe(0)
  })

  it('应正确处理所有数字键组合', async () => {
    const store = useChordStore()
    
    // 测试所有数字键
    const testNumberKey = async (key: string, withShift: boolean, expectedType: ChordType | null) => {
      await store.handleNumberKey(key, withShift)
      expect(store.activeChordType).toBe(expectedType)
      store.activeChordType = null // 重置
    }
    
    // 不带Shift的数字键
    await testNumberKey('1', false, ChordType.MINOR)
    await testNumberKey('2', false, ChordType.SUSPENDED_FOURTH)
    await testNumberKey('3', false, ChordType.MINOR_SEVENTH)
    await testNumberKey('4', false, ChordType.DOMINANT_SEVENTH)
    await testNumberKey('5', false, ChordType.MINOR_SIXTH)
    await testNumberKey('6', false, ChordType.DIMINISHED)
    await testNumberKey('7', false, ChordType.MINOR_NINTH)
    
    // 带Shift的数字键
    await testNumberKey('1', true, ChordType.MAJOR)
    await testNumberKey('2', true, ChordType.SUSPENDED_SECOND)
    await testNumberKey('3', true, ChordType.MAJOR_SEVENTH)
    await testNumberKey('4', true, ChordType.MINOR_MAJOR_SEVENTH)
    await testNumberKey('5', true, ChordType.SIXTH)
    await testNumberKey('6', true, ChordType.AUGMENTED)
    await testNumberKey('7', true, ChordType.MAJOR_NINTH)
  })
  
  it('应正确处理数字键的切换状态', async () => {
    const store = useChordStore()
    
    // 测试数字键切换状态 (按两次取消)
    await store.handleNumberKey('1', false)
    expect(store.activeChordType).toBe(ChordType.MINOR)
    
    // 再次按下同一个键应该取消状态
    await store.handleNumberKey('1', false)
    expect(store.activeChordType).toBeNull()
  })
  
  it('应正确更新当前播放的和弦', async () => {
    const store = useChordStore()
    await store.initAudio()
    
    // 按下和弦键
    await store.handleKeyDown({ key: 's', code: 'KeyS' } as KeyboardEvent)
    
    // 改变八度偏移前记录和弦
    const initialChord = store.currentChord
    
    // 改变八度偏移
    store.octaveUp()
    
    // 验证和弦已更新
    expect(store.currentChord).not.toBe(initialChord)
  })
}) 