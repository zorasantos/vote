<script setup lang="ts">
import { Download, PieChart, ShieldCheck } from "lucide-vue-next";
import { computed } from "vue";
import BaseButton from "~/components/common/BaseButton.vue";
import ResultProclamation from "~/components/results/ResultProclamation.vue";
import ResultsSummary from "~/components/results/ResultsSummary.vue";
import { downloadElectionReportPdf } from "~/services/pdfService";
import { useElectionStore } from "~/store/electionStore";
import { useUiStore } from "~/store/uiStore";

const electionStore = useElectionStore();
const uiStore = useUiStore();

const result = computed(() => electionStore.electionResult);

function handleDownloadPdf() {
  if (!electionStore.currentElection || !result.value) return;
  try {
    downloadElectionReportPdf(electionStore.currentElection, result.value);
    uiStore.addToast(
      "success",
      "PDF Gerado!",
      "A Ata Oficial de Apuração foi baixada com sucesso.",
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    uiStore.addToast("error", "Falha ao gerar PDF", message);
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 py-6">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Apuração da Votação — Chapa 01
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Demonstrativo dos votos da assembleia e proclamação oficial da eleição.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <BaseButton
          v-if="result"
          variant="primary"
          size="lg"
          class="shadow-md"
          @click="handleDownloadPdf"
        >
          <Download class="w-5 h-5 mr-1" />
          Baixar Ata Oficial (PDF)
        </BaseButton>
      </div>
    </div>

    <div v-if="!result" class="text-center py-16 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
      <PieChart class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">
        Nenhuma votação apurada
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Configure e abra a votação para visualizar os resultados e a apuração.
      </p>
    </div>

    <div v-else class="space-y-8">
      <!-- 1. Banner de Proclamação Oficial -->
      <ResultProclamation :result="result" />

      <!-- 2. Quadro Resumo com 4 Cartões e Barras -->
      <ResultsSummary :result="result" />

      <!-- 3. Evidência de Integridade e Hash SHA-256 -->
      <div class="p-6 bg-slate-900 text-white rounded-3xl shadow-md space-y-3">
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <ShieldCheck class="w-4 h-4" />
          Evidência de Integridade Digital
        </div>

        <div class="space-y-1 text-xs">
          <p class="text-slate-400">
            Hash SHA-256 Canônico do Registro de Votação:
          </p>
          <p class="font-mono text-xs text-emerald-300 break-all bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            {{ result.dataHash || electionStore.lastCalculatedHash || 'Calculado no momento do encerramento' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
