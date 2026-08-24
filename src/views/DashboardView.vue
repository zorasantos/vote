<script setup lang="ts">
import {
  ArrowRight,
  Database,
  PieChart,
  Settings2,
  StopCircle,
  Users,
  Vote,
} from "lucide-vue-next";
import { ref } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "~/components/common/BaseButton.vue";
import BaseModal from "~/components/common/BaseModal.vue";
import { useElectionStore } from "~/store/electionStore";
import { useUiStore } from "~/store/uiStore";

const router = useRouter();
const electionStore = useElectionStore();
const uiStore = useUiStore();

const showConfirmCloseElectionModal = ref(false);
const isClosing = ref(false);

function handleOpenVoting() {
  router.push("/voting");
}

function handleRequestCloseElection() {
  showConfirmCloseElectionModal.value = true;
}

async function handleConfirmCloseElection() {
  isClosing.value = true;
  try {
    await electionStore.closeElection();
    showConfirmCloseElectionModal.value = false;
    uiStore.addToast(
      "success",
      "Pleito Encerrado com Sucesso!",
      "Redirecionando para a tela de apuração e emissão da ata.",
    );
    router.push("/results");
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Erro desconhecido";
    uiStore.addToast("error", "Erro ao encerrar pleito", errorMsg);
  } finally {
    isClosing.value = false;
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
          ? 'bg-linear-to-br from-slate-900 to-slate-800 text-white border-slate-700'
          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800'
      "
    >
      <div class="max-w-3xl space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          {{ electionStore.isOpen ? 'Votação em Andamento' : electionStore.isClosed ? 'Votação Encerrada' : 'Pronto para Configurar e Votar' }}
        </div>

        <h1 class="text-2xl sm:text-4xl font-black tracking-tight">
          Votação da Chapa 01
        </h1>

        <p class="text-sm sm:text-base opacity-80 leading-relaxed font-medium">
          Sistema eletrônico simples para votação da Mesa Diretora da Associação.
        </p>

        <!-- Quórum Rápido se houver -->
        <div class="flex flex-wrap items-center gap-4 text-xs font-bold pt-2 opacity-90">
          <div class="flex items-center gap-1.5 bg-black/10 dark:bg-white/10 px-3 py-1.5 rounded-xl">
            <Users class="w-4 h-4" />
            Associados: {{ electionStore.currentElection?.totalMembers || 100 }}
          </div>
          <div class="flex items-center gap-1.5 bg-black/10 dark:bg-white/10 px-3 py-1.5 rounded-xl">
            Presentes: {{ electionStore.currentElection?.presentMembers || 50 }}
          </div>
          <div v-if="electionStore.isOpen || electionStore.isClosed" class="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl">
            Votos Computados: {{ electionStore.totalVotesCount }}
          </div>
        </div>

        <!-- Ações do Hero -->
        <div class="flex flex-wrap items-center gap-3 pt-4">
          <template v-if="electionStore.isOpen">
            <BaseButton
              variant="success"
              size="xl"
              class="shadow-lg shadow-emerald-900/20 font-black tracking-wide py-4 px-8 text-lg"
              @click="handleOpenVoting"
            >
              <Vote class="w-6 h-6 mr-2" />
              ENTRAR NA CABINE DE VOTAÇÃO
            </BaseButton>

            <BaseButton
              variant="danger"
              size="xl"
              class="font-black tracking-wide py-4 px-6 text-base shadow-md"
              @click="handleRequestCloseElection"
            >
              <StopCircle class="w-5 h-5 mr-2" />
              ENCERRAR PLEITO
            </BaseButton>
          </template>

          <BaseButton
            v-else-if="electionStore.isDraft"
            variant="primary"
            size="lg"
            class="font-bold py-3.5 px-6"
            @click="router.push('/setup')"
          >
            <Settings2 class="w-5 h-5 mr-2" />
            Configurar Presentes & Abrir Votação
          </BaseButton>

          <BaseButton
            v-else-if="electionStore.isClosed"
            variant="primary"
            size="lg"
            class="font-bold py-3.5 px-6"
            @click="router.push('/results')"
          >
            <PieChart class="w-5 h-5 mr-2" />
            Ver Relatório e Ata de Apuração
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
          Interface em modo urna com botões gigantes SIM e NÃO.
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
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Configurar Presentes</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Informe o número de associados e presentes na votação.
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
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Apuração & Ata PDF</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Visualização dos votos apurados e download da ata oficial.
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
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Backup de Segurança</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Exportação e importação de cópias de segurança locais.
        </p>
        <div class="mt-4 flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400">
          Gerenciar <ArrowRight class="w-3.5 h-3.5" />
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação de Encerramento do Pleito -->
    <BaseModal
      v-model="showConfirmCloseElectionModal"
      title="Encerrar Votação Oficial?"
      description="Esta ação fechará a urna definitivamente. Não será possível registrar novos votos após o encerramento."
      max-width="md"
    >
      <div class="space-y-3">
        <div class="p-4 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200">
          <p class="font-bold mb-1">Atenção do Responsável:</p>
          <p>Total de votos computados até o momento: <strong>{{ electionStore.totalVotesCount }} voto(s)</strong>.</p>
          <p class="mt-1">Ao confirmar, o pleito será fechado com chave de segurança e você será direcionado para a tela de apuração e emissão da ata oficial.</p>
        </div>
      </div>

      <template #footer>
        <BaseButton
          variant="outline"
          size="md"
          :disabled="isClosing"
          @click="showConfirmCloseElectionModal = false"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          variant="danger"
          size="md"
          :loading="isClosing"
          @click="handleConfirmCloseElection"
        >
          <StopCircle class="w-4 h-4 mr-1" />
          Confirmar e Encerrar Urna
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
