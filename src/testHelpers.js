import { makeNewHookKey, makeHooks } from "./hooks.js"

export function increment(state) {
  return state + 1
}

export function makeHookFactory(key) {
  key = makeNewHookKey(key)
  return function () {
    return makeHooks(key)
  }
}
