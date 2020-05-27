import { makeHookFactory } from "../hooks.js"
import { increment, makeNewHookKey } from "../testHelpers.js"

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

  it("skips updates when necessary", function() {
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
