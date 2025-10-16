/** @type {import('prettier').Config} */
export default {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  
  // Line formatting
  printWidth: 80,
  endOfLine: 'lf',
  
  // JSX formatting
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // Plugin configurations
  plugins: ['prettier-plugin-tailwindcss'],
  
  // Tailwind CSS class sorting
  tailwindConfig: './tailwind.config.js',
  tailwindFunctions: ['clsx', 'cn', 'cva'],
  
  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
  ],
};
