<script setup lang="ts">
import { X } from "lucide-vue-next";
import { onMounted, onUnmounted, watch } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    description?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
    showClose?: boolean;
  }>(),
  {
    title: "",
    description: "",
    maxWidth: "md",
    showClose: true,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
}>();

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && props.modelValue) {
    close();
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});

const maxWidthClass = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
}[props.maxWidth];
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        @click.self="close"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? 'modal-title' : undefined"
          class="relative w-full overflow-hidden bg-white rounded-2xl shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          :class="[maxWidthClass]"
        >
          <!-- Header -->
          <div
            v-if="title || showClose"
            class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800"
          >
            <div>
              <h2
                v-if="title"
                id="modal-title"
                class="text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                {{ title }}
              </h2>
              <p
                v-if="description"
                class="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
              >
                {{ description }}
              </p>
            </div>

            <button
              v-if="showClose"
              type="button"
              class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Fechar modal"
              @click="close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 max-h-[80vh] overflow-y-auto">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
