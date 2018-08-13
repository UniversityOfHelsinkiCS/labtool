module.exports = {
  env: {
    es6: true,
    jest: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2017
  },
  extends: 'airbnb-base',
  rules: {
    quotes: ['warn', 'single'],
    indent: ['warn', 2, { SwitchCase: 1 }],
    semi: ['error', 'never'],
    'comma-dangle': ['warn', 'never'],
    'max-len': ['warn', 120],
    'function-paren-newline': 'off',

    'spaced-comment': 'warn',

    'no-useless-computed-key': 'warn',
    'no-useless-concat': 'warn',
    'no-useless-constructor': 'warn',
    'no-useless-escape': 'warn',

    'object-curly-spacing': 'warn',
    'object-curly-newline': 'off',
    curly: 'off',
    'arrow-body-style': 'warn',
    'arrow-parens': 'warn',
    'import/no-mutable-exports': 'warn',
    'import/no-named-as-default': 'warn',
    'no-underscore-dangle': 'warn',
    'quote-props': 'warn',
    'func-names': 'off',

    'no-use-before-define': 'off',
    'no-shadow': 'warn',

    'no-multi-spaces': 'warn',
    'no-irregular-whitespace': 'warn',
    'import/first': 'warn',
    'no-restricted-syntax': 'warn',
    'vars-on-top': 'warn',
    'no-prototype-builtins': 'warn',
    'no-extra-semi': 'warn',
    'prefer-destructuring': 'warn',
    'prefer-template': 'warn',
    'no-else-return': 'warn',
    'padded-blocks': 'warn',
    'eol-last': 'warn',
    'no-param-reassign': 'warn',
    'consistent-return': 'warn',
    'comma-spacing': 'warn',
    'class-methods-use-this': 'warn',
    'no-plusplus': 'warn',
    'array-callback-return': 'warn',
    'guard-for-in': 'warn',
    'import/prefer-default-export': 'warn',
    'no-nested-ternary': 'warn',
    'block-scoped-var': 'warn',
    complexity: ['off', 11],
    'dot-notation': ['warn', { allowKeywords: true }],
    radix: 'warn',
    'no-const-assign': 'warn',
    'prefer-const': ['warn', {
      destructuring: 'any',
      ignoreReadBeforeAssign: true
    }],
    'no-var': 'warn'
  }
}
