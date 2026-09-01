<script setup lang="ts">
import { CheckCircle2, ShieldCheck } from "lucide-vue-next";
import { onMounted } from "vue";
import { useElectionStore } from "~/store/electionStore";

const electionStore = useElectionStore();

onMounted(async () => {
  if (!electionStore.currentElection) {
    await electionStore.loadActiveElection();
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 select-none">
    <div class="max-w-xl w-full text-center space-y-6">
      <!-- Topo / Identidade da Associação -->
      <div class="space-y-3">
        <div class="relative inline-block mx-auto">
          <img
            :src="electionStore.currentElection?.associationLogo || '/ace-logo.jpg'"
            alt="Logo da Associação"
            class="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain rounded-2xl bg-white p-2 border-2 border-slate-200 dark:border-slate-700 shadow-md"
          />
        </div>

        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            {{ electionStore.currentElection?.associationName || 'Associação Cearense de Escritores - ACE' }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ electionStore.currentElection?.title || 'Eleição da Mesa Diretora — Biênio 2026/2028' }}
          </p>
        </div>
      </div>

      <!-- Card Central de Voto Computado -->
      <div class="p-8 sm:p-10 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 dark:bg-emerald-950/80 rounded-full text-emerald-600 dark:text-emerald-400 shadow-sm">
          <CheckCircle2 class="w-12 h-12" />
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            VOTO COMPUTADO COM SUCESSO!
          </h1>
          <p class="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Sua cédula foi depositada de forma anônima, segura e auditável na urna eletrônica.
          </p>
        </div>

        <!-- Quadro de Computação de Votos -->
        <div class="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div class="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <ShieldCheck class="w-4 h-4 text-emerald-500" />
            <span>Total de Votos Computados na Urna</span>
          </div>

          <div class="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            {{ electionStore.totalVotesCount }}
          </div>

          <p class="text-xs text-slate-500 dark:text-slate-400">
            voto(s) registrado(s) nesta sessão eleitoral
          </p>
        </div>

        <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200">
          Obrigado pela sua participação na votação da Mesa Diretora!
        </div>
      </div>
    </div>
  </div>
</template>
