const path = require('path');
const pkg = require('./package.json');

const aliases = Object.entries(pkg._moduleAliases || {}).map((e) => [
  e[0],
  path.resolve(__dirname, e[1]),
]);

module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-underscore-dangle': [
      'error',
      {
        allow: ['_moduleAliases'],
      },
    ],
    'import/no-extraneous-dependencies': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-return-assign': ['error', 'except-parens'],
    'no-cond-assign': ['error', 'except-parens'],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'max-len': ['off'],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: aliases,
        extensions: ['.js', 'json'],
      },
    },
  },
};
