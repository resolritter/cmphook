import { newKey, useHooks } from "./hooks.js"

export function increment(state) {
  return state + 1
}

export function createNewHookFactory(key) {
  key = newKey(key)
  return function () {
    return useHooks(key)
  }
}
