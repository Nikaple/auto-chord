import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isMobile, hasTouchScreen } from '../../../src/services/deviceDetection'

describe('设备检测服务', () => {
  // 保存原始用户代理和navigator.maxTouchPoints
  const originalUserAgent = navigator.userAgent
  const originalMaxTouchPoints = navigator.maxTouchPoints
  
  // 模拟window.ontouchstart
  let ontouchstartDescriptor: PropertyDescriptor | undefined
  
  beforeEach(() => {
    // 在每个测试前保存ontouchstart的属性描述符
    ontouchstartDescriptor = Object.getOwnPropertyDescriptor(window, 'ontouchstart')
  })
  
  afterEach(() => {
    // 测试后恢复原始用户代理
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    })
    
    // 恢复原始maxTouchPoints
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: originalMaxTouchPoints,
      configurable: true
    })
    
    // 恢复原始ontouchstart
    if (ontouchstartDescriptor) {
      Object.defineProperty(window, 'ontouchstart', ontouchstartDescriptor)
    } else {
      // 如果原来没有这个属性，则删除它
      delete window.ontouchstart
    }
  })
  
  describe('isMobile', () => {
    it('移动设备用户代理返回true', () => {
      const mobileUserAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15',
        'Mozilla/5.0 (Linux; Android 9; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34',
        'Mozilla/5.0 (iPod touch; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15'
      ]
      
      mobileUserAgents.forEach(ua => {
        Object.defineProperty(navigator, 'userAgent', {
          value: ua,
          configurable: true
        })
        expect(isMobile()).toBe(true)
      })
    })
    
    it('桌面设备用户代理返回false', () => {
      const desktopUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)'
      ]
      
      desktopUserAgents.forEach(ua => {
        Object.defineProperty(navigator, 'userAgent', {
          value: ua,
          configurable: true
        })
        expect(isMobile()).toBe(false)
      })
    })
  })
  
  describe('hasTouchScreen', () => {
    it('当window.ontouchstart存在时返回true', () => {
      // 模拟存在触摸事件
      Object.defineProperty(window, 'ontouchstart', {
        value: vi.fn(),
        configurable: true
      })
      
      // 确保maxTouchPoints为0，这样我们可以确定结果是基于ontouchstart
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true
      })
      
      expect(hasTouchScreen()).toBe(true)
    })
    
    it('当navigator.maxTouchPoints > 0时返回true', () => {
      // 确保ontouchstart不存在
      // 使用类型断言告诉TypeScript我们知道自己在做什么
      (delete window.ontouchstart);
      
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true
      })
      
      expect(hasTouchScreen()).toBe(true)
    })
    
    it('当没有触摸功能时返回false', () => {
      // 确保ontouchstart不存在
      // 使用类型断言告诉TypeScript我们知道自己在做什么
      (delete window.ontouchstart);
      
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true
      })
      
      expect(hasTouchScreen()).toBe(false)
    })
  })
}) 