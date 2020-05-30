import React from "react"
import "./App.css"
import { useHooks, newHookKey, newHook } from "hooker"

const useRenderCounter = newHook(function (h) {
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
    this.id = newHookKey()
    this.unsubscribe = this.props.subscribe((newValue) => {
      this.value = newValue
      this.forceUpdate()
    })
  }
  componentWillUnmount() {
    this.unsubscribe()
  }
  render() {
    return <this.props.C
      value={this.value}
      id={this.id}
      update={() => {
        this.forceUpdate()
      }}
    />
  }
}

function Tock({ value, id }) {
  const h = useHooks(id)
  const renderCount = useRenderCounter(h)
  const memoCount = h.useRef(0)
  const memoValue = h.useMemo(
    function (value) {
      memoCount.set(memoCount.get() + 1)
      return value * 2
    },
    [value],
  )
  return (
    <div>
      <p>
        {counterMessageOf(
          renderCount,
          `Tock #${value} received. `,
        )}
      </p>
      <p>
        {`useMemo value: ${memoValue} has been calculated ${memoCount.get()} times.`}
      </p>
    </div>
  )
}

function Tick({ value, id, update }) {
  const h = useHooks(id)
  const renderCount = useRenderCounter(h)
  const { get, set } = h.useState(0, update)
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <p>{counterMessageOf(renderCount, `Tick #${value} received. `)}</p>
      <div style={{ display: "flex" }}>
        <span style={{ paddingRight: "10px" }}>{`useState value: ${get()} `}</span>
        <button
          onClick={function () {
            set(get() + 1)
          }}
        >
          Increment (triggers an update)
        </button>
      </div>
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
        <li>Multiple "Tick" children depending on the same "prop".</li>
      </ul>
    </div>
  )
}

export default App
