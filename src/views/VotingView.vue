<script setup lang="ts">
import {
  ArrowRight,
  ShieldCheck,
  Volume2,
  VolumeX,
  Vote,
} from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "~/components/common/BaseButton.vue";
import SingleSlateBallot from "~/components/voting/SingleSlateBallot.vue";
import VoteConfirmation from "~/components/voting/VoteConfirmation.vue";
import VoteSuccess from "~/components/voting/VoteSuccess.vue";
import { useKeyboardShortcuts } from "~/composables/useKeyboardShortcuts";
import { useVotingSession } from "~/composables/useVotingSession";
import type { Slate, VoteChoice } from "~/domain/types";
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
} = useVotingSession({
  onComplete: () => {
    router.push("/voted");
  },
});

const isSaving = ref(false);

const isSingleSlate = computed(
  () => electionStore.currentElection?.mode === "SINGLE_SLATE_APPROVAL",
);

const currentSlate = computed<Slate>(() => {
  return (
    electionStore.slates[0] || {
      id: "slate-01",
      electionId: electionStore.currentElection?.id || "",
      number: "01",
      name: "Chapa 01",
      members: [],
      createdAt: "",
    }
  );
});

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
    }
  },
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 select-none">
    <!-- Barra Superior da Cabine (Kiosk Bar) -->
    <header class="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shadow-md shrink-0">
      <div class="flex items-center gap-3">
        <img
          :src="electionStore.currentElection?.associationLogo || '/ace-logo.jpg'"
          alt="Logo da Associação"
          class="w-9 h-9 object-contain rounded-xl bg-white p-1 border border-slate-700 shadow-xs"
        />
        <div>
          <h1 class="text-sm sm:text-base font-bold truncate max-w-xs sm:max-w-md">
            {{ electionStore.currentElection?.associationName || 'Associação Cearense de Escritores - ACE' }}
          </h1>
          <p class="text-xs text-slate-400 truncate">
            {{ electionStore.currentElection?.title || 'Eleição da Mesa Diretora — Biênio 2026/2028' }}
          </p>
        </div>
      </div>

      <!-- Controles do Mesário / Status -->
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
      </div>
    </header>

    <!-- Conteúdo Central da Cabine -->
    <main class="flex-1 flex items-center justify-center p-4 sm:p-8">
      <!-- 1. Estado READY: Tela de Espera do Votante -->
      <div
        v-if="step === 'READY'"
        class="max-w-xl w-full text-center py-10 px-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
      >
        <div class="relative inline-block mx-auto">
          <img
            :src="electionStore.currentElection?.associationLogo || '/ace-logo.jpg'"
            alt="Logo da Associação"
            class="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain rounded-3xl bg-white p-2 border-2 border-slate-200 dark:border-slate-700 shadow-lg"
          />
        </div>

        <div class="space-y-2">
          <p class="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            {{ electionStore.currentElection?.associationName || 'Associação Cearense de Escritores - ACE' }}
          </p>
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
          :slate="currentSlate"
          :allow-blank-vote="false"
          @select="handleSelectChoice"
        />
      </div>

      <!-- 3. Estado CONFIRMING / SAVING: Revisão em 2 Passos -->
      <div v-else-if="(step === 'CONFIRMING' || step === 'SAVING') && selectedChoice" class="w-full max-w-2xl">
        <VoteConfirmation
          :choice="selectedChoice"
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
  </div>
</template>
