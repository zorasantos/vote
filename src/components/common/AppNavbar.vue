<script setup lang="ts">
import {
  Database,
  LayoutDashboard,
  Menu,
  PieChart,
  Settings2,
  Volume2,
  VolumeX,
  X,
} from "lucide-vue-next";
import { type Component, computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useElectionStore } from "~/store/electionStore";
import { useUiStore } from "~/store/uiStore";

interface NavLinkItem {
  path: string;
  label: string;
  icon: Component;
  description: string;
  highlight?: boolean;
}

const route = useRoute();
const router = useRouter();
const electionStore = useElectionStore();
const uiStore = useUiStore();

const isMobileMenuOpen = ref(false);

// Fecha o menu móvel ao mudar de rota
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  },
);

const currentPath = computed(() => route.path);

const isKioskScreen = computed(
  () =>
    route.path === "/voting" ||
    route.path === "/voted" ||
    route.path === "/display" ||
    route.path === "/telao" ||
    route.path === "/qrcode",
);

const statusBadge = computed(() => {
  if (!electionStore.currentElection) {
    return {
      label: "Sem Eleição",
      shortLabel: "Sem Eleição",
      class:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
  }
  switch (electionStore.currentElection.status) {
    case "OPEN":
      return {
        label: "Votação Aberta",
        shortLabel: "Aberta",
        class:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 animate-pulse",
      };
    case "CLOSED":
      return {
        label: "Votação Encerrada",
        shortLabel: "Encerrada",
        class:
          "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
      };
    default:
      return {
        label: "Configuração (Rascunho)",
        shortLabel: "Rascunho",
        class:
          "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700",
      };
  }
});

const navLinks: NavLinkItem[] = [
  {
    path: "/",
    label: "Início",
    icon: LayoutDashboard,
    description: "Painel de controle e status",
  },
  {
    path: "/setup",
    label: "Configuração",
    icon: Settings2,
    description: "Parâmetros e abertura do pleito",
  },
  {
    path: "/results",
    label: "Apuração",
    icon: PieChart,
    description: "Resultados e ata oficial",
  },
  {
    path: "/backup",
    label: "Backup",
    icon: Database,
    description: "Segurança e exportação de dados",
  },
];

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}
</script>

<template>
  <header
    v-if="!isKioskScreen"
    class="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors"
  >
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
      <!-- Logo & Título da Associação -->
      <div
        class="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0 flex-1 sm:flex-initial"
        @click="router.push('/'); closeMobileMenu()"
      >
        <div class="relative shrink-0">
          <img
            :src="electionStore.currentElection?.associationLogo || '/ace-logo.jpg'"
            alt="Logo da Associação"
            class="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-700 shadow-xs group-hover:scale-105 transition-transform"
          />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h1 class="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
              {{ electionStore.currentElection?.associationName || 'Associação Cearense de Escritores - ACE' }}
            </h1>
            <span
              class="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full shrink-0"
              :class="statusBadge.class"
            >
              {{ statusBadge.label }}
            </span>
          </div>
          <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {{ electionStore.currentElection?.title || 'Eleição da Mesa Diretora — Biênio 2026/2028' }}
          </p>
        </div>
      </div>

      <!-- Links de Navegação (Desktop >= md) -->
      <nav class="hidden md:flex items-center gap-1">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="
            currentPath === link.path
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
          "
        >
          <component
            :is="link.icon"
            class="w-4 h-4"
          />
          {{ link.label }}
        </router-link>
      </nav>

      <!-- Ações do Cabeçalho (Som + Botão Hambúrguer Mobile) -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Toggle de Áudio -->
        <button
          type="button"
          class="p-2 sm:p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          :title="uiStore.isSoundEnabled ? 'Desativar sons da urna' : 'Ativar sons da urna'"
          :aria-label="uiStore.isSoundEnabled ? 'Desativar sons da urna' : 'Ativar sons da urna'"
          @click="uiStore.toggleSound"
        >
          <Volume2 v-if="uiStore.isSoundEnabled" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <VolumeX v-else class="w-4 h-4 text-slate-400" />
        </button>

        <!-- Botão Hambúrguer (Visível apenas em Mobile/Tablet < md) -->
        <button
          type="button"
          class="md:hidden p-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Alternar menu de navegação"
          @click="toggleMobileMenu"
        >
          <X v-if="isMobileMenuOpen" class="w-5 h-5 text-slate-900 dark:text-white" />
          <Menu v-else class="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
      </div>
    </div>

    <!-- Menu Dropdown / Drawer Mobile -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2 scale-98"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-98"
    >
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl shadow-2xl px-4 py-4 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto"
      >
        <!-- Status do Pleito no Mobile -->
        <div class="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div class="min-w-0 pr-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
              Situação da Eleição
            </span>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
              {{ electionStore.currentElection?.title || 'Eleição da Mesa Diretora' }}
            </span>
          </div>
          <span
            class="px-2.5 py-1 text-xs font-bold rounded-full shrink-0"
            :class="statusBadge.class"
          >
            {{ statusBadge.label }}
          </span>
        </div>

        <!-- Links de Navegação Mobile -->
        <div class="space-y-1">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="flex items-center gap-3 p-3 rounded-2xl text-sm font-medium transition-all cursor-pointer"
            :class="
              currentPath === link.path
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            "
            @click="closeMobileMenu"
          >
            <div
              class="p-2 rounded-xl"
              :class="
                currentPath === link.path
                  ? 'bg-white/10 dark:bg-slate-900/10'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              "
            >
              <component :is="link.icon" class="w-5 h-5" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold truncate">{{ link.label }}</span>
                <span
                  v-if="link.highlight && electionStore.isOpen"
                  class="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500 text-white"
                >
                  Votar
                </span>
              </div>
              <span
                class="text-[11px] truncate block opacity-75"
              >
                {{ link.description }}
              </span>
            </div>
          </router-link>
        </div>

        <!-- Rodapé do Menu Mobile com Controle de Áudio -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
          <span class="font-medium">Sons da Urna Eletrônica:</span>
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer"
            :class="
              uiStore.isSoundEnabled
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            "
            @click="uiStore.toggleSound"
          >
            <Volume2 v-if="uiStore.isSoundEnabled" class="w-3.5 h-3.5" />
            <VolumeX v-else class="w-3.5 h-3.5" />
            {{ uiStore.isSoundEnabled ? 'Ativados' : 'Silenciados' }}
          </button>
        </div>
      </div>
    </transition>
  </header>
</template>
