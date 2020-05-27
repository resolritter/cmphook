import { shallowEqual } from "fast-equals"

const context = new Map()
const contextListeners = new Map()
const hooksState = new Map()
function makeHooks(key, { makeHookName }) {
  if (!hooksState.has(key)) {
    hooksState.set(key, {})
  }

  let cursor = 0
  function forwardState() {
    return hooksState.get(key)[++cursor]
  }
  function getState() {
    return hooksState.get(key)[cursor]
  }
  function update(value) {
    hooksState.set(
      key,
      Object.assign(hooksState.get(key), {
        [cursor]: value,
      }),
    )
    return value
  }

  return {
    [makeHookName("useState")]: function(value, triggerUpdate) {
      const state = forwardState()
      if (state) {
        return state
      }

      function set(newValue) {
        value = newValue
        if (triggerUpdate) {
          triggerUpdate(value)
        }
      }
      return update({
        get: function() {
          return value
        },
        set,
      })
    },
    [makeHookName("useEffect")]: function(f, deps) {
      const { lastDeps, tearDown } = forwardState() || {}
      if (lastDeps && shallowEqual(lastDeps, deps)) {
        return
      }
      if (tearDown) {
        tearDown()
      }

      update({ lastDeps: deps, tearDown: f(...deps) })
    },
    [makeHookName("useMemo")]: function(f, deps) {
      const { lastDeps, lastResult } = forwardState() || {}
      if (shallowEqual(lastDeps, deps)) {
        return lastResult
      }

      return update({ lastResult: f(...deps), lastDeps: deps }).lastResult
    },
    [makeHookName("useRef")]: function(value) {
      const state = forwardState()
      if (state) {
        return state
      }

      return update({
        get: function() {
          return value
        },
        set: function(newValue) {
          value = newValue
        },
      })
    },
    [makeHookName("useReducer")]: function(
      reduce,
      initialState,
      triggerUpdate,
    ) {
      const state = forwardState()
      if (state) {
        return state
      }

      let currentState = initialState
      return update({
        get: function() {
          return currentState
        },
        dispatch: function(action) {
          const nextState = reduce(currentState, action)
          if (nextState === currentState) {
            return
          }
          currentState = nextState
          if (triggerUpdate) {
            triggerUpdate(nextState)
          }
        },
      })
    },
    [makeHookName("useContext")]: function(key) {
      const state = forwardState()
      if (state) {
        return state
      }

      const zeroState = [0, new Map()]
      return update({
        get: function() {
          return context.get(key)
        },
        set: function(value) {
          ;(contextListeners.get(key) || zeroState)[1].forEach(function(notify) {
            notify(value)
          })
          context.set(key, value)
        },
        subscribe: function(f) {
          let subscriptionKey
          if (contextListeners.has(key)) {
            subscriptionKey = contextListeners.get(key)[0] + 1
          } else {
            contextListeners.set(key, zeroState)
            subscriptionKey = 0
          }
          contextListeners.set(key, [
            subscriptionKey,
            contextListeners.get(key)[1].set(subscriptionKey, f),
          ])

          return function unsubscribe() {
            contextListeners.get(key)[1].delete(subscriptionKey)
          }
        },
      })
    },
    shallowEqual,
  }
}

export function makeNewHook(f) {
  return function(hooksInstance, ...args) {
    return f(hooksInstance, ...args)
  }
}

export function makeHookFactory(key, options) {
  options = Object.assign(
    {
      makeHookName: (hookName) => hookName,
    },
    options || {},
  )
  return function() {
    return makeHooks(key, options)
  }
}
