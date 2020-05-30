<template>
  <div>
    <div>Tick {{ value }}</div>
    <div :id="getId(key)">{{ newUpdateMessage(key, 1) }}</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { renderCountMixin } from "@/helpers"

const key = "tick"
export default Vue.extend({
  name: "Tick",
  props: {
    value: Number,
  },
  data() {
    return {
      key,
    }
  },
  watch: {
    value(newValue) {
      console.log(arguments)
    },
  },
  mixins: [renderCountMixin(key)],
})
</script>
