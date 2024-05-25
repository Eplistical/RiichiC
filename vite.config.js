import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'


// https://vitejs.dev/config/
export default defineConfig({
  base: '/RiichiC/', // for github page
  server: {
    proxy: {
      '/record_game_api': {
        target: 'https://uf7tin6si3sgnif7truyy3rrwm0kzqjd.lambda-url.us-east-2.on.aws',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/upload_game_api/, '')
      },
      '/list_games_api': {
        target: 'https://uf7tin6si3sgnif7truyy3rrwm0kzqjd.lambda-url.us-east-2.on.aws',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/list_games_api/, '')
      },
      '/get_stats_api': {
        target: 'https://uf7tin6si3sgnif7truyy3rrwm0kzqjd.lambda-url.us-east-2.on.aws',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/get_stats_api/, '')
      },
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
})
