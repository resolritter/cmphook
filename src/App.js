import React, { useRef, useState, useEffect } from "react"
import "./App.css"
import { makeHook, makeHooks } from "./hooks"

const useRenderCounter = makeHook(function({ uuseRef }, uniqueId) {
  const count = uuseRef(0)
  count.current += 1
  return count.current
})

function counterMessageOf(renderCount, prepend = "") {
  return `${prepend}I've been called ${renderCount} times.`
}

// High-order component which sets up the subscription on behalf it child
function makeSubscriber(HookedComponent) {
  function childOf(value, uniqueId) {
    return <HookedComponent value={value} uniqueId={uniqueId} />
  }
  return React.memo(
    function({ subscribe, initialValue, uniqueId }) {
      const [child, setChild] = useState(childOf(initialValue, uniqueId))
      subscribe(uniqueId, function(value) {
        setChild(childOf(value, uniqueId))
      })

      return child
    },
    function alwaysSkipRenderFromProps() {
      return true
    },
  )
}

function usePropsSubscription(initialValue) {
  const [value, setValue] = useState(initialValue)
  // `Map` is used instead of an object because it provides dynamic lookup _on
  // demand_, as opposed to an object, where its value would be captured by the
  // returned closure. Map's dynamicness also allows the children's setters to
  // easily be refreshed without needing to resubscribe - their value is always
  // looked up dynamically, thus it can be updated at any point.
  const listeners = useRef(new Map())

  return [
    value,
    function notifyAndSet(newValue) {
      listeners.current.forEach(function(notify) {
        notify(newValue)
      })
      setValue(newValue)
    },
    function(key, notificationCallback) {
      listeners.current.set(key, notificationCallback)
    },
  ]
}

const Tock = makeSubscriber(function({ value, uniqueId }) {
  const hooks = makeHooks(uniqueId)
  const { uuseRef, uuseMemo } = hooks
  const renderCount = useRenderCounter(hooks)
  const refValue = uuseRef(0)
  const mappedValue = uuseMemo(
    function(value) {
      return value * 2
    },
    [value],
  )
  return (
    <div>
      <div>
        {counterMessageOf(
          renderCount,
          `Tock #${value} received. Derived ${mappedValue} from it. `,
        )}
      </div>
    </div>
  )
})

const Tick = makeSubscriber(function({ value, uniqueId }) {
  const hooks = makeHooks(uniqueId)
  const renderCount = useRenderCounter(hooks)
  return (
    <div>
      <div>{counterMessageOf(renderCount, `Tick #${value} received. `)}</div>
    </div>
  )
})

let tickTock = 0
function App() {
  const hooks = makeHooks("app")
  const [tick, setTick, subscribeToTick] = usePropsSubscription(0)
  const [tock, setTock, subscribeToTock] = usePropsSubscription(0)
  const renderCount = useRenderCounter(hooks)

  // `setTock` and `setTick` will trigger an update every two seconds;
  // This would otherwise cause the whole tree to be re-rendered, but
  // since tick and tock are totally disconnected, that isn't very convenient.
  useEffect(
    function() {
      setTimeout(function() {
        tickTock++
        if (tickTock % 2) {
          setTock(tock + 1)
        } else {
          setTick(tick + 1)
        }
      }, 2000)
    },
    [tick, tock, setTick, setTock],
  )

  // It is relevant for each children have their own key, so that
  // the notification can always reach only the affected components.
  return (
    <div className="App">
      <b>Ticker (Child)</b>
      <Tick subscribe={subscribeToTick} initialValue={tick} uniqueId={1} />
      <b>Ticker (Child 2)</b>
      <Tick subscribe={subscribeToTick} initialValue={tick} uniqueId={2} />
      <b>Tocker (Child)</b>
      <Tock subscribe={subscribeToTock} initialValue={tock} uniqueId={3} />
      <b>Parent</b>
      <br />
      {counterMessageOf(renderCount)}
      <hr />
      <p style={{ marginBottom: 0 }}>The example above showcases:</p>
      <ul style={{ listStyle: "inside", margin: 0 }}>
        <li>
          How a re-render on a parent component is <b>not</b> triggering updates
          on all the children.
        </li>
        <li>Multiple children depending on the same "prop".</li>
        <li>
          Although skipping renders is also possible with{" "}
          <code>componentDidUpdate</code> on class components, it'd mean losing
          the ability to use hooks directly in the host HOC.
        </li>
      </ul>
    </div>
  )
}

export default App
