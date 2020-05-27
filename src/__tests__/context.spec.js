import { makeHooks } from "../hooks.js"

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
    function increment(state) {
      return state + 1
    }
    const { getState, dispatch } = hooks.useReducer(
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
    expect(getState()).toBe(initialState)
    dispatch({ type: "ADD" })
    expect(getState()).toBe(increment(initialState))
    expect(triggerUpdate.mock.calls.length).toBe(1)
  })
  it("ignores non-existent action", function() {
    const initialState = 0
    const triggerUpdate = jest.fn()
    const { getState, dispatch } = hooks.useReducer(
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
    const firstState = getState()
    dispatch({ type: "NON_EXISTING_ACTION" })
    expect(getState()).toBe(firstState)
    expect(triggerUpdate.mock.calls.length).toBe(0)
  })
})
