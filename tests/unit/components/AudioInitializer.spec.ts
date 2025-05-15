import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AudioInitializer from '../../../src/components/AudioInitializer.vue'

// 定义模拟值
const mockInitAudio = vi.fn().mockResolvedValue(true)
const mockIsSamplerLoaded = vi.fn().mockReturnValue(true)
let mockIsAudioInitialized = false

// 模拟 chordStore
vi.mock('@/stores/chordStore', () => {
  return {
    useChordStore: () => ({
      initAudio: mockInitAudio,
      audioSystem: {
        isSamplerLoaded: mockIsSamplerLoaded
      },
      get isAudioInitialized() {
        return mockIsAudioInitialized
      }
    })
  }
})

describe('AudioInitializer 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockIsAudioInitialized = false
    
    // 为每个测试单独设置 window.setTimeout 的模拟
    vi.spyOn(window, 'setTimeout')
    
    // 重置模拟函数的默认返回值
    mockInitAudio.mockResolvedValue(true)
    mockIsSamplerLoaded.mockReturnValue(true)
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })
  
  it('应正确渲染初始状态', () => {
    const wrapper = mount(AudioInitializer)
    
    expect(wrapper.find('.audio-initializer').exists()).toBe(true)
    expect(wrapper.find('.start-prompt').exists()).toBe(true)
    expect(wrapper.find('.loading-state').exists()).toBe(false)
    expect(wrapper.find('.error-state').exists()).toBe(false)
  })
  
  it('点击组件应触发音频初始化', async () => {
    const wrapper = mount(AudioInitializer)
    
    // 点击初始化按钮
    await wrapper.find('.audio-initializer').trigger('click')
    
    // 验证加载状态显示
    expect(wrapper.find('.loading-state').exists()).toBe(true)
    
    // 等待异步操作完成
    await flushPromises()
    
    // 验证初始化方法被调用
    expect(mockInitAudio).toHaveBeenCalled()
  })
  
  it('加载失败时应显示错误状态', async () => {
    // 修改模拟值为失败状态
    mockInitAudio.mockResolvedValueOnce(false)
    
    const wrapper = mount(AudioInitializer)
    
    // 点击初始化按钮
    await wrapper.find('.audio-initializer').trigger('click')
    
    // 等待异步操作完成
    await flushPromises()
    
    // 验证错误状态显示
    expect(wrapper.find('.error-state').exists()).toBe(true)
  })
  
  it.skip('采样器加载失败时应显示错误状态', async () => {
    // 修改模拟值：初始化成功但采样器未加载
    mockInitAudio.mockResolvedValueOnce(true)
    mockIsSamplerLoaded.mockReturnValue(false)
    
    const wrapper = mount(AudioInitializer)
    
    // 点击初始化按钮
    await wrapper.find('.audio-initializer').trigger('click')
    
    // 等待异步操作完成
    await flushPromises()
    
    // 验证错误状态显示
    expect(wrapper.find('.error-state').exists()).toBe(true)
  })
  
  it('加载超时时应显示错误状态', async () => {
    const wrapper = mount(AudioInitializer)
    
    // 点击初始化按钮
    await wrapper.find('.audio-initializer').trigger('click')
    
    // 验证超时计时器被设置
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 10000)
    
    // 获取超时函数并执行
    const timeoutFn = vi.mocked(setTimeout).mock.calls[0][0] as Function
    timeoutFn()
    
    // 强制渲染更新
    await wrapper.vm.$nextTick()
    
    // 验证错误状态显示
    expect(wrapper.find('.error-state').exists()).toBe(true)
  })
  
  it('加载过程中再次点击应无效', async () => {
    const wrapper = mount(AudioInitializer)
    
    // 点击初始化按钮
    await wrapper.find('.audio-initializer').trigger('click')
    
    // 清除测试记录
    mockInitAudio.mockClear()
    
    // 在加载状态再次点击
    await wrapper.find('.audio-initializer').trigger('click')
    
    // 验证初始化方法没有再次被调用
    expect(mockInitAudio).not.toHaveBeenCalled()
  })
  
  it('在卸载前应清除超时计时器', async () => {
    // 模拟 clearTimeout
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    
    const wrapper = mount(AudioInitializer)
    
    // 点击初始化按钮设置超时
    await wrapper.find('.audio-initializer').trigger('click')
    
    // 卸载组件
    wrapper.unmount()
    
    // 验证清除超时被调用
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})