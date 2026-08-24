<script setup lang="ts">
import {
  BarChart3,
  CheckCircle,
  UserCheck,
  Users,
  XCircle,
} from "lucide-vue-next";
import type { ElectionResult } from "~/domain/types";

defineProps<{
  result: ElectionResult;
}>();
</script>

<template>
  <div class="space-y-6">
    <!-- Cards de Métricas Principais -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <!-- 1. Pessoas na Associação -->
      <div class="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div class="flex items-center gap-2 mb-2">
          <div class="p-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl">
            <Users class="w-4 h-4" />
          </div>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Pessoas na Associação</span>
        </div>
        <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
          {{ result.totalMembers || 0 }}
        </span>
        <span class="text-xs text-slate-400">Total de associados</span>
      </div>

      <!-- 2. Presentes na Votação -->
      <div class="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div class="flex items-center gap-2 mb-2">
          <div class="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
            <UserCheck class="w-4 h-4" />
          </div>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Pessoas Presentes</span>
        </div>
        <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
          {{ result.presentMembers || 0 }}
        </span>
        <span class="text-xs text-slate-400">Aptos a votar</span>
      </div>

      <!-- 3. Votos SIM -->
      <div class="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
        <div class="flex items-center gap-2 mb-2">
          <div class="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
            <CheckCircle class="w-4 h-4" />
          </div>
          <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400">Votos SIM</span>
        </div>
        <span class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 block">
          {{ result.singleSlateResult?.yesVotes || 0 }}
        </span>
        <span class="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium">
          {{ result.singleSlateResult?.yesPercentage || 0 }}% dos votos
        </span>
      </div>

      <!-- 4. Votos NÃO -->
      <div class="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-xs">
        <div class="flex items-center gap-2 mb-2">
          <div class="p-2 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-xl">
            <XCircle class="w-4 h-4" />
          </div>
          <span class="text-xs font-bold text-rose-700 dark:text-rose-400">Votos NÃO</span>
        </div>
        <span class="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 block">
          {{ result.singleSlateResult?.noVotes || 0 }}
        </span>
        <span class="text-xs text-rose-700/80 dark:text-rose-400/80 font-medium">
          {{ result.singleSlateResult?.noPercentage || 0 }}% dos votos
        </span>
      </div>
    </div>

    <!-- Detalhamento Visual das Barras de Votação -->
    <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <BarChart3 class="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Apuração dos Votos da Chapa 01
          </h3>
        </div>
        <div class="text-xs font-semibold text-slate-500">
          Total de Votos Depositados: <strong class="text-slate-900 dark:text-white">{{ result.totalVotes }}</strong>
        </div>
      </div>

      <div class="space-y-5">
        <!-- Barra SIM -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-base font-black text-slate-900 dark:text-white">
            <span class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle class="w-5 h-5" />
              SIM (Aprovação da Chapa 01)
            </span>
            <span>
              {{ result.singleSlateResult?.yesVotes || 0 }} votos ({{ result.singleSlateResult?.yesPercentage || 0 }}%)
            </span>
          </div>
          <div class="w-full h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              class="h-full bg-emerald-500 rounded-full transition-all duration-700"
              :style="{ width: `${result.singleSlateResult?.yesPercentage || 0}%` }"
            />
          </div>
        </div>

        <!-- Barra NÃO -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-base font-black text-slate-900 dark:text-white">
            <span class="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <XCircle class="w-5 h-5" />
              NÃO (Rejeição da Chapa 01)
            </span>
            <span>
              {{ result.singleSlateResult?.noVotes || 0 }} votos ({{ result.singleSlateResult?.noPercentage || 0 }}%)
            </span>
          </div>
          <div class="w-full h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              class="h-full bg-rose-500 rounded-full transition-all duration-700"
              :style="{ width: `${result.singleSlateResult?.noPercentage || 0}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
