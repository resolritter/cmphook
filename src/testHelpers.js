import { newHookKey, useHooks } from "./hooks.js"

export function increment(state) {
  return state + 1
}

export function newHookFactory(key) {
  key = newHookKey(key)
  return function () {
    return useHooks(key)
  }
}
