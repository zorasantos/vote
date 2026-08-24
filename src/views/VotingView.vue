<script setup lang="ts">
import {
  ArrowRight,
  HelpCircle,
  Lock,
  ShieldCheck,
  StopCircle,
  Volume2,
  VolumeX,
  Vote,
} from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "~/components/common/BaseButton.vue";
import BaseModal from "~/components/common/BaseModal.vue";
import PinModal from "~/components/common/PinModal.vue";
import SingleSlateBallot from "~/components/voting/SingleSlateBallot.vue";
import VoteConfirmation from "~/components/voting/VoteConfirmation.vue";
import VoteSuccess from "~/components/voting/VoteSuccess.vue";
import { useKeyboardShortcuts } from "~/composables/useKeyboardShortcuts";
import { useVotingSession } from "~/composables/useVotingSession";
import type { VoteChoice } from "~/domain/types";
import { useElectionStore } from "~/store/electionStore";
import { useUiStore } from "~/store/uiStore";

const router = useRouter();
const electionStore = useElectionStore();
const uiStore = useUiStore();

const {
  step,
  selectedChoice,
  countdown,
  startSession,
  selectChoice,
  backToSelection,
  confirmVote,
  finishSession,
} = useVotingSession();

const isSaving = ref(false);
const showPinModal = ref(false);
const pinTargetAction = ref<"exit" | "closeElection" | null>(null);
const showConfirmCloseElectionModal = ref(false);

const isSingleSlate = computed(
  () => electionStore.currentElection?.mode === "SINGLE_SLATE_APPROVAL",
);

function handleSelectChoice(choice: VoteChoice) {
  uiStore.playBeep("confirm");
  selectChoice(choice);
}

async function handleConfirmVote() {
  isSaving.value = true;
  try {
    await confirmVote(async (choice) => {
      await electionStore.registerVote(choice);
      uiStore.playBeep("vote");
    });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Erro desconhecido";
    uiStore.playBeep("error");
    uiStore.addToast("error", "Falha ao registrar voto", errorMsg);
  } finally {
    isSaving.value = false;
  }
}

// Atalhos de teclado para a urna
useKeyboardShortcuts({
  onKey1: () => {
    if (step.value === "READY") {
      startSession();
    } else if (step.value === "SELECTING") {
      if (isSingleSlate.value) {
        handleSelectChoice("YES");
      } else if (electionStore.slates[0]) {
        handleSelectChoice({
          type: "SLATE",
          slateId: electionStore.slates[0].id,
        });
      }
    }
  },
  onKey2: () => {
    if (step.value === "SELECTING") {
      if (isSingleSlate.value) {
        handleSelectChoice("NO");
      } else if (electionStore.slates[1]) {
        handleSelectChoice({
          type: "SLATE",
          slateId: electionStore.slates[1].id,
        });
      }
    }
  },
  onKey0: () => {
    if (
      step.value === "SELECTING" &&
      electionStore.currentElection?.allowBlankVote
    ) {
      handleSelectChoice("BLANK");
    }
  },
  onEnter: () => {
    if (step.value === "READY") {
      startSession();
    } else if (step.value === "CONFIRMING" && !isSaving.value) {
      handleConfirmVote();
    }
  },
  onBackspace: () => {
    if (step.value === "CONFIRMING" && !isSaving.value) {
      uiStore.playBeep("confirm");
      backToSelection();
    }
  },
  onSpace: () => {
    if (step.value === "READY") {
      startSession();
    } else if (step.value === "SUCCESS") {
      finishSession();
    }
  },
});

function requestExit() {
  pinTargetAction.value = "exit";
  showPinModal.value = true;
}

function requestCloseElection() {
  pinTargetAction.value = "closeElection";
  showPinModal.value = true;
}

function onPinSuccess() {
  if (pinTargetAction.value === "exit") {
    router.push("/");
  } else if (pinTargetAction.value === "closeElection") {
    showConfirmCloseElectionModal.value = true;
  }
}

async function handleCloseElectionConfirmed() {
  try {
    await electionStore.closeElection();
    showConfirmCloseElectionModal.value = false;
    uiStore.addToast(
      "success",
      "Eleição Encerrada!",
      "Redirecionando para a tela de apuração e emissão da ata.",
    );
    router.push("/results");
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Erro desconhecido";
    uiStore.addToast("error", "Erro ao encerrar", errorMsg);
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 select-none">
    <!-- Barra Superior da Cabine (Kiosk Bar) -->
    <header class="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shadow-md shrink-0">
      <div class="flex items-center gap-3">
        <div class="p-1.5 bg-emerald-500 text-slate-900 rounded-lg font-black">
          <Vote class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-sm sm:text-base font-bold truncate max-w-xs sm:max-w-md">
            {{ electionStore.currentElection?.associationName || 'Cabine de Votação' }}
          </h1>
          <p class="text-xs text-slate-400 truncate">
            {{ electionStore.currentElection?.title }}
          </p>
        </div>
      </div>

      <!-- Controles do Mesário (Protegidos) -->
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300">
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
          <span>Votos computados: <strong class="text-white">{{ electionStore.totalVotesCount }}</strong></span>
        </div>

        <button
          type="button"
          class="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          :title="uiStore.isSoundEnabled ? 'Desativar som' : 'Ativar som'"
          @click="uiStore.toggleSound"
        >
          <Volume2 v-if="uiStore.isSoundEnabled" class="w-4 h-4" />
          <VolumeX v-else class="w-4 h-4" />
        </button>

        <button
          v-if="electionStore.isOpen"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/40 rounded-xl transition-colors cursor-pointer"
          @click="requestCloseElection"
        >
          <StopCircle class="w-4 h-4" />
          Encerrar Pleito
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-colors cursor-pointer"
          @click="requestExit"
        >
          <Lock class="w-3.5 h-3.5" />
          Sair da Urna
        </button>
      </div>
    </header>

    <!-- Conteúdo Central da Cabine -->
    <main class="flex-1 flex items-center justify-center p-4 sm:p-8">
      <!-- 1. Estado READY: Tela de Espera do Votante -->
      <div
        v-if="step === 'READY'"
        class="max-w-xl w-full text-center py-12 px-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-8"
      >
        <div class="w-20 h-20 mx-auto flex items-center justify-center bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-3xl shadow-md">
          <Vote class="w-10 h-10" />
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            CABINE DE VOTAÇÃO
          </h2>
          <p class="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Por favor, aproxime-se da cabine para registrar o seu voto. O voto é secreto e inviolável.
          </p>
        </div>

        <div class="pt-4">
          <BaseButton
            variant="success"
            size="xl"
            class="w-full justify-center text-xl font-black py-6 tracking-wide shadow-xl hover:scale-102"
            @click="startSession"
          >
            INICIAR VOTAÇÃO (Espaço / Enter)
            <ArrowRight class="w-6 h-6 ml-2" />
          </BaseButton>
        </div>
      </div>

      <!-- 2. Estado SELECTING: Escolha na Cédula -->
      <div v-else-if="step === 'SELECTING'" class="w-full max-w-4xl">
        <SingleSlateBallot
          :slate="electionStore.slates[0] || { id: 'slate-01', electionId: '', number: '01', name: 'Chapa 01', members: [], createdAt: '' }"
          :allow-blank-vote="false"
          @select="handleSelectChoice"
        />
      </div>

      <!-- 3. Estado CONFIRMING / SAVING: Revisão em 2 Passos -->
      <div v-else-if="step === 'CONFIRMING' || step === 'SAVING'" class="w-full max-w-2xl">
        <VoteConfirmation
          :choice="selectedChoice!"
          :slates="electionStore.slates"
          :is-saving="isSaving"
          @confirm="handleConfirmVote"
          @cancel="backToSelection"
        />
      </div>

      <!-- 4. Estado SUCCESS: Voto Registrado -->
      <div v-else-if="step === 'SUCCESS'" class="w-full max-w-xl">
        <VoteSuccess
          :countdown="countdown"
          @next="finishSession"
        />
      </div>
    </main>

    <!-- Modal de PIN do Mesário -->
    <PinModal
      v-model="showPinModal"
      @success="onPinSuccess"
    />

    <!-- Modal de Confirmação de Encerramento do Pleito -->
    <BaseModal
      v-model="showConfirmCloseElectionModal"
      title="Encerrar Votação Oficial?"
      description="Esta ação fechará a urna definitivamente. Não será possível registrar novos votos."
      max-width="md"
    >
      <div class="space-y-3">
        <div class="p-4 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200">
          <p class="font-bold mb-1">Atenção Mesário:</p>
          <p>Total de votos apurados até agora: <strong>{{ electionStore.totalVotesCount }} voto(s)</strong>.</p>
          <p class="mt-1">Ao confirmar, o sistema gerará a ata oficial com o hash criptográfico final.</p>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="outline" size="md" @click="showConfirmCloseElectionModal = false">
          Voltar para Votação
        </BaseButton>
        <BaseButton variant="danger" size="md" @click="handleCloseElectionConfirmed">
          <StopCircle class="w-4 h-4 mr-1" />
          Confirmar e Encerrar Urna
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
