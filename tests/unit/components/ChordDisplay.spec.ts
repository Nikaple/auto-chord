
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChordDisplay from '../../../src/components/ChordDisplay.vue'

// 定义和弦类型
interface MockChord {
  root: { name: string };
  octave: number;
  type: string;
  noteNames: string[];
  setInversion: ReturnType<typeof vi.fn>;
  getInversionNotation: () => string;
}

type ChordState = MockChord | null;

// 模拟和弦对象
const mockChords: Record<string, ChordState> = {
  none: null,
  major: {
    root: { name: 'C' },
    octave: 4,
    type: 'major',
    noteNames: ['C4', 'E4', 'G4'],
    setInversion: vi.fn(),
    getInversionNotation: () => 'C/E'
  },
  minor: {
    root: { name: 'C' },
    octave: 4,
    type: 'minor',
    noteNames: ['C4', 'Eb4', 'G4'],
    setInversion: vi.fn(),
    getInversionNotation: () => 'Cm/Eb'
  }
}

// 当前模拟的和弦
let currentMockChord: ChordState = mockChords.none;
let currentMockInversion = 1
const currentMockKey = 'C'

// 模拟 chordStore
vi.mock('@/stores/chordStore', () => {
  return {
    useChordStore: () => ({
      get currentChord() {
        return currentMockChord
      },
      get currentInversion() {
        return currentMockInversion
      },
      currentKey: currentMockKey
    })
  }
})

// 模拟工具函数
vi.mock('@/utils/music', () => {
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
    getInterval: vi.fn(),
    Chord: vi.fn().mockImplementation((root, octave, type) => ({
      root: { name: root },
      octave: octave,
      type: type,
      noteNames: [`${root}${octave}`, 'E4', 'G4'],
      setInversion: vi.fn(),
      getInversionNotation: vi.fn(() => `${root}/${root === 'C' ? 'E' : 'B'}`)
    }))
  }
})

vi.mock('@/utils/chordUtils', () => {
  return {
    getChordTypeLabel: vi.fn((type: string) => {
      const labels: Record<string, string> = {
        'major': '大三和弦',
        'minor': '小三和弦',
        'dominant_seventh': '属七和弦'
      }
      return labels[type] || '未知和弦类型'
    }),
    getShortNoteName: vi.fn((name) => name.charAt(0))
  }
})

describe('ChordDisplay 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 重置为默认值
    currentMockChord = mockChords.none
    currentMockInversion = 1
  })
  
  it('当无和弦时应显示提示信息', () => {
    // 使用默认的null和弦
    const wrapper = mount(ChordDisplay)
    
    // 检查是否显示提示信息
    expect(wrapper.find('.no-chord').exists()).toBe(true)
    expect(wrapper.find('.no-chord p').text()).toContain('点击或按键播放和弦')
  })
  
  it('当有和弦时应显示和弦信息', () => {
    // 设置为大三和弦
    currentMockChord = mockChords.major
    
    const wrapper = mount(ChordDisplay)
    
    // 应显示和弦信息区域
    expect(wrapper.find('.chord-info').exists()).toBe(true)
    
    // 应显示和弦名称
    expect(wrapper.find('.chord-name').exists()).toBe(true)
    
    // 应显示和弦音符
    expect(wrapper.find('.chord-notes').exists()).toBe(true)
    
    // 应显示和弦类型
    expect(wrapper.find('.chord-type').exists()).toBe(true)
    
    // 应显示和弦转位
    expect(wrapper.find('.chord-inversion').exists()).toBe(true)
  })
  
  it('应正确显示和弦转位标记', () => {
    // 设置为大三和弦
    currentMockChord = mockChords.major
    
    const wrapper = mount(ChordDisplay)
    
    // 检查和弦名称，应为C/E (第一转位)
    expect(wrapper.find('.chord-name').text()).toBe('C/E')
  })
  
  it('应正确显示和弦音符', () => {
    // 设置为大三和弦
    currentMockChord = mockChords.major
    
    const wrapper = mount(ChordDisplay)
    
    // 检查是否正确显示音符
    const notes = wrapper.findAll('.note')
    expect(notes.length).toBe(3) // C4, E4, G4
  })
  
  it('应正确显示和弦类型', () => {
    // 设置为大三和弦
    currentMockChord = mockChords.major
    
    const wrapper = mount(ChordDisplay)
    
    // 检查是否正确显示类型
    expect(wrapper.find('.chord-type-label').text()).toBe('大三和弦')
  })
  
  it('应正确显示转位标签', () => {
    // 设置为大三和弦
    currentMockChord = mockChords.major
    
    const wrapper = mount(ChordDisplay)
    
    // 检查转位标签，应为第一转位
    expect(wrapper.find('.chord-inversion-label').text()).toBe('第一转位')
  })
  
  it('当和弦类型改变时应更新显示', async () => {
    // 先渲染大三和弦
    currentMockChord = mockChords.major
    
    mount(ChordDisplay)
    
    // 改变为小三和弦
    currentMockChord = mockChords.minor
    
    // 强制重新渲染组件
    const updatedWrapper = mount(ChordDisplay)
    
    // 检查是否更新了类型
    expect(updatedWrapper.find('.chord-type-label').text()).toBe('小三和弦')
  })
}) 