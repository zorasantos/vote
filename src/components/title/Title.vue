<script setup lang="ts">
defineProps<{ msg: string }>();
</script>

<template>
  <h1 className="text-3xl text-white font-bold underline">{{ msg }}</h1>
</template>
