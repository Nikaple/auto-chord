import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VolumeControl from '../../../src/components/VolumeControl.vue'

// 模拟FontAwesomeIcon组件
vi.mock('@fortawesome/vue-fontawesome', () => ({
  FontAwesomeIcon: {
    name: 'FontAwesomeIcon',
    props: ['icon'],
    template: '<span data-testid="icon">{{ icon[1] }}</span>'
  }
}))

describe('VolumeControl 组件', () => {
  it('应正确渲染组件', () => {
    const wrapper = mount(VolumeControl, {
      props: {
        volume: 0.5
      }
    })
    
    expect(wrapper.find('.volume-control').exists()).toBe(true)
    expect(wrapper.find('input[type="range"]').exists()).toBe(true)
  })
  
  it('输入范围的值应该等于传入的音量属性', () => {
    const volume = 0.75
    const wrapper = mount(VolumeControl, {
      props: {
        volume
      }
    })
    
    const rangeInput = wrapper.find('input[type="range"]')
    expect(rangeInput.attributes('value')).toBe(volume.toString())
  })
  
  it('当音量为0时应显示静音图标', () => {
    const wrapper = mount(VolumeControl, {
      props: {
        volume: 0
      }
    })
    
    expect(wrapper.find('[data-testid="icon"]').text()).toBe('volume-xmark')
  })
  
  it('当音量较低时应显示低音量图标', () => {
    const wrapper = mount(VolumeControl, {
      props: {
        volume: 0.3
      }
    })
    
    expect(wrapper.find('[data-testid="icon"]').text()).toBe('volume-low')
  })
  
  it('当音量较高时应显示高音量图标', () => {
    const wrapper = mount(VolumeControl, {
      props: {
        volume: 0.8
      }
    })
    
    expect(wrapper.find('[data-testid="icon"]').text()).toBe('volume-high')
  })
  
  it('滑动输入范围时应发出音量更改事件', async () => {
    const wrapper = mount(VolumeControl, {
      props: {
        volume: 0.5
      }
    })
    
    const rangeInput = wrapper.find('input[type="range"]')
    
    // 设置新值并触发输入事件
    await rangeInput.setValue(0.7)
    await rangeInput.trigger('input')
    
    // 检查是否发出了正确的事件
    const emitted = wrapper.emitted('volume-change')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0][0]).toBe(0.7)
  })
}) 