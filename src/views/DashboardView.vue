<script setup lang="ts">
import { PieChart, Settings2, StopCircle, Users, Vote } from "lucide-vue-next";
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
      <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div class="shrink-0">
          <img
            :src="electionStore.currentElection?.associationLogo || '/ace-logo.jpg'"
            alt="Logo da Associação"
            class="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl bg-white p-2 border-2 border-slate-200 dark:border-slate-700 shadow-md"
          />
        </div>

        <div class="max-w-3xl space-y-3 flex-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            {{ electionStore.isOpen ? 'Votação em Andamento' : electionStore.isClosed ? 'Votação Encerrada' : 'Pronto para Configurar e Votar' }}
          </div>

          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            {{ electionStore.currentElection?.associationName || 'Associação Cearense de Escritores - ACE' }}
          </h1>

          <p class="text-sm sm:text-base opacity-90 leading-relaxed font-medium">
            {{ electionStore.currentElection?.title || 'Eleição da Mesa Diretora — Biênio 2026/2028' }} (Chapa 01)
          </p>

          <!-- Quórum Rápido se houver -->
          <div class="flex flex-wrap items-center gap-4 text-xs font-bold pt-1 opacity-90">
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
