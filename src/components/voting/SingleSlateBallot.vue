<script setup lang="ts">
import { CheckCircle2, XCircle } from "lucide-vue-next";
import BaseButton from "~/components/common/BaseButton.vue";
import type { Slate, VoteChoice } from "~/domain/types";

defineProps<{
  slate: Slate;
  allowBlankVote?: boolean;
}>();

const emit = defineEmits<(e: "select", choice: VoteChoice) => void>();
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Instrução Direta e Clara para Idosos -->
    <div class="text-center space-y-2">
      <h2 class="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
        VOCÊ APROVA A CHAPA 01?
      </h2>
      <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300">
        Toque ou clique em uma das opções abaixo para votar:
      </p>
    </div>

    <!-- Card de Apresentação da Chapa 01 -->
    <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-md text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-black text-2xl rounded-2xl mb-3 shadow-md">
        01
      </div>
      <h3 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
        Chapa 01
      </h3>
      <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium">
        Candidatura da Mesa Diretora da Associação
      </p>
    </div>

    <!-- Botões Gigantes de Votação (SIM e NÃO) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
      <!-- Botão SIM -->
      <button
        type="button"
        class="flex flex-col items-center justify-center p-8 sm:p-10 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-3xl shadow-xl transition-all transform active:scale-95 cursor-pointer border-4 border-emerald-400/40"
        aria-label="Votar SIM - Aprovar a Chapa 01"
        @click="emit('select', 'YES')"
      >
        <CheckCircle2 class="w-16 h-16 sm:w-20 sm:h-20 mb-3" />
        <span class="text-3xl sm:text-4xl font-black tracking-wide">SIM</span>
        <span class="text-sm sm:text-base opacity-95 font-semibold mt-1">Aprovar a Chapa 01</span>
        <span class="text-xs opacity-75 mt-2 bg-emerald-700/60 px-3 py-1 rounded-full">(Tecla 1 no Teclado)</span>
      </button>

      <!-- Botão NÃO -->
      <button
        type="button"
        class="flex flex-col items-center justify-center p-8 sm:p-10 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-3xl shadow-xl transition-all transform active:scale-95 cursor-pointer border-4 border-rose-400/40"
        aria-label="Votar NÃO - Rejeitar a Chapa 01"
        @click="emit('select', 'NO')"
      >
        <XCircle class="w-16 h-16 sm:w-20 sm:h-20 mb-3" />
        <span class="text-3xl sm:text-4xl font-black tracking-wide">NÃO</span>
        <span class="text-sm sm:text-base opacity-95 font-semibold mt-1">Rejeitar a Chapa 01</span>
        <span class="text-xs opacity-75 mt-2 bg-rose-700/60 px-3 py-1 rounded-full">(Tecla 2 no Teclado)</span>
      </button>
    </div>
  </div>
</template>
