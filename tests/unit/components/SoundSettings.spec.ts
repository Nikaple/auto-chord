import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SoundSettings from '../../../src/components/SoundSettings.vue'

// 定义模拟函数
const mockApplySettings = vi.fn()
const mockGetSettings = vi.fn().mockReturnValue({
  volume: 0.7,
  release: 1.5,
  reverb: 0.3,
  brightness: 0.5,
  dynamics: 0.7
})

// 维护模拟状态
let mockAudioInitialized = true

// 模拟 chordStore
vi.mock('@/stores/chordStore', () => {
  return {
    useChordStore: () => ({
      get isAudioInitialized() {
        return mockAudioInitialized
      },
      audioSystem: {
        getSettings: mockGetSettings,
        applySettings: mockApplySettings
      }
    })
  }
})

describe('SoundSettings 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAudioInitialized = true
    
    // 模拟 setTimeout
    vi.useFakeTimers()
    vi.spyOn(window, 'setTimeout')
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })
  
  it('当采样器加载完成时应显示设置项', async () => {
    const wrapper = mount(SoundSettings)
    
    // 强制完成组件挂载
    await flushPromises()
    
    // 应显示各个设置项
    expect(wrapper.findAll('.setting-group').length).toBe(5)
    expect(wrapper.findAll('input[type="range"]').length).toBe(5)
  })
  
  it('当采样器未加载时应显示加载信息', async () => {
    // 修改 isAudioInitialized 为 false
    mockAudioInitialized = false
    
    const wrapper = mount(SoundSettings)
    
    await flushPromises()
    
    // 应显示加载信息
    expect(wrapper.find('.sampler-loading').exists()).toBe(true)
    expect(wrapper.find('.sampler-loading').text()).toContain('钢琴音色加载中')
    
    // 不应显示设置项
    expect(wrapper.find('.setting-group').exists()).toBe(false)
  })
  
  it('应正确初始化设置值', async () => {
    const wrapper = mount(SoundSettings)
    await flushPromises()
    
    // 检查是否从 getSettings 获取了初始值
    expect(mockGetSettings).toHaveBeenCalled()
    
    // 检查音量滑块值
    const volumeSlider = wrapper.findAll('input[type="range"]').at(0)
    expect((volumeSlider?.element as HTMLInputElement).value).toBe('0.7')
    
    // 检查混响滑块值
    const reverbSlider = wrapper.findAll('input[type="range"]').at(1)
    expect((reverbSlider?.element as HTMLInputElement).value).toBe('0.3')
  })
  
  it('更改设置值应更新音频设置', async () => {
    const wrapper = mount(SoundSettings)
    await flushPromises()
    
    // 获取音量滑块并更改值
    const volumeSlider = wrapper.findAll('input[type="range"]').at(0)
    
    // 清空之前的调用
    mockApplySettings.mockClear()
    
    // 设置新值并触发事件
    await volumeSlider?.setValue(0.8)
    await volumeSlider?.trigger('input')
    
    // 验证是否调用了 applySettings 方法，并传递正确的参数
    // 注意：input 值会被转为字符串类型，所以期望也是字符串
    expect(mockApplySettings).toHaveBeenCalledWith(expect.objectContaining({
      volume: '0.8'
    }))
  })
  
  it('应用预设应更新所有设置值', async () => {
    const wrapper = mount(SoundSettings)
    await flushPromises()
    
    // 点击"明亮"预设按钮
    const brightButton = wrapper.findAll('.preset-buttons button').find((button: { text: () => string }) => button.text() === '明亮')
    await brightButton?.trigger('click')
    
    // 验证是否更新了所有设置
    expect(mockApplySettings).toHaveBeenCalledWith({
      volume: 0.75,
      release: 1.2,
      reverb: 0.2,
      brightness: 0.8,
      dynamics: 0.8
    })
  })
  
  it('应正确检查采样器状态并定时更新', async () => {
    // 首先模拟未加载状态
    mockAudioInitialized = false
    
    const wrapper = mount(SoundSettings)
    await flushPromises()
    
    // 验证设置了超时检查
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000)
    
    // 更改为已加载状态
    mockAudioInitialized = true
    
    // 运行超时函数
    const timeoutFn = vi.mocked(setTimeout).mock.calls[0][0] as Function
    timeoutFn()
    
    // 在下一个周期检查DOM更新
    await wrapper.vm.$nextTick()
    
    // 现在应该显示设置项了
    expect(wrapper.find('.setting-group').exists()).toBe(true)
  })
  
  it('亮度值应显示相应的文本描述', async () => {
    const wrapper = mount(SoundSettings)
    await flushPromises()
    
    // 获取亮度滑块和显示元素
    const brightnessSlider = wrapper.findAll('input[type="range"]').at(3)
    const brightnessText = wrapper.findAll('.slider-container span').at(3)
    
    // 设置为暗
    await brightnessSlider?.setValue(0.3)
    expect(brightnessText?.text()).toBe('暗')
    
    // 设置为中性
    await brightnessSlider?.setValue(0.5)
    expect(brightnessText?.text()).toBe('中性')
    
    // 设置为亮
    await brightnessSlider?.setValue(0.7)
    expect(brightnessText?.text()).toBe('亮')
  })
  
  it('力度值应显示相应的文本描述', async () => {
    const wrapper = mount(SoundSettings)
    await flushPromises()
    
    // 获取力度滑块和显示元素
    const dynamicsSlider = wrapper.findAll('input[type="range"]').at(4)
    const dynamicsText = wrapper.findAll('.slider-container span').at(4)
    
    // 设置为柔和
    await dynamicsSlider?.setValue(0.2)
    expect(dynamicsText?.text()).toBe('柔和')
    
    // 设置为中等
    await dynamicsSlider?.setValue(0.5)
    expect(dynamicsText?.text()).toBe('中等')
    
    // 设置为强烈
    await dynamicsSlider?.setValue(0.8)
    expect(dynamicsText?.text()).toBe('强烈')
  })
}) 