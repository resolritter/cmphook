import m from "mithril"
import { useHooks, newHookKey, newHook } from "../../src/hooks.js"

const useRenderCounter = newHook(function (h) {
  const { get, set } = h.useRef(0)
  const newValue = get() + 1
  set(newValue)
  return newValue
})

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
  let h, renderCount
  return {
    view(v) {
      h = useHooks(v.attrs.id)
      renderCount = useRenderCounter(h)
      return m("span", `Tock ${v.attrs.value} has been rendered ${renderCount} times.`)
    },
  }
}

function Tick() {
  let h, state, renderCounter
  // hack for getting the latest value, otherwise `render` would capture an outdated value
  function getLastVNodeValue(v) {
    return window[v.attrs.id]
  }
  function render(value) {
    const renderCount = renderCounter.get() + 1
    renderCounter.set(renderCount)
    return [
      m("span", `Tick ${value} has been rendered ${renderCount} times. `),
      m("span", `useState value: ${state.get()} `),
      m("button", {
        onclick: function () {
          state.set(state.get() + 1)
        },
      }, "Increment useState (triggers render)"),
    ]
  }
  return {
    view(v) {
      window[v.attrs.id] = v.attrs.value
      h = useHooks(v.attrs.id)
      state = h.useState(0, function () {
        m.render(v.dom, render(getLastVNodeValue(v)))
      })
      renderCounter = h.useRef(0)
      return m("div", render(v.attrs.value))
    },
  }
}

let tickTock = 0
export default function () {
  let tickTockInterval, h, tick, tock
  return {
    oninit() {
      // parent can declare hooks only once because it's not using the values in
      // the view; otherwise, those hooks would need to be moved to the view
      // method
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
        m(C, { C: Tick, ...tick.childProps() }),
        m(C, { C: Tock, ...tock.childProps() }),
      ])
    },
  }
}
