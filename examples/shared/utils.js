export function getCounterMessage(renderCount, prepend = "") {
  return `${prepend}I've been called ${renderCount} times.`
}

function getValueMessage(name) {
  return function (value) {
    return `${name} received value ${value}. `
  }
}
export const getTickMessage = getValueMessage("Tick")
export const getTockMessage = getValueMessage("Tock")

function innerGetHookMessage(name) {
  return function (value, computedTimesCount) {
    return `Hook "${name}" has value: ${value}${
      computedTimesCount === undefined ? "." : `, which was calculated ${computedTimesCount} times so far.`
    }`
  }
}

export const getHookMessage = ["useState", "useMemo"].reduce(function (obj, value) {
  obj[value] = innerGetHookMessage(value)
  return obj
}, {})
