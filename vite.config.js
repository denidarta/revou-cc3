import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: '@testing-library/jest-dom/vitest',
    // Node 25+ ships a global localStorage that shadows jsdom's and lacks clear()
    poolOptions: {
      forks: {
        execArgv: Number(process.versions.node.split('.')[0]) >= 25 ? ['--no-experimental-webstorage'] : [],
      },
    },
  },
})
