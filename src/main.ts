import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入 FontAwesome 图标库
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSliders, faVolumeHigh, faVolumeLow, faVolumeXmark } from '@fortawesome/free-solid-svg-icons'

// 导入样式
import './styles/main.css'
import './styles/responsive.css'
import './styles/mobile.css'

// 添加图标到库中
library.add(faSliders, faVolumeHigh, faVolumeLow, faVolumeXmark)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app') 