export function increment(state) {
  return state + 1
}

let hookKeysCounter = {}
export function makeNewHookKey(name) {
  hookKeysCounter[name] = (hookKeysCounter[name] || 0) + 1
  return `${name}_${hookKeysCounter[name]}`
}
