import { makeHooks } from "../hooks.js"

function increment(state) {
  return state + 1
}

describe("useReducer", function() {
  let hooks
  let hooksKey = 0
  beforeEach(function() {
    hooks = makeHooks(++hooksKey, function(hookName) {
      return hookName
    })
  })
  it("reduces an add", function() {
    const initialState = 0
    const triggerUpdate = jest.fn()
    const { get, dispatch } = hooks.useReducer(
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
    expect(get()).toBe(increment(initialState))
    expect(triggerUpdate.mock.calls.length).toBe(1)
  })
  it("ignores non-existent action", function() {
    const initialState = 0
    const triggerUpdate = jest.fn()
    const { get, dispatch } = hooks.useReducer(
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
  let hooks
  let hooksKey = 0
  beforeEach(function() {
    hooks = makeHooks(++hooksKey, function(hookName) {
      return hookName
    })
  })
  it("sets and does NOT update", function() {
    const { get, set } = hooks.useState()
    expect(get()).toBeUndefined()
    const initialState = 1
    set(initialState)
    expect(get()).toBe(initialState)
  })
  it("sets and updates", function() {
    const initialState = 0
    const triggerUpdate = jest.fn()
    const { get, set } = hooks.useState(initialState, triggerUpdate)
    expect(get()).toBe(initialState)
    set(increment(initialState))
    expect(get()).toBe(increment(initialState))
  })
})
