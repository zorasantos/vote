<script setup lang="ts">
defineProps<{ count: number; text: string }>();
</script>
<template>
  <h3 className="text-yellow-600">
    {{ text }} <span className="text-green-600">{{ count }}</span>
  </h3>
</template>
