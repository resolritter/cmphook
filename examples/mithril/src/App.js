import m from "mithril"
import { useHooks, newKey, createNewHook } from "../../../src/hooks.js"
import { getCounterMessage, getTickMessage, getTockMessage, getHookMessage } from "../../shared/utils.js"

const useRenderCounter = createNewHook(function (h) {
  const { get, set } = h.useRef(0)
  const newValue = get() + 1
  set(newValue)
  return newValue
})

function C() {
  const id = newKey()
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
    view({ attrs: { id, value } }) {
      h = useHooks(id)
      renderCount = useRenderCounter(h)
      return m("span", getCounterMessage(renderCount, getTockMessage(value)))
    },
  }
}

function Tick() {
  let h, state, renderCounter, parentValue
  function render() {
    const renderCount = renderCounter.get() + 1
    renderCounter.set(renderCount)
    const value = parentValue.get()
    return [
      m("p", getCounterMessage(renderCount, getTickMessage(value))),
      m(
        "div.triggerUpdateRow",
        [
          m("span", getHookMessage.useState(state.get())),
          m("button", {
            onclick: function () {
              state.set(state.get() + 1)
            },
          }, "Increment useState (triggers render)"),
        ],
      ),
    ]
  }
  return {
    view(v) {
      h = useHooks(v.attrs.id)
      parentValue = h.useRef(v.attrs.value)
      parentValue.set(v.attrs.value)
      state = h.useState(0, function () {
        m.render(v.dom, render())
      })
      renderCounter = h.useRef(0)
      return m("div", render())
    },
  }
}

let tickTock = 0
export default function () {
  let tickTockInterval, h, tick, tock, renderCount
  const key = newKey()
  return {
    onremove() {
      window.clearInterval(tickTockInterval)
    },
    view() {
      h = useHooks(key)
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
      renderCount = useRenderCounter(h)

      return m("div", [
        m("section", [
          m("p", m("b", "Ticker")),
          m(C, { C: Tick, ...tick.childProps() }),
        ]),
        m("section", [
          m("p", m("b", "Ticker (child 2)")),
          m(C, { C: Tick, ...tick.childProps() }),
        ]),
        m("section", [
          m("p", m("b", "Tocker")),
          m(C, { C: Tock, ...tock.childProps() }),
        ]),
        m("section", [
          m("p", m("b", "Parent")),
          m("span", getCounterMessage(renderCount)),
        ]),
      ])
    },
  }
}
