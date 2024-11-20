// @ts-check
const eslint = require('@eslint/js');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 12,
      globals: {
        node: true,
        commonjs: true,
        es2021: true,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      eqeqeq: 'error',
      curly: 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
    ignores: ['node_modules'],
  },
];
