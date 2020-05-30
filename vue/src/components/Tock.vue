<template>
  <div>Tock {{ value }}</div>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "Tock",
  props: {
    value: Number,
  },
})
</script>
