<script setup lang="ts">
import {
  Building2,
  FileText,
  Save,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-vue-next";
import { reactive, watch } from "vue";
import BaseButton from "~/components/common/BaseButton.vue";
import type { Election } from "~/domain/types";

const props = defineProps<{
  election: Election | null;
  disabled?: boolean;
}>();

const emit = defineEmits<(e: "save", data: Partial<Election>) => void>();

const form = reactive<{
  title: string;
  totalMembers: number;
  presentMembers: number;
}>({
  title: props.election?.title || "Eleição da Mesa Diretora — Biênio 2026/2028",
  totalMembers: props.election?.totalMembers ?? 100,
  presentMembers: props.election?.presentMembers ?? 50,
});

watch(
  () => props.election,
  (newVal) => {
    if (newVal) {
      form.title =
        newVal.title || "Eleição da Mesa Diretora — Biênio 2026/2028";
      form.totalMembers = newVal.totalMembers ?? 100;
      form.presentMembers = newVal.presentMembers ?? 50;
    }
  },
  { deep: true },
);

function handleSubmit() {
  emit("save", {
    associationName: "Associação Cearense de Escritores - ACE",
    associationLogo: "/ace-logo.jpg",
    title: form.title.trim(),
    totalMembers: Number(form.totalMembers),
    presentMembers: Number(form.presentMembers),
    mode: "SINGLE_SLATE_APPROVAL",
    allowBlankVote: false,
    quorumBasis: "VALID_VOTES",
  });
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Bloco 1: Identificação Institucional Fixa -->
    <div class="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-5">
      <!-- Identidade Visual Oficial da ACE -->
      <div class="flex flex-col sm:flex-row items-center gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div class="relative shrink-0">
          <img
            src="/ace-logo.jpg"
            alt="Logotipo da Associação Cearense de Escritores - ACE"
            class="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl bg-white p-2 border-2 border-slate-200 dark:border-slate-700 shadow-sm"
          />
        </div>

        <div class="space-y-1 text-center sm:text-left flex-1">
          <div class="flex items-center justify-center sm:justify-start gap-2">
            <span class="px-2.5 py-0.5 text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-full">
              Entidade Oficial
            </span>
            <span class="text-xs text-slate-400 font-medium">Fundada em 2007</span>
          </div>

          <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
            Associação Cearense de Escritores - ACE
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Logomarca e denominação oficial vinculadas permanentemente ao sistema eleitoral e às atas em PDF.
          </p>
        </div>
      </div>

      <!-- Input de Título da Eleição -->
      <div>
        <label
          for="electionTitle"
          class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Título / Biênio do Pleito
        </label>
        <div class="relative">
          <input
            id="electionTitle"
            v-model="form.title"
            type="text"
            required
            :disabled="disabled"
            placeholder="Eleição da Mesa Diretora — Biênio 2026/2028"
            class="w-full px-4 py-3 text-base font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- Bloco 2: Quórum e Associados -->
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
          class="w-full px-4 py-3 text-lg font-bold rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-colors"
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
    <div class="p-4 bg-teal-50 dark:bg-teal-950/50 rounded-2xl border border-teal-200 dark:border-teal-800 text-sm text-teal-900 dark:text-teal-200 flex items-center justify-between">
      <div>
        <span class="font-bold block">✓ Votação com Chapa 01 pré-definida</span>
        <span class="text-xs opacity-90">As cédulas conterão unicamente as opções <strong>SIM</strong> e <strong>NÃO</strong> para a Chapa 01.</span>
      </div>
    </div>

    <div v-if="!disabled" class="flex justify-end pt-2">
      <BaseButton type="submit" variant="primary" size="lg" class="px-8 py-3.5 text-base font-bold shadow-md cursor-pointer">
        <Save class="w-5 h-5 mr-2" />
        Salvar Configuração
      </BaseButton>
    </div>
  </form>
</template>
