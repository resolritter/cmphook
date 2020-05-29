import m from "mithril"
import { useHooks, newHookKey } from "../../src/hooks.js"

function C() {
  const id = newHookKey()
  let unsubscribe
  function render(C, value) {
    return m(C, { value, id })
  }
  return {
    oninit(v) {
      unsubscribe = v.attrs.subscribe(function (newValue) {
        m.render(v.dom, render(v.attrs.C, newValue))
      })
    },
    onbeforeupdate() {
      return false
    },
    onremove() {
      unsubscribe()
    },
    view(v) {
      return render(v.attrs.C, v.attrs.initialValue)
    },
  }
}

function Tock() {
  return {
    view({ attrs: { value } }) {
      return m("span", `Tock ${value}`)
    },
  }
}

function Tick() {
  let h, state
  function getValue(v) {
    return window[v.attrs.id]
  }
  function tree(value) {
    return [
      m("span", `Tick ${value}`),
      m("span", `Sibling: ${state.get()}`),
      m("button", {
        onclick: function (e) {
          e.redraw = false
          state.set(state.get() + 1)
        },
      }, "Increment sibling"),
    ]
  }
  return {
    oninit(v) {
      h = useHooks(v.attrs.id)
      state = h.useState(0, function () {
        m.render(v.dom, tree(getValue(v)))
      })
    },
    view(v) {
      window[v.attrs.id] = v.attrs.value
      return m("div", tree(v.attrs.value))
    },
  }
}

let tickTock = 0
export default function () {
  let tickTockInterval, h, tick, tock
  return {
    oninit() {
      h = useHooks("app")
      tick = h.useContext("tick", 0)
      tock = h.useContext("tock", 0)
      tickTockInterval = setInterval(function () {
        tickTock++
        if (tickTock % 2) {
          tock.set(tock.get() + 1)
        } else {
          tick.set(tick.get() + 1)
        }
      }, 2000)
    },
    onremove() {
      window.clearInterval(tickTockInterval)
    },
    view() {
      return m("div", [
        m(C, { ...tick.childProps(), C: Tick }),
        m(C, { ...tock.childProps(), C: Tock }),
      ])
    },
  }
}
