<script setup lang="ts">
import { KeyRound, Lock } from "lucide-vue-next";
import { onMounted, onUnmounted, ref, watch } from "vue";
import BaseButton from "./BaseButton.vue";
import BaseModal from "./BaseModal.vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    description?: string;
    expectedPin?: string; // Padrão "1234"
  }>(),
  {
    title: "Acesso do Mesário / Operador",
    description: "Digite o PIN operacional para continuar.",
    expectedPin: "1234",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}>();

const enteredPin = ref("");
const errorMessage = ref("");

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      enteredPin.value = "";
      errorMessage.value = "";
    }
  },
);

function handleNumber(num: string) {
  if (enteredPin.value.length < 8) {
    enteredPin.value += num;
    errorMessage.value = "";
  }
}

function handleBackspace() {
  enteredPin.value = enteredPin.value.slice(0, -1);
  errorMessage.value = "";
}

function handleClear() {
  enteredPin.value = "";
  errorMessage.value = "";
}

function handleSubmit() {
  if (enteredPin.value === props.expectedPin) {
    emit("success");
    emit("update:modelValue", false);
  } else {
    errorMessage.value = "PIN incorreto. Tente novamente.";
    enteredPin.value = "";
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.modelValue) return;

  if (e.key >= "0" && e.key <= "9") {
    handleNumber(e.key);
  } else if (e.key === "Backspace") {
    handleBackspace();
  } else if (e.key === "Enter") {
    if (enteredPin.value.length > 0) {
      handleSubmit();
    }
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    :description="description"
    max-width="sm"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <div class="flex flex-col items-center">
      <div class="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
        <Lock class="w-8 h-8 text-slate-700 dark:text-slate-300" />
      </div>

      <!-- Display do PIN -->
      <div
        class="w-full py-3 px-4 bg-slate-50 dark:bg-slate-950 border-2 rounded-xl text-center mb-4 transition-colors"
        :class="errorMessage ? 'border-rose-400 dark:border-rose-600' : 'border-slate-300 dark:border-slate-700'"
      >
        <div class="flex items-center justify-center gap-3 h-8">
          <span
            v-for="i in 4"
            :key="i"
            class="w-3.5 h-3.5 rounded-full transition-all duration-150"
            :class="
              enteredPin.length >= i
                ? 'bg-slate-900 dark:bg-slate-100 scale-110'
                : 'bg-slate-200 dark:bg-slate-700'
            "
          />
        </div>
      </div>

      <p v-if="errorMessage" class="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-3">
        {{ errorMessage }}
      </p>

      <!-- Teclado Numérico -->
      <div class="grid grid-cols-3 gap-2 w-full max-w-[240px] mb-4">
        <button
          v-for="num in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
          :key="num"
          type="button"
          class="h-12 text-lg font-bold bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 rounded-xl transition-colors cursor-pointer"
          @click="handleNumber(num)"
        >
          {{ num }}
        </button>
        <button
          type="button"
          class="h-12 text-xs font-semibold text-slate-600 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 rounded-xl transition-colors cursor-pointer"
          @click="handleClear"
        >
          LIMPAR
        </button>
        <button
          type="button"
          class="h-12 text-lg font-bold bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 rounded-xl transition-colors cursor-pointer"
          @click="handleNumber('0')"
        >
          0
        </button>
        <button
          type="button"
          class="h-12 text-xs font-semibold text-slate-600 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 rounded-xl transition-colors cursor-pointer"
          @click="handleBackspace"
        >
          APAGAR
        </button>
      </div>

      <BaseButton
        class="w-full"
        variant="primary"
        size="lg"
        :disabled="enteredPin.length === 0"
        @click="handleSubmit"
      >
        <KeyRound class="w-4 h-4 mr-1" />
        Confirmar Acesso
      </BaseButton>
    </div>
  </BaseModal>
</template>
