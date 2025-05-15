import { config } from '@vue/test-utils'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faVolumeHigh, faVolumeLow, faVolumeXmark } from '@fortawesome/free-solid-svg-icons'

// 添加图标到库中
library.add(faVolumeHigh, faVolumeLow, faVolumeXmark)

// 模拟 FontAwesomeIcon 组件
const FontAwesomeIcon = {
  name: 'FontAwesomeIcon',
  props: ['icon'],
  template: '<span data-testid="icon">{{ icon[1] }}</span>'
}

// 全局注册 FontAwesomeIcon 组件
config.global.components = {
  'font-awesome-icon': FontAwesomeIcon
} 