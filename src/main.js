import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/base.css'
import './assets/shared.css'
import { useReferences } from './stores/useReferences'
import { useNotifications } from './stores/useNotifications'

createApp(App).use(i18n).use(router).mount('#app')

// Ma'lumotnomalarni fonda yuklaymiz. Server javob bermasa yoki ro'yxati to'liq
// bo'lmasa — ekranlar loyihadagi ro'yxatda ishlayveradi (dizayn o'zgarmaydi).
useReferences().load()
useNotifications().load()
