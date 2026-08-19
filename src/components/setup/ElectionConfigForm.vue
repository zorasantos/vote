<script setup lang="ts">
import { reactive, watch } from "vue";
import BaseButton from "~/components/common/BaseButton.vue";
import type { Election, QuorumBasis, VotingMode } from "~/domain/types";

const props = defineProps<{
  election: Election | null;
  disabled?: boolean;
}>();

const emit = defineEmits<(e: "save", data: Partial<Election>) => void>();

const form = reactive<{
  associationName: string;
  title: string;
  date: string;
  mode: VotingMode;
  quorumBasis: QuorumBasis;
  allowBlankVote: boolean;
}>({
  associationName: props.election?.associationName || "",
  title: props.election?.title || "",
  date: props.election?.date || new Date().toISOString().split("T")[0],
  mode: props.election?.mode || "SINGLE_SLATE_APPROVAL",
  quorumBasis: props.election?.quorumBasis || "VALID_VOTES",
  allowBlankVote: props.election?.allowBlankVote ?? true,
});

watch(
  () => props.election,
  (newVal) => {
    if (newVal) {
      form.associationName = newVal.associationName;
      form.title = newVal.title;
      form.date = newVal.date;
      form.mode = newVal.mode;
      form.quorumBasis = newVal.quorumBasis;
      form.allowBlankVote = newVal.allowBlankVote;
    }
  },
  { deep: true },
);

function handleSubmit() {
  emit("save", {
    associationName: form.associationName.trim(),
    title: form.title.trim(),
    date: form.date,
    mode: form.mode,
    quorumBasis: form.quorumBasis,
    allowBlankVote: form.allowBlankVote,
  });
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <!-- Razão Social / Nome da Associação -->
      <div class="sm:col-span-2">
        <label
          for="associationName"
          class="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
        >
          Nome da Associação / Entidade <span class="text-rose-500">*</span>
        </label>
        <input
          id="associationName"
          v-model="form.associationName"
          type="text"
          required
          :disabled="disabled"
          placeholder="Ex: Associação dos Moradores do Bairro X"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-colors"
        />
      </div>

      <!-- Título da Eleição -->
      <div class="sm:col-span-2">
        <label
          for="title"
          class="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
        >
          Título do Pleito / Eleição <span class="text-rose-500">*</span>
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          :disabled="disabled"
          placeholder="Ex: Eleição da Mesa Diretora — Gestão 2026/2028"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-colors"
        />
      </div>

      <!-- Data da Eleição -->
      <div>
        <label
          for="date"
          class="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
        >
          Data de Realização <span class="text-rose-500">*</span>
        </label>
        <input
          id="date"
          v-model="form.date"
          type="date"
          required
          :disabled="disabled"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-colors"
        />
      </div>

      <!-- Modo de Votação -->
      <div>
        <label
          for="mode"
          class="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
        >
          Modalidade do Pleito <span class="text-rose-500">*</span>
        </label>
        <select
          id="mode"
          v-model="form.mode"
          :disabled="disabled"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-colors cursor-pointer"
        >
          <option value="SINGLE_SLATE_APPROVAL">Chapa Única (Votação SIM / NÃO)</option>
          <option value="MULTIPLE_SLATE_CHOICE">Múltiplas Chapas (Escolha Nominal)</option>
        </select>
      </div>

      <!-- Base de Quórum da Maioria Absoluta -->
      <div class="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
        <label class="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
          Regra de Maioria Absoluta (50% + 1)
        </label>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Selecione como o estatuto da sua associação define o denominador da maioria absoluta:
        </p>
        <div class="space-y-2">
          <label class="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              value="VALID_VOTES"
              v-model="form.quorumBasis"
              :disabled="disabled"
              class="mt-1 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
            <div>
              <span class="text-sm font-medium text-slate-800 dark:text-slate-200">
                Apenas Votos Válidos (Recomendado / Padrão Estatutário)
              </span>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Considera apenas os votos SIM e NÃO (ou nominais em chapas). Votos em branco não entram no cálculo da maioria.
              </p>
            </div>
          </label>

          <label class="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              value="TOTAL_VOTES"
              v-model="form.quorumBasis"
              :disabled="disabled"
              class="mt-1 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
            <div>
              <span class="text-sm font-medium text-slate-800 dark:text-slate-200">
                Total de Votos Depositados na Urna
              </span>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Considera todos os votos, inclusive votos em branco, elevando o número necessário para 50% + 1.
              </p>
            </div>
          </label>
        </div>
      </div>

      <!-- Voto em Branco -->
      <div class="sm:col-span-2">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            v-model="form.allowBlankVote"
            :disabled="disabled"
            class="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
          />
          <span class="text-sm font-medium text-slate-800 dark:text-slate-200">
            Habilitar botão de "Voto em Branco" na cabine de votação
          </span>
        </label>
      </div>
    </div>

    <div v-if="!disabled" class="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
      <BaseButton type="submit" variant="primary" size="lg">
        Salvar Dados da Eleição
      </BaseButton>
    </div>
  </form>
</template>
