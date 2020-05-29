import "core-js/stable"
import "regenerator-runtime/runtime"

import "./app.scss"
import App from "./app.js"

if (module.hot) {
  module.hot.accept()
}

const $root = document.body.querySelector("#root")
m.mount($root, App)
