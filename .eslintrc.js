module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },

  globals: {
    React: true,
    Raven: true
  },

  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      jsx: true
    },
    sourceType: "module"
  },

  plugins: [
    "react"
  ],

  extends: ["eslint:recommended", "plugin:react/recommended"],

  rules: {
    "strict": 1,
    "no-console": 1,
    "no-alert": 1,
    "brace-style": 1,
    "no-undef": 1,
    "no-unused-vars": 1,
    "no-eval": 2,
    "no-with": 2,
    "yoda": 2,
    "no-self-compare": 2,
    "no-unexpected-multiline": 2,
    // REACT
    "react/jsx-uses-vars": 1,
    "react/prop-types": 0, // turn this on at a future time...
    "react/no-direct-mutation-state": 1,

  }
}
