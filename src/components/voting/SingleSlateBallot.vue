<script setup lang="ts">
import { CheckCircle2, MinusCircle, Users, XCircle } from "lucide-vue-next";
import BaseButton from "~/components/common/BaseButton.vue";
import type { Slate, VoteChoice } from "~/domain/types";

const props = defineProps<{
  slate: Slate;
  allowBlankVote?: boolean;
}>();

const emit = defineEmits<(e: "select", choice: VoteChoice) => void>();
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Instrução Direta e Clara -->
    <div class="text-center">
      <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
        Você aprova esta chapa para a Mesa Diretora?
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Analise os candidatos abaixo e selecione sua opção de voto.
      </p>
    </div>

    <!-- Card de Apresentação da Chapa -->
    <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-md">
      <div class="flex items-start gap-4 mb-4">
        <div class="w-12 h-12 flex items-center justify-center bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-black text-xl rounded-2xl shrink-0">
          {{ slate.number }}
        </div>
        <div>
          <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {{ slate.name }}
          </h3>
          <p v-if="slate.slogan" class="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">
            "{{ slate.slogan }}"
          </p>
        </div>
      </div>

      <!-- Membros da Composição -->
      <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
          <Users class="w-4 h-4 text-slate-500" />
          Composição Nominal da Mesa Diretora & Conselho
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
          <div
            v-for="member in slate.members"
            :key="member.id"
            class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
          >
            <span class="font-bold text-slate-900 dark:text-slate-200 block">
              {{ member.role }}
            </span>
            <span class="text-slate-700 dark:text-slate-300 block">
              {{ member.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Botões Expressivos de Votação (Atalhos: Tecla 1, 2 e 0) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
      <!-- Botão SIM -->
      <BaseButton
        variant="success"
        size="xl"
        class="w-full flex-col py-5 shadow-lg active:scale-98"
        aria-label="Votar SIM - Aprovar a chapa"
        @click="emit('select', 'YES')"
      >
        <div class="flex items-center gap-2">
          <CheckCircle2 class="w-7 h-7" />
          <span class="text-xl font-black tracking-wide">SIM, APROVO</span>
        </div>
        <span class="text-xs opacity-90 font-normal">Aprovar a chapa para a Mesa Diretora (Tecla 1)</span>
      </BaseButton>

      <!-- Botão NÃO -->
      <BaseButton
        variant="danger"
        size="xl"
        class="w-full flex-col py-5 shadow-lg active:scale-98"
        aria-label="Votar NÃO - Rejeitar a chapa"
        @click="emit('select', 'NO')"
      >
        <div class="flex items-center gap-2">
          <XCircle class="w-7 h-7" />
          <span class="text-xl font-black tracking-wide">NÃO, REJEITO</span>
        </div>
        <span class="text-xs opacity-90 font-normal">Rejeitar a chapa para a Mesa Diretora (Tecla 2)</span>
      </BaseButton>
    </div>

    <!-- Botão Voto em Branco (Opcional) -->
    <div v-if="allowBlankVote" class="flex justify-center pt-2">
      <BaseButton
        variant="secondary"
        size="md"
        class="text-slate-600 dark:text-slate-300"
        aria-label="Votar em Branco"
        @click="emit('select', 'BLANK')"
      >
        <MinusCircle class="w-4 h-4" />
        Votar em Branco (Tecla 0)
      </BaseButton>
    </div>
  </div>
</template>
