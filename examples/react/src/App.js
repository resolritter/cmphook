import React from "react"
import { useHooks, newKey, createNewHook } from "../../../src/hooks.js"
import { getCounterMessage, getTickMessage, getTockMessage, getHookMessage } from "../../shared/utils.js"

const useRenderCounter = createNewHook(function (h) {
  const { get, set } = h.useRef(0)
  const newValue = get() + 1
  set(newValue)
  return newValue
})

class Subscribed extends React.Component {
  constructor(props) {
    super(props)
    this.value = props.initialValue
  }
  shouldComponentUpdate() {
    return false
  }
  componentDidMount() {
    this.id = newKey()
    this.unsubscribe = this.props.subscribe((newValue) => {
      this.value = newValue
      this.forceUpdate()
    })
    this.forceUpdate()
  }
  componentWillUnmount() {
    this.unsubscribe()
  }
  render() {
    if (!this.id) {
      return null
    }
    return (
      <this.props.Component
        value={this.value}
        id={this.id}
        update={() => {
          this.forceUpdate()
        }}
      />
    )
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
        {getCounterMessage(
          renderCount,
          getTockMessage(value),
        )}
      </p>
      <p>
        {getHookMessage.useMemo(memoValue, memoCount.get())}
      </p>
    </div>
  )
}

function Tick({ value, id, update }) {
  const h = useHooks(id)
  const renderCount = useRenderCounter(h)
  const { get, set } = h.useState(0, update)

  return (
    <div>
      <p>{getCounterMessage(renderCount, getTickMessage(value))}</p>
      <div className="triggerUpdateRow">
        <span>{getHookMessage.useState(get())}</span>
        <button
          onClick={function () {
            set(get() + 1)
          }}
        >
          Increment useState (triggers render)
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

  return (
    <main>
      <section>
        <b>Ticker</b>
        <Subscribed Component={Tick} {...tick.childProps()} />
      </section>
      <section>
        <b>Ticker (child 2)</b>
        <Subscribed Component={Tick} {...tick.childProps()} />
      </section>
      <section>
        <b>Tocker</b>
        <Subscribed Component={Tock} {...tock.childProps()} />
      </section>
      <section>
        <p><b>Parent</b></p>
        {getCounterMessage(renderCount)}
      </section>
    </main>
  )
}

export default App
