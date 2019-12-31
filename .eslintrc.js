module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },

  globals: {
    Raven: true,
    localforage: true
  },

  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true
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
  },
  "settings": {
    "react": {
      "createClass": "createReactClass", // Regex for Component Factory to use,
                                         // default to "createReactClass"
      "pragma": "React",  // Pragma to use, default to "React"
      "version": "detect", // React version. "detect" automatically picks the version you have installed.
                           // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
                           // default to latest and warns if missing
                           // It will default to "detect" in the future
      "flowVersion": "0.53" // Flow version
    },
    "propWrapperFunctions": [
        // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn't set, any propTypes wrapped in a function will be skipped.
        "forbidExtraProps",
        {"property": "freeze", "object": "Object"},
        {"property": "myFavoriteWrapper"}
    ],
    "linkComponents": [
      // Components used as alternatives to <a> for linking, eg. <Link to={ url } />
      "Hyperlink",
      {"name": "Link", "linkAttribute": "to"}
    ]
  }
}
