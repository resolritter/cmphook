import { increment, newHookFactory } from "./testHelpers.js"
import { newHook, newHookKey, useHooks } from "./hooks.js"

// Each call to useHooks in this file represents another re-render
describe("useReducer", function () {
  let useHooks
  beforeEach(function () {
    useHooks = newHookFactory("useReducer")
  })
  it("reduces an add", function () {
    const initialState = 0
    const triggerUpdate = jest.fn()
    const { get, dispatch } = useHooks().useReducer(
      function (state, action) {
        switch (action.type) {
          case "ADD": {
            return increment(state)
          }
          default:
            break
        }

        return state
      },
      initialState,
      triggerUpdate,
    )
    expect(get()).toBe(initialState)
    dispatch({ type: "ADD" })
    const incremented = increment(initialState)
    expect(get()).toBe(incremented)
    expect(triggerUpdate.mock.calls.length).toBe(1)
    expect(triggerUpdate.mock.calls[0]).toEqual([incremented])
  })
  it("ignores non-existent action", function () {
    const initialState = 0
    const triggerUpdate = jest.fn()
    const { get, dispatch } = useHooks().useReducer(
      function (state, action) {
        switch (action.type) {
          case "START": {
            return 1
          }
          default:
            break
        }

        return state
      },
      0,
      triggerUpdate,
    )
    const firstState = get()
    dispatch({ type: "NON_EXISTING_ACTION" })
    expect(get()).toBe(firstState)
    expect(triggerUpdate.mock.calls.length).toBe(0)
  })
})

describe("useState", function () {
  let useHooks
  beforeEach(function () {
    useHooks = newHookFactory("useState")
  })
  it("sets and does NOT update", function () {
    const { get, set } = useHooks().useState()
    expect(get()).toBeUndefined()
    const initialState = 1
    set(initialState)
    expect(get()).toBe(initialState)
  })
  it("sets and updates", function () {
    const initialState = 0
    const triggerUpdate = jest.fn()
    const { get, set } = useHooks().useState(initialState, triggerUpdate)
    expect(get()).toBe(initialState)
    const incremented = increment(initialState)
    set(incremented)
    expect(get()).toBe(incremented)
    expect(triggerUpdate.mock.calls.length).toBe(1)
    expect(triggerUpdate.mock.calls[0]).toEqual([incremented])
  })
})

describe("useEffect", function () {
  let useHooks
  beforeEach(function () {
    useHooks = newHookFactory("useEffect")
  })

  it("skips running the effect when the dependencies don't change", function () {
    let deps = [1]
    const tearDown = jest.fn()
    const effect = jest.fn(function () {
      return tearDown
    })
    useHooks().useEffect(effect, deps)
    expect(effect.mock.calls.length).toBe(1)
    expect(tearDown.mock.calls.length).toBe(0)

    deps = Array.prototype.concat(deps, [2])
    useHooks().useEffect(effect, deps)
    expect(effect.mock.calls.length).toBe(2)
    expect(tearDown.mock.calls.length).toBe(1)

    useHooks().useEffect(effect, deps)
    expect(effect.mock.calls.length).toBe(2)
    expect(tearDown.mock.calls.length).toBe(1)
  })
})

describe("useMemo", function () {
  let useHooks
  beforeEach(function () {
    useHooks = newHookFactory("useMemo")
  })

  it("skips running the memoization when the dependencies don't change", function () {
    const memoization = jest.fn(increment)

    const firstDeps = [1]
    const firstValue = useHooks().useMemo(memoization, firstDeps)
    expect(firstValue).toBe(increment(firstDeps[0]))
    expect(memoization.mock.calls.length).toBe(1)
    // won't change since the deps didn't change either
    const theSameFirstValue = useHooks().useMemo(memoization, firstDeps)
    expect(memoization.mock.calls.length).toBe(1)
    expect(firstValue).toBe(theSameFirstValue)

    // deps have changed => expect to run the memoization again
    const secondDeps = [increment(firstValue)]
    const secondValue = useHooks().useMemo(memoization, secondDeps)
    expect(secondValue).toBe(increment(secondDeps[0]))
  })
})

describe("useRef", function () {
  let useHooks
  beforeEach(function () {
    useHooks = newHookFactory("useRef")
  })

  it("allows mutation", function () {
    const initialValue = 0
    // ref should allow setting the value by call only on the first time
    const { get, set } = useHooks().useRef(initialValue)
    expect(get()).toBe(initialValue)

    // allows mutation
    set(1)
    expect(get()).toBe(increment(initialValue))

    // it should ignore new values passed to it
    const sameRef = useHooks().useRef("whatever")
    expect(sameRef.get()).toBe(increment(initialValue))
  })
})

describe("useContext", function () {
  let makeParentHooks
  let makeChildHooks
  beforeEach(function () {
    makeParentHooks = newHookFactory("useContextOnParent")
    makeChildHooks = newHookFactory("useContextOnChild")
  })

  it("full course", function () {
    const sharedKey = "USER_ID"
    const notifyParent = jest.fn()
    const notifyChild = jest.fn()
    const parentContext = makeParentHooks().useContext(sharedKey)
    const childContext = makeChildHooks().useContext(sharedKey)
    const unsubscribeParent = parentContext.subscribe(notifyParent)
    const unsubscribeChild = childContext.subscribe(notifyChild)

    // both have the same value at the start, since `set` hasn't been called yet
    expect(parentContext.get()).toBe(childContext.get())
    // no calls to set have been made, so the subscription callbacks haven't
    // been called yet
    expect(notifyChild.mock.calls.length).toBe(0)
    expect(notifyParent.mock.calls.length).toBe(0)

    // check that the props properly reference the context
    const props = parentContext.childProps()
    expect(props.initialValue).toBeUndefined()
    expect(props.subscribe).toBe(parentContext.subscribe)

    // check that, after the context is set:
    // - the subscription callback has been called
    // - the argument to the callback is the current context's state
    // - the current context's value is the same as the one passed to the callback
    function check(value) {
      expect(notifyChild.mock.calls.length).toBe(value + 1)
      expect(notifyParent.mock.calls.length).toBe(value + 1)
      expect(notifyChild.mock.calls[value]).toEqual([value])
      expect(notifyParent.mock.calls[value]).toEqual([value])
      expect(childContext.get()).toBe(value)
      expect(parentContext.get()).toBe(value)
    }

    const firstValue = 0
    parentContext.set(firstValue)
    check(firstValue)

    const secondValue = increment(firstValue)
    childContext.set(secondValue)
    check(secondValue)

    unsubscribeParent()
    const thirdValue = increment(secondValue)
    childContext.set(thirdValue)
    // check if the parent subscription has ended
    expect(notifyParent.mock.calls.length).toBe(2)
    // the child has not unsubscribed, so it continues to get updates
    expect(notifyChild.mock.calls.length).toBe(3)
    // the parent can still get the current value manually, even after
    // unsubscribing
    expect(parentContext.get()).toBe(thirdValue)

    // the parent can subscribe again
    const secondParentSubscription = parentContext.subscribe(notifyParent)
    const fourthValue = increment(thirdValue)
    parentContext.set(fourthValue)
    expect(notifyParent.mock.calls.length).toBe(3)
  })
})

describe("newHook", function () {
  let useHooks
  beforeEach(function () {
    useHooks = newHookFactory("newHook")
  })
  it("can define a new hook", function () {
    const useRenderCounter = newHook(function (h) {
      const { get, set } = h.useRef(0)
      const newValue = get() + 1
      set(newValue)
      return newValue
    })
    let h = useHooks()
    let renderCount = useRenderCounter(h)
    expect(renderCount).toBe(1)
    h = useHooks()
    renderCount = useRenderCounter(h)
    expect(renderCount).toBe(2)
  })
})

describe("newHookKey", function () {
  it("generate unique keys without an explicit prefix", function () {
    const newKey = newHookKey()
    const anotherKey = newHookKey()
    expect(newKey).not.toEqual(anotherKey)
  })
  it("generate unique keys with an explicit prefix", function () {
    const prefix = "abc"
    const newKey = newHookKey(prefix)
    const anotherKey = newHookKey(prefix)
    expect(newKey).not.toEqual(anotherKey)
  })
})

describe("useHooks", function () {
  it("generates only the requested keys", function () {
    const h = useHooks(newHookKey(), { only: ["useMemo"] })
    expect(h.useState).toBeUndefined()
    expect(h.useMemo).not.toBeUndefined()
  })
  it("generates all keys if not explicitly requested", function () {
    const h = useHooks(newHookKey())
    expect(h.useState).not.toBeUndefined()
  })
})
