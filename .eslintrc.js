module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'consistent-return': 'warn',
    'max-len': 'warn',
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'no-underscore-dangle': ['error', { 'allow': ['_id'] }],
  },
};
