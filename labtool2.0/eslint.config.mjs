import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
  {
    ignores: ['build/', 'node_modules/', 'public/']
  },
  js.configs.recommended,
  react.configs.flat.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node, __BUILD_TIME__: 'readonly', __GIT_REVISION__: 'readonly' }
    },
    plugins: { 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      'no-unused-vars': ['error', { caughtErrors: 'none' }]
    }
  },
  {
    files: ['src/tests/**/*.js', 'src/**/*.test.js', 'src/setupTests.js'],
    languageOptions: { globals: { ...globals.vitest } }
  },
  prettierRecommended
]
