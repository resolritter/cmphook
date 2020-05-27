import { makeHookFactory } from "../hooks.js"
import { increment, makeNewHookKey } from "../testHelpers.js"

// Each call to makeHooks in this file represents another re-render
describe("useReducer", function() {
  let makeHooks
  let hooksKey = 0
  beforeEach(function() {
    makeHooks = makeHookFactory(makeNewHookKey("useReducer"))
  })
  it("reduces an add", function() {
    const initialState = 0
    const triggerUpdate = jest.fn()
    const { get, dispatch } = makeHooks().useReducer(
      function(state, action) {
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
  it("ignores non-existent action", function() {
    const initialState = 0
    const triggerUpdate = jest.fn()
    const { get, dispatch } = makeHooks().useReducer(
      function(state, action) {
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

describe("useState", function() {
  let makeHooks
  let hooksKey = 0
  beforeEach(function() {
    makeHooks = makeHookFactory(makeNewHookKey("useState"))
  })
  it("sets and does NOT update", function() {
    const { get, set } = makeHooks().useState()
    expect(get()).toBeUndefined()
    const initialState = 1
    set(initialState)
    expect(get()).toBe(initialState)
  })
  it("sets and updates", function() {
    const initialState = 0
    const triggerUpdate = jest.fn()
    const { get, set } = makeHooks().useState(initialState, triggerUpdate)
    expect(get()).toBe(initialState)
    const incremented = increment(initialState)
    set(incremented)
    expect(get()).toBe(incremented)
    expect(triggerUpdate.mock.calls.length).toBe(1)
    expect(triggerUpdate.mock.calls[0]).toEqual([incremented])
  })
})

describe("useEffect", function() {
  let makeHooks
  beforeEach(function() {
    makeHooks = makeHookFactory(makeNewHookKey("useEffect"))
  })

  it("skips running the effect when the dependencies don't change", function() {
    let deps = [1]
    const effect = jest.fn()
    makeHooks().useEffect(effect, deps)
    expect(effect.mock.calls.length).toBe(1)

    deps = Array.prototype.concat(deps, [2])
    makeHooks().useEffect(effect, deps)
    expect(effect.mock.calls.length).toBe(2)

    makeHooks().useEffect(effect, deps)
    expect(effect.mock.calls.length).toBe(2)
  })
})

describe("useMemo", function() {
  let makeHooks
  beforeEach(function() {
    makeHooks = makeHookFactory(makeNewHookKey("useMemo"))
  })

  it("skips running the memoization when the dependencies don't change", function() {
    const memoization = jest.fn(increment)

    const firstDeps = [1]
    const firstValue = makeHooks().useMemo(memoization, firstDeps)
    expect(firstValue).toBe(increment(firstDeps[0]))
    expect(memoization.mock.calls.length).toBe(1)
    // won't change since the deps didn't change either
    const theSameFirstValue = makeHooks().useMemo(memoization, firstDeps)
    expect(memoization.mock.calls.length).toBe(1)
    expect(firstValue).toBe(theSameFirstValue)

    // deps have changed => expect to run the memoization again
    const secondDeps = [increment(firstValue)]
    const secondValue = makeHooks().useMemo(memoization, secondDeps)
    expect(secondValue).toBe(increment(secondDeps[0]))
  })
})

describe("useRef", function() {
  let makeHooks
  beforeEach(function() {
    makeHooks = makeHookFactory(makeNewHookKey("useRef"))
  })

  it("allows mutation", function() {
    const initialValue = 0
    const ref = makeHooks().useRef(initialValue)
    expect(ref.current).toBe(initialValue)

    // allows mutation through `current`
    ref.current = 1
    expect(ref.current).toBe(increment(initialValue))

    // it should ignore new values passed to it, because it can only be mutated
    // through `current`
    const sameRef = makeHooks().useRef("whatever")
    expect(ref.current).toBe(increment(initialValue))
  })
})

describe("useContext", function() {
  let makeParentHooks
  let makeChildHooks
  beforeEach(function() {
    makeParentHooks = makeHookFactory(makeNewHookKey("useContextOnParent"))
    makeChildHooks = makeHookFactory(makeNewHookKey("useContextOnChild"))
  })

  it("full course", function() {
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
