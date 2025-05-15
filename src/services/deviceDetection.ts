/**
 * 设备检测服务
 * 用于检测当前设备类型及特性
 */

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const hasTouchScreen = (): boolean => {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
};

export default {
  isMobile,
  hasTouchScreen
}; 