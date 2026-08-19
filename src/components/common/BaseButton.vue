<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?:
      | "primary"
      | "secondary"
      | "success"
      | "danger"
      | "warning"
      | "ghost"
      | "outline";
    size?: "sm" | "md" | "lg" | "xl";
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
    ariaLabel?: string;
  }>(),
  {
    variant: "primary",
    size: "md",
    disabled: false,
    loading: false,
    type: "button",
    ariaLabel: undefined,
  },
);

const emit = defineEmits<(e: "click", event: MouseEvent) => void>();

const variantClasses = computed(() => {
  switch (props.variant) {
    case "primary":
      return "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 focus-visible:ring-slate-900 shadow-sm border border-transparent dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white";
    case "success":
      return "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 focus-visible:ring-emerald-600 shadow-sm border border-transparent";
    case "danger":
      return "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 focus-visible:ring-rose-600 shadow-sm border border-transparent";
    case "warning":
      return "bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700 focus-visible:ring-amber-600 shadow-sm border border-transparent";
    case "secondary":
      return "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400 border border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700";
    case "outline":
      return "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400 border border-slate-300 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800";
    case "ghost":
      return "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400 border border-transparent dark:text-slate-300 dark:hover:bg-slate-800";
    default:
      return "";
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "px-3 py-1.5 text-xs font-medium min-h-[36px]";
    case "md":
      return "px-4 py-2 text-sm font-medium min-h-[44px]";
    case "lg":
      return "px-6 py-3 text-base font-semibold min-h-[52px]";
    case "xl":
      return "px-8 py-4 text-lg font-bold min-h-[64px]";
    default:
      return "";
  }
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 select-none"
    :class="[variantClasses, sizeClasses]"
    @click="(e) => emit('click', e)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot />
  </button>
</template>
