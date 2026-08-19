import { defineStore } from "pinia";
import { ref } from "vue";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

export const useUiStore = defineStore("ui", () => {
  const isSoundEnabled = ref(true);
  const toasts = ref<ToastMessage[]>([]);

  function toggleSound() {
    isSoundEnabled.value = !isSoundEnabled.value;
  }

  function playBeep(type: "vote" | "confirm" | "error" = "vote") {
    if (!isSoundEnabled.value) return;
    try {
      const AudioCtxConstructor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioCtxConstructor) return;

      const audioCtx = new AudioCtxConstructor();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "vote") {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audioCtx.currentTime + 0.35,
        );
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === "confirm") {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audioCtx.currentTime + 0.15,
        );
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audioCtx.currentTime + 0.3,
        );
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // Ignora erro se AudioContext estiver bloqueado pelo navegador
    }
  }

  function addToast(
    type: ToastMessage["type"],
    title: string,
    message?: string,
  ) {
    const id = crypto.randomUUID();
    toasts.value.push({ id, type, title, message });
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    isSoundEnabled,
    toasts,
    toggleSound,
    playBeep,
    addToast,
    removeToast,
  };
});
