<script setup lang="ts">
import { Save, UserCheck, Users } from "lucide-vue-next";
import { reactive, watch } from "vue";
import BaseButton from "~/components/common/BaseButton.vue";
import type { Election } from "~/domain/types";

const props = defineProps<{
  election: Election | null;
  disabled?: boolean;
}>();

const emit = defineEmits<(e: "save", data: Partial<Election>) => void>();

const form = reactive<{
  totalMembers: number;
  presentMembers: number;
}>({
  totalMembers: props.election?.totalMembers ?? 100,
  presentMembers: props.election?.presentMembers ?? 50,
});

watch(
  () => props.election,
  (newVal) => {
    if (newVal) {
      form.totalMembers = newVal.totalMembers ?? 100;
      form.presentMembers = newVal.presentMembers ?? 50;
    }
  },
  { deep: true },
);

function handleSubmit() {
  emit("save", {
    totalMembers: Number(form.totalMembers),
    presentMembers: Number(form.presentMembers),
    mode: "SINGLE_SLATE_APPROVAL",
    allowBlankVote: false,
    quorumBasis: "VALID_VOTES",
    title: "Votação da Mesa Diretora — Chapa 01",
    associationName: "Associação de Moradores",
  });
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <!-- Input 1: Quantidade de pessoas na associação -->
      <div class="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
        <label
          for="totalMembers"
          class="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900 dark:text-white mb-2"
        >
          <div class="p-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl">
            <Users class="w-5 h-5" />
          </div>
          1. Pessoas na Associação
        </label>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
          Quantidade total de membros / associados cadastrados na entidade.
        </p>
        <input
          id="totalMembers"
          v-model.number="form.totalMembers"
          type="number"
          min="1"
          required
          :disabled="disabled"
          placeholder="Ex: 100"
          class="w-full px-4 py-3 text-lg font-bold rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-colors"
        />
      </div>

      <!-- Input 2: Quantidade de pessoas presentes na votação -->
      <div class="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
        <label
          for="presentMembers"
          class="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900 dark:text-white mb-2"
        >
          <div class="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
            <UserCheck class="w-5 h-5" />
          </div>
          2. Pessoas Presentes na Votação
        </label>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
          Quantidade de associados presentes na assembleia aptos a votar.
        </p>
        <input
          id="presentMembers"
          v-model.number="form.presentMembers"
          type="number"
          min="1"
          required
          :disabled="disabled"
          placeholder="Ex: 50"
          class="w-full px-4 py-3 text-lg font-bold rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-colors"
        />
      </div>
    </div>

    <!-- Alerta Informativo de Simplicidade -->
    <div class="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-2xl border border-blue-200 dark:border-blue-800 text-sm text-blue-900 dark:text-blue-200 flex items-center justify-between">
      <div>
        <span class="font-bold block">✓ Votação com Chapa 01 pré-definida</span>
        <span class="text-xs opacity-90">As cédulas conterão unicamente as opções <strong>SIM</strong> e <strong>NÃO</strong> para a Chapa 01.</span>
      </div>
    </div>

    <div v-if="!disabled" class="flex justify-end pt-2">
      <BaseButton type="submit" variant="primary" size="lg" class="px-8 py-3.5 text-base font-bold shadow-md">
        <Save class="w-5 h-5 mr-2" />
        Salvar Configuração
      </BaseButton>
    </div>
  </form>
</template>
