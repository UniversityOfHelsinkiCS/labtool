const js = require('@eslint/js')
const globals = require('globals')
const stylistic = require('@stylistic/eslint-plugin')

module.exports = [
  {
    ignores: ['node_modules/', 'migrations/', 'config/']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node }
    },
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['warn', 'single', { avoidEscape: true }],
      '@stylistic/indent': ['warn', 2, { SwitchCase: 1 }],
      '@stylistic/comma-dangle': ['warn', 'never'],
      '@stylistic/max-len': ['warn', 120],
      '@stylistic/object-curly-spacing': ['warn', 'always'],
      '@stylistic/comma-spacing': 'warn',
      '@stylistic/no-multi-spaces': 'warn',
      '@stylistic/padded-blocks': ['warn', 'never'],
      '@stylistic/eol-last': 'warn',
      '@stylistic/spaced-comment': 'warn',
      '@stylistic/arrow-parens': ['warn', 'as-needed', { requireForBlockBody: true }],
      '@stylistic/quote-props': ['warn', 'as-needed'],

      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|Sequelize', caughtErrors: 'none' }],
      'no-var': 'warn',
      'prefer-const': ['warn', { destructuring: 'any', ignoreReadBeforeAssign: true }],
      'prefer-template': 'warn',
      'no-else-return': 'warn',
      'no-shadow': 'warn',
      'no-param-reassign': 'warn',
      'consistent-return': 'warn',
      'array-callback-return': 'warn',
      'dot-notation': 'warn',
      radix: 'warn',
      'no-useless-escape': 'warn',
      'no-prototype-builtins': 'warn',
      'no-async-promise-executor': 'warn'
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: { globals: { ...globals.mocha } }
  }
]
