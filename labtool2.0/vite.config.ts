import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { transformWithOxc } from 'vite'
import { execSync } from 'child_process'

// Shown in the browser console when VITE_SHOW_VERSION is set (see src/App.jsx). Docker builds have no
// .git directory, so GIT_REVISION can be passed in as an environment variable instead.
const gitRevision = () => {
  if (process.env.GIT_REVISION) {
    return process.env.GIT_REVISION
  }
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch (e) {
    return 'unknown'
  }
}

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
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __GIT_REVISION__: JSON.stringify(gitRevision())
  },
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
