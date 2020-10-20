module.exports = {
  extends: ['airbnb', 'prettier', 'prettier/react'],
  parser: 'babel-eslint',
  plugins: ['prettier'],
  env: {
    browser: true,
    jest: true,
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js'] }],
    'prettier/prettier': ['error', { singleQuote: true }],
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/label-has-associated-control': [
      2,
      {
        labelComponents: ['label'],
        labelAttributes: ['htmlFor'],
        controlComponents: ['input'],
      },
    ],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        specialLink: ['to'],
      },
    ],
    'import/no-named-as-default': 'off',
  },
  settings: {
    react: {
      version: '16.0',
    },
  },
};
