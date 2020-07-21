import m from "mithril"
import App from "./App.js"

if (module.hot) {
  module.hot.accept()
}

m.mount(document.body.querySelector("#app"), App)
