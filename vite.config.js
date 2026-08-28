import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

/*
  Ishlab chiqish serveri API'ni o'zi orqali uzatadi (proxy).

  Nega kerak: API ngrok tunneli ortida turganda ngrok bepul tarifi brauzerdan
  kelgan har bir so'rovga ogohlantirish sahifasini (ERR_NGROK_6024) qaytaradi.
  U HTML va unda CORS sarlavhasi yo'q, shuning uchun brauzer so'rovni bloklaydi.
  Ogohlantirishni `ngrok-skip-browser-warning` sarlavhasi o'chiradi, lekin uni
  brauzerdan yubora olmaymiz: server preflight'da bu sarlavhaga ruxsat bermaydi.

  Proxy shu tugunni yechadi — brauzer o'z manziliga (localhost:5173) so'raydi,
  ya'ni CORS umuman qatnashmaydi, sarlavhani esa Vite server tomonda qo'shadi.

  Ishlatish: `.env` da manzilni nisbiy qoldiring, masalan VITE_API_URL=/api/v1
  Ish serveriga to'g'ridan-to'g'ri ulanmoqchi bo'lsangiz to'liq manzil yozing —
  u holda proxy chetlab o'tiladi.
*/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const target = env.VITE_API_PROXY || 'https://pinchable-semitruthfully-delma.ngrok-free.dev'

  return {
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // barcha tarmoq interfeyslarida tinglaydi — ilovani telefondan yoki
    // hamkasbning kompyuteridan http://<shu mashina IP>:5173 orqali ochish
    // mumkin bo'ladi. Vite ishga tushganda Network manzilini o'zi yozib beradi.
    host: true,
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target,
        changeOrigin: true,
        // ngrok ogohlantirish sahifasi o'rniga haqiqiy javob kelsin
        headers: { 'ngrok-skip-browser-warning': '1' },
        // SSE uchun: javob bo'lak-bo'lak kelsin, yig'ilib qolmasin
        selfHandleResponse: false
      },
      '/media': {
        target,
        changeOrigin: true,
        headers: { 'ngrok-skip-browser-warning': '1' }
      },
      /*
        Yuz tekshiruvi WebSocket'i. Brauzerdan tunnelga to'g'ridan-to'g'ri
        ulanib bo'lmaydi: ngrok ogohlantirish sahifasi qaytaradi (101 emas),
        WebSocket API'ga esa sarlavha qo'shib bo'lmaydi. Proxy uni server
        tomonda qo'shadi.
      */
      '/face-recog': {
        target,
        changeOrigin: true,
        ws: true,
        headers: { 'ngrok-skip-browser-warning': '1' }
      }
    }
  }
  }
})
