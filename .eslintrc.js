// Note(alichry, 2025): Embedded the @remy/eslint/cra configuration here
//module.exports = Object.assign({}, require('@remy/eslint/cra'), {
//});

module.exports = {
    extends: [
      'eslint-config-react-app',
      "prettier"
    ],
    env: {
      es6: true,
      node: true,
    },
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 8,
      ecmaFeatures: {
        jsx: true,
      },
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      semi: ['error', 'always'],
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-undef': 'error',
    },
};


// "extends": [
//   "plugin:prettier/recommended"
// ],
// "rules": {
//   "prettier/prettier": ["error", {
//     "arrowParens": "avoid",
//     "bracketSpacing": true,
//     "jsxBracketSameLine": false,
//     "parser": "babylon",
//     "printWidth": 80,
//     "proseWrap": "preserve",
//     "semi": true,
//     "singleQuote": true,
//     "tabWidth": 2,
//     "trailingComma": "es5",
//     "useTabs": false,
//   }]
// }
