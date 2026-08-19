<script setup lang="ts">
import { computed } from "vue";
import { Count } from "~/components";

import { useCounterStore } from "~/store";

const store = useCounterStore();

const doubleValue = computed(() => store.doubleCount);
</script>

<template>
  <div className="flex gap-5 pt-2 pb-10">
    <Count :count="store.count" text="State Increments" />
    <Count :count="doubleValue" text="State Double Value" />
  </div>

  <button @click="store.increment()">Click Here</button>
</template>
