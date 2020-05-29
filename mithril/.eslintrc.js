module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  globals: {
    "m": true,
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 9,
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "comma-dangle": ["error", "always-multiline"],
    "linebreak-style": ["error", "unix"],
    "no-unused-vars": ["warn"],
    "no-console": 0,
    "rest-spread-spacing": ["error", "never"],
  },
}
