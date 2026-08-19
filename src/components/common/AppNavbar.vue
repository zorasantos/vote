<script setup lang="ts">
import {
  Database,
  LayoutDashboard,
  PieChart,
  Settings2,
  Volume2,
  VolumeX,
  Vote,
} from "lucide-vue-next";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useElectionStore } from "~/store/electionStore";
import { useUiStore } from "~/store/uiStore";

const route = useRoute();
const router = useRouter();
const electionStore = useElectionStore();
const uiStore = useUiStore();

const currentPath = computed(() => route.path);

const isVotingScreen = computed(() => route.path === "/voting");

const statusBadge = computed(() => {
  if (!electionStore.currentElection) {
    return {
      label: "Sem Eleição",
      class:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
  }
  switch (electionStore.currentElection.status) {
    case "OPEN":
      return {
        label: "Votação Aberta",
        class:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 animate-pulse",
      };
    case "CLOSED":
      return {
        label: "Votação Encerrada",
        class:
          "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
      };
    case "DRAFT":
    default:
      return {
        label: "Configuração (Rascunho)",
        class:
          "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700",
      };
  }
});
</script>

<template>
  <header
    v-if="!isVotingScreen"
    class="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo & Título da Associação -->
      <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
        <div class="p-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl shadow-xs">
          <Vote class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {{ electionStore.currentElection?.associationName || 'Votação de Mesa Diretora' }}
            </h1>
            <span
              class="px-2 py-0.5 text-xs font-semibold rounded-full"
              :class="statusBadge.class"
            >
              {{ statusBadge.label }}
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
            {{ electionStore.currentElection?.title || 'Sistema Eletrônico Local de Eleição' }}
          </p>
        </div>
      </div>

      <!-- Links de Navegação -->
      <nav class="hidden md:flex items-center gap-1">
        <router-link
          to="/"
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="currentPath === '/' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'"
        >
          <LayoutDashboard class="w-4 h-4" />
          Início
        </router-link>

        <router-link
          to="/setup"
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="currentPath === '/setup' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'"
        >
          <Settings2 class="w-4 h-4" />
          Configuração
        </router-link>

        <router-link
          to="/voting"
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="currentPath === '/voting' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'"
        >
          <Vote class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Cabine de Votação
        </router-link>

        <router-link
          to="/results"
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="currentPath === '/results' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'"
        >
          <PieChart class="w-4 h-4" />
          Apuração
        </router-link>

        <router-link
          to="/backup"
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="currentPath === '/backup' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'"
        >
          <Database class="w-4 h-4" />
          Backup
        </router-link>
      </nav>

      <!-- Toggle de Áudio -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          :title="uiStore.isSoundEnabled ? 'Desativar sons da urna' : 'Ativar sons da urna'"
          @click="uiStore.toggleSound"
        >
          <Volume2 v-if="uiStore.isSoundEnabled" class="w-4 h-4" />
          <VolumeX v-else class="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  </header>
</template>
