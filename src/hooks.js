import { shallowEqual } from "fast-equals"

const context = new Map()
const contextListeners = new Map()
const hooksState = new Map()

export function makeHooks(
  key,
  hookNamePrefixer = (hookName) => `${hookName[0]}${hookName}`,
) {
  if (!hooksState.has(key)) {
    hooksState.set(key, {})
  }

  let cursor = 0
  function getState() {
    return hooksState.get(key)[++cursor]
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
    [hookNamePrefixer("setState")]: function(value, triggerUpdate) {
      const state = getState()
      if (state) {
        return
      }

      function setValue(value, isTriggeringUpdate = true) {
        hooksState.set(
          key,
          Object.assign(hooksState.get(key), {
            [cursor]: { value },
          }),
        )
        if (isTriggeringUpdate) {
          triggerUpdate(value)
        }
      }
      setValue(value, false)
      return update([value, setValue])
    },
    [hookNamePrefixer("useEffect")]: function(f, deps) {
      const { lastDeps } = getState() || {}
      if (shallowEqual(lastDeps, deps)) {
        return
      }

      update(f(...deps))
    },
    [hookNamePrefixer("useMemo")]: function(f, deps) {
      const { lastDeps } = getState() || {}
      if (shallowEqual(lastDeps, deps)) {
        return
      }

      return update({ lastResult: f(...deps), lastDeps: deps }).lastResult
    },
    [hookNamePrefixer("useRef")]: function(initialValue) {
      const state = getState()
      if (state) {
        return state
      }

      return update({
        value: initialValue,
        get current() {
          return this.value
        },
        set current(value) {
          this.value = value
        },
      })
    },
    [hookNamePrefixer("useReducer")]: function(
      reduce,
      initialState,
      triggerUpdate,
    ) {
      const state = getState()
      if (state) {
        return state
      }

      let currentState = initialState
      return update({
        getState: function() {
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
    [hookNamePrefixer("useContext")]: function(key) {
      const state = getState()
      if (state) {
        return state
      }

      const zeroState = [0, new Map()]
      return update({
        get get() {
          return context.get(key)
        },
        set set(value) {
          ;(contextListeners.get(key) || zeroState)[1].forEach(function([
            ,
            notify,
          ]) {
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
            contextListeners.get(key)[1].remove(subscriptionKey)
          }
        },
      })
    },
    shallowEqual,
  }
}

export function makeHook(f) {
  return function(makeHooksInstance, ...args) {
    return f(makeHooksInstance, ...args)
  }
}
