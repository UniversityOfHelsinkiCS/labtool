import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { transformWithOxc } from 'vite'

const transformJsxInJs = () => ({
  name: 'transform-jsx-in-js',
  enforce: 'pre',
  async transform(code: string, id: string) {
    if (!id.match(/.*\.js$/)) {
      return null
    }

    return await transformWithOxc(code, id, {
      lang: 'jsx'
    })
  }
})

export default defineConfig(({ command }) => ({
  // Production serves the app under /labtool (see the routes in src/App.jsx), and
  // the ingress strips that prefix before it reaches this container. The dev
  // server serves from the root, which is what CRA's PUBLIC_URL used to express.
  base: command === 'build' ? '/labtool/' : '/',
  plugins: [react({ jsxRuntime: 'classic' }), transformJsxInJs()],
  build: {
    outDir: 'build'
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js']
  },
  legacy: {
    inconsistentCjsInterop: true
  }
}))
