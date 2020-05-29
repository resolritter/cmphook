import React from "react"
import "./App.css"
import { useHooks, newHookKey, newHook } from "external_hooks"

const useRenderCounter = newHook(function (h, id) {
  const { get, set } = h.useRef(0)
  const newValue = get() + 1
  set(newValue)
  return newValue
})

function counterMessageOf(renderCount, prepend = "") {
  return `${prepend}I've been called ${renderCount} times.`
}

class C extends React.Component {
  constructor(props) {
    super(props)
    this.value = props.initialValue
  }
  shouldComponentUpdate() {
    return false
  }
  componentDidMount() {
    this.id = newHookKey("component")
    this.unsubscribe = this.props.subscribe((newValue) => {
      this.value = newValue
      this.forceUpdate()
    })
  }
  componentWillUnmount() {
    this.unsubscribe()
  }
  render() {
    return <this.props.C value={this.value} id={this.id} />
  }
}

let useMemoCounter = -1
function Tock({ value, id }) {
  const h = useHooks(id)
  const renderCount = useRenderCounter(h)
  const derivedValue = h.useMemo(
    function (value) {
      useMemoCounter++
      return value * 2
    },
    [value],
  )
  return (
    <div>
      {counterMessageOf(
        renderCount,
        `Tock #${value} received. useMemo value: ${derivedValue} has been calculated ${useMemoCounter} times. `,
      )}
    </div>
  )
}

function Tick({ value, id }) {
  const hooks = useHooks(id)
  const renderCount = useRenderCounter(hooks)
  return (
    <div>
      <div>{counterMessageOf(renderCount, `Tick #${value} received. `)}</div>
    </div>
  )
}

let tickTock = 0
const initialTick = 0, initialTock = 0
function App() {
  const h = useHooks("app")
  const tick = h.useContext("tick", initialTick)
  const tock = h.useContext("tock", initialTock)
  const renderCount = useRenderCounter(h)

  h.useEffect(
    function () {
      setInterval(function () {
        tickTock++
        if (tickTock % 2) {
          tock.set(tock.get() + 1)
        } else {
          tick.set(tick.get() + 1)
        }
      }, 2000)
    },
    [],
  )

  // It is relevant for each children have their own key, so that
  // the notification can always reach only the affected components.
  return (
    <div className="App">
      <b>Ticker (Child)</b>
      <C C={Tick} {...tick.childProps()} />
      <b>Ticker (Child 2)</b>
      <C C={Tick} {...tick.childProps()} />
      <b>Tocker (Child)</b>
      <C C={Tock} {...tock.childProps()} />
      <b>Parent</b>
      <br />
      {counterMessageOf(renderCount)}
      <hr />
      <p style={{ marginBottom: 0 }}>The example above showcases:</p>
      <ul style={{ listStyle: "inside", margin: 0 }}>
        <li>
          How Parent is not updating, since it isn't consuming the data itself, only hosting the context.
        </li>
        <li>Multiple children depending on the same "prop".</li>
      </ul>
    </div>
  )
}

export default App
