<script setup lang="ts">
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  PieChart,
  Play,
  Settings2,
  Sparkles,
  Users,
  Vote,
} from "lucide-vue-next";
import { ref } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "~/components/common/BaseButton.vue";
import PinModal from "~/components/common/PinModal.vue";
import { seedSingleSlateElection } from "~/db/seed";
import { useElectionStore } from "~/store/electionStore";
import { useUiStore } from "~/store/uiStore";

const router = useRouter();
const electionStore = useElectionStore();
const uiStore = useUiStore();

const showPinModal = ref(false);
const pendingAction = ref<(() => void) | null>(null);

function handleOpenVoting() {
  router.push("/voting");
}

async function handleLoadSeed() {
  try {
    await seedSingleSlateElection();
    await electionStore.loadActiveElection();
    uiStore.addToast(
      "success",
      "Demonstração Carregada!",
      "Eleição de chapa única criada em modo rascunho.",
    );
  } catch (e: any) {
    uiStore.addToast("error", "Falha ao carregar demonstração", e.message);
  }
}
</script>

<template>
  <div class="space-y-8 py-6">
    <!-- Hero / Status da Eleição Ativa -->
    <div
      class="p-6 sm:p-10 rounded-3xl border-2 shadow-xl transition-all"
      :class="
        electionStore.isOpen
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700'
          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800'
      "
    >
      <div class="max-w-3xl space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          {{ electionStore.isOpen ? 'Votação em Andamento' : electionStore.isClosed ? 'Eleição Encerrada' : 'Rascunho / Configuração' }}
        </div>

        <h1 class="text-2xl sm:text-4xl font-black tracking-tight">
          {{ electionStore.currentElection?.title || 'Nenhuma Eleição Configurada' }}
        </h1>

        <p class="text-sm sm:text-base opacity-80 leading-relaxed font-medium">
          {{ electionStore.currentElection?.associationName || 'Configure uma nova eleição para a Mesa Diretora da sua associação.' }}
        </p>

        <!-- Ações do Hero -->
        <div class="flex flex-wrap items-center gap-3 pt-4">
          <BaseButton
            v-if="electionStore.isOpen"
            variant="success"
            size="xl"
            class="shadow-lg shadow-emerald-900/20 font-black tracking-wide"
            @click="handleOpenVoting"
          >
            <Vote class="w-6 h-6 mr-1" />
            ENTRAR NA CABINE DE VOTAÇÃO
          </BaseButton>

          <BaseButton
            v-else-if="electionStore.isDraft"
            variant="primary"
            size="lg"
            @click="router.push('/setup')"
          >
            <Settings2 class="w-5 h-5 mr-1" />
            Concluir Configuração & Abrir Eleição
          </BaseButton>

          <BaseButton
            v-else-if="electionStore.isClosed"
            variant="primary"
            size="lg"
            @click="router.push('/results')"
          >
            <PieChart class="w-5 h-5 mr-1" />
            Ver Relatório e Ata de Apuração
          </BaseButton>

          <BaseButton
            v-if="!electionStore.currentElection"
            variant="secondary"
            size="md"
            @click="handleLoadSeed"
          >
            <Sparkles class="w-4 h-4 mr-1 text-amber-500" />
            Carregar Exemplo de Demonstração
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Cards de Acesso Rápido -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Card Cabine -->
      <div
        class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer group"
        @click="router.push('/voting')"
      >
        <div class="w-12 h-12 flex items-center justify-center bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-2xl mb-4 group-hover:scale-105 transition-transform">
          <Vote class="w-6 h-6" />
        </div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Cabine de Votação</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Interface em modo urna para registro anônimo de votos pelos associados.
        </p>
        <div class="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          Acessar Urna <ArrowRight class="w-3.5 h-3.5" />
        </div>
      </div>

      <!-- Card Configuração -->
      <div
        class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer group"
        @click="router.push('/setup')"
      >
        <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-2xl mb-4 group-hover:scale-105 transition-transform">
          <Settings2 class="w-6 h-6" />
        </div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Configurações & Chapas</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Gestão de candidatos, cargos da mesa diretora e regras de quórum.
        </p>
        <div class="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
          Configurar <ArrowRight class="w-3.5 h-3.5" />
        </div>
      </div>

      <!-- Card Apuração -->
      <div
        class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer group"
        @click="router.push('/results')"
      >
        <div class="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-2xl mb-4 group-hover:scale-105 transition-transform">
          <PieChart class="w-6 h-6" />
        </div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Apuração & Ata em PDF</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Cálculo formal de 50% + 1, proclamação e emissão do documento da ata.
        </p>
        <div class="mt-4 flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
          Ver Resultados <ArrowRight class="w-3.5 h-3.5" />
        </div>
      </div>

      <!-- Card Backup -->
      <div
        class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer group"
        @click="router.push('/backup')"
      >
        <div class="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl mb-4 group-hover:scale-105 transition-transform">
          <Database class="w-6 h-6" />
        </div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Backup & Integridade</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Exportação/importação de dados JSON com validação canônica SHA-256.
        </p>
        <div class="mt-4 flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400">
          Gerenciar <ArrowRight class="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  </div>
</template>
