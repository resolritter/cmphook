<template>
  <div class="home">
    <div>
      Vue is already doesn't unnecessarily update children when data unrelated
      to them changes.
    </div>
    <div :id="getId(key)">{{ newUpdateMessage(key, 1) }}</div>
    <Tick :value="tick" />
    <Tock :value="tock" />
  </div>
</template>

<script>
import Tick from "@/components/Tick.vue"
import Tock from "@/components/Tock.vue"
import { renderCountMixin } from "@/helpers"

const key = "app"
export default {
  name: "Home",
  components: {
    Tick,
    Tock,
  },
  data() {
    return {
      tickTock: 0,
      tick: 0,
      tock: 0,
      key,
    }
  },
  mounted() {
    setInterval(() => {
      this.$data.tickTock++
      if (this.$data.tickTock % 2) {
        this.$data.tock++
      } else {
        this.$data.tick++
      }
    }, 2000)
  },
  mixins: [renderCountMixin(key)],
}
</script>
