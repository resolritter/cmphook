export function renderCountMixin(name: string): object {
  let updateCount = 0
  return {
    methods: {
      newUpdateMessage(name: string, count: number) {
        return `${name} was rendered ${count} times`
      },
      getId(name: string) {
        return `updateCount_${name}`
      },
    },
    updated() {
      const target = document.querySelector(`#updateCount_${name}`)
      if (!target) {
        return
      }
      target.innerHTML = (this as any).newUpdateMessage(
        name,
        ++updateCount,
      )
    },
  }
}
