import { onUnmounted, ref } from "vue";
import type { VoteChoice } from "~/domain/types";

export type VotingStep =
  | "READY"
  | "SELECTING"
  | "CONFIRMING"
  | "SAVING"
  | "SUCCESS";

export function useVotingSession(options?: { onComplete?: () => void }) {
  const step = ref<VotingStep>("READY");
  const selectedChoice = ref<VoteChoice | null>(null);
  const countdown = ref<number>(3);
  let timerId: ReturnType<typeof setInterval> | null = null;

  function startSession() {
    step.value = "SELECTING";
    selectedChoice.value = null;
  }

  function selectChoice(choice: VoteChoice) {
    selectedChoice.value = choice;
    step.value = "CONFIRMING";
  }

  function backToSelection() {
    step.value = "SELECTING";
  }

  async function confirmVote(submitFn: (choice: VoteChoice) => Promise<void>) {
    if (!selectedChoice.value) return;
    step.value = "SAVING";
    try {
      await submitFn(selectedChoice.value);
      step.value = "SUCCESS";
      startSuccessCountdown();
    } catch {
      step.value = "CONFIRMING";
      throw new Error("Falha ao registrar voto.");
    }
  }

  function startSuccessCountdown() {
    countdown.value = 3;
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        finishSession();
      }
    }, 1000);
  }

  function finishSession() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    selectedChoice.value = null;
    step.value = "READY";
    if (options?.onComplete) {
      options.onComplete();
    }
  }

  onUnmounted(() => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  });

  return {
    step,
    selectedChoice,
    countdown,
    startSession,
    selectChoice,
    backToSelection,
    confirmVote,
    finishSession,
  };
}
