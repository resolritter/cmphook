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