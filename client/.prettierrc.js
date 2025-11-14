module.exports = {
  // 基本格式化选项
  printWidth: 100, // 每行最大长度
  tabWidth: 2, // 缩进宽度
  useTabs: false, // 使用空格而不是制表符
  semi: true, // 语句末尾添加分号
  singleQuote: true, // 使用单引号
  quoteProps: 'as-needed', // 对象属性引号按需添加
  
  // JSX 相关
  jsxSingleQuote: false, // JSX 中使用双引号
  
  // 尾随逗号
  trailingComma: 'es5', // 在 ES5 中有效的尾随逗号（对象、数组等）
  
  // 空格
  bracketSpacing: true, // 对象字面量的大括号间添加空格
  bracketSameLine: false, // JSX 标签的 > 不与最后一个属性同行
  
  // 箭头函数参数括号
  arrowParens: 'avoid', // 单参数箭头函数不使用括号
  
  // 换行符
  endOfLine: 'lf', // 使用 LF 换行符
  
  // 嵌入式语言格式化
  embeddedLanguageFormatting: 'auto',
  
  // HTML 相关
  htmlWhitespaceSensitivity: 'css',
  
  // 插件和覆盖
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
  ],
};
