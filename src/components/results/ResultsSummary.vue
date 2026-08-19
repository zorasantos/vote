<script setup lang="ts">
import { BarChart3, CheckCircle, MinusCircle, XCircle } from "lucide-vue-next";
import type { ElectionResult } from "~/domain/types";

defineProps<{
  result: ElectionResult;
}>();
</script>

<template>
  <div class="space-y-6">
    <!-- Cards de Métricas Principais -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Depositado</span>
        <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
          {{ result.totalVotes }}
        </span>
        <span class="text-[11px] text-slate-500 dark:text-slate-400">100% dos votos</span>
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Votos Válidos</span>
        <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
          {{ result.validVotes }}
        </span>
        <span class="text-[11px] text-slate-500 dark:text-slate-400">
          {{ result.totalVotes > 0 ? ((result.validVotes / result.totalVotes) * 100).toFixed(1) : 0 }}% do total
        </span>
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Votos em Branco</span>
        <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
          {{ result.blankVotes }}
        </span>
        <span class="text-[11px] text-slate-500 dark:text-slate-400">
          {{ result.totalVotes > 0 ? ((result.blankVotes / result.totalVotes) * 100).toFixed(1) : 0 }}% do total
        </span>
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mínimo para 50% + 1</span>
        <span class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
          {{ result.requiredVotesToWin }}
        </span>
        <span class="text-[11px] text-slate-500 dark:text-slate-400">votos necessários</span>
      </div>
    </div>

    <!-- Detalhamento Visual das Opções de Voto -->
    <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div class="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <BarChart3 class="w-5 h-5 text-slate-700 dark:text-slate-300" />
        <h3 class="text-base font-bold text-slate-900 dark:text-white">
          Distribuição dos Votos Apurados
        </h3>
      </div>

      <!-- Apuração Chapa Única (SIM vs NÃO vs BRANCO) -->
      <div v-if="result.singleSlateResult" class="space-y-4">
        <!-- Barra SIM -->
        <div>
          <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-white mb-1.5">
            <span class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle class="w-4 h-4" />
              SIM (Aprovação da Chapa)
            </span>
            <span>
              {{ result.singleSlateResult.yesVotes }} votos ({{ result.singleSlateResult.yesPercentage }}%)
            </span>
          </div>
          <div class="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-emerald-500 rounded-full transition-all duration-500"
              :style="{ width: `${result.singleSlateResult.yesPercentage}%` }"
            />
          </div>
        </div>

        <!-- Barra NÃO -->
        <div>
          <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-white mb-1.5">
            <span class="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <XCircle class="w-4 h-4" />
              NÃO (Rejeição da Chapa)
            </span>
            <span>
              {{ result.singleSlateResult.noVotes }} votos ({{ result.singleSlateResult.noPercentage }}%)
            </span>
          </div>
          <div class="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-rose-500 rounded-full transition-all duration-500"
              :style="{ width: `${result.singleSlateResult.noPercentage}%` }"
            />
          </div>
        </div>

        <!-- Barra BRANCO (se houver) -->
        <div v-if="result.blankVotes > 0">
          <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-white mb-1.5">
            <span class="flex items-center gap-1.5 text-slate-500">
              <MinusCircle class="w-4 h-4" />
              Voto em Branco
            </span>
            <span>
              {{ result.blankVotes }} votos ({{ result.singleSlateResult.blankPercentage }}%)
            </span>
          </div>
          <div class="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-slate-400 rounded-full transition-all duration-500"
              :style="{ width: `${result.singleSlateResult.blankPercentage}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Apuração Múltiplas Chapas -->
      <div v-else-if="result.multiSlateResult" class="space-y-4">
        <div
          v-for="item in result.multiSlateResult.slatesTally"
          :key="item.slate.id"
        >
          <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-white mb-1.5">
            <span class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 text-xs bg-slate-900 text-white rounded font-bold">
                {{ item.slate.number }}
              </span>
              {{ item.slate.name }}
            </span>
            <span>{{ item.votes }} votos ({{ item.percentage }}%)</span>
          </div>
          <div class="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all duration-500"
              :style="{ width: `${item.percentage}%` }"
            />
          </div>
        </div>

        <div v-if="result.blankVotes > 0">
          <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-white mb-1.5">
            <span class="flex items-center gap-1.5 text-slate-500">
              <MinusCircle class="w-4 h-4" />
              Voto em Branco
            </span>
            <span>
              {{ result.blankVotes }} votos ({{ result.totalVotes > 0 ? ((result.blankVotes / result.totalVotes) * 100).toFixed(2) : 0 }}%)
            </span>
          </div>
          <div class="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-slate-400 rounded-full transition-all duration-500"
              :style="{ width: `${result.totalVotes > 0 ? ((result.blankVotes / result.totalVotes) * 100) : 0}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
