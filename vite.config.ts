import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // GitHub Pages живёт на подпути /design-portfolio/, dev-сервер — на корне
  base: command === 'build' ? '/design-portfolio/' : '/',
  plugins: [react()],
}))
