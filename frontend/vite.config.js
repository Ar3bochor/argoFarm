// vite.config.js
import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/

export default defineConfig({
plugins: [WindiCSS()],
css: {
postcss: {
plugins: [autoprefixer()],
},
},
})