module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'react-app', // 使用 Create React App 的默认配置
  ],
  rules: {
    // 最基本的规则
    'no-console': 'off',
    'no-debugger': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
  ignorePatterns: [
    'build/',
    'dist/',
    'node_modules/',
    '*.config.js',
    'public/',
  ],
};
