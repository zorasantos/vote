<script setup lang="ts">
import { CheckCircle2, UserCheck } from "lucide-vue-next";
import BaseButton from "~/components/common/BaseButton.vue";

defineProps<{
  countdown: number;
}>();

const emit = defineEmits<(e: "next") => void>();
</script>

<template>
  <div class="max-w-xl mx-auto text-center py-10 space-y-6">
    <div class="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 dark:bg-emerald-950/80 rounded-full text-emerald-600 dark:text-emerald-400 mb-2 animate-bounce">
      <CheckCircle2 class="w-16 h-16" />
    </div>

    <div class="space-y-2">
      <h2 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
        VOTO COMPUTADO COM SUCESSO!
      </h2>
      <p class="text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        Sua cédula foi registrada de forma segura e anônima na urna eletrônica.
      </p>
    </div>

    <div class="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Por favor, libere a cabine de votação para o próximo associado.
      </p>
      <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
        Retornando automaticamente em <span class="font-bold text-slate-900 dark:text-white">{{ countdown }}s</span>...
      </p>
    </div>

    <div class="pt-4">
      <BaseButton
        variant="primary"
        size="xl"
        class="w-full max-w-md mx-auto justify-center text-lg font-bold shadow-lg"
        @click="emit('next')"
      >
        <UserCheck class="w-5 h-5 mr-1.5" />
        PRÓXIMO VOTANTE (Espaço)
      </BaseButton>
    </div>
  </div>
</template>
