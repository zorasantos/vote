import { onMounted, onUnmounted } from "vue";

export function useKeyboardShortcuts(callbacks: {
  onKey1?: () => void;
  onKey2?: () => void;
  onKey0?: () => void;
  onEnter?: () => void;
  onBackspace?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
}) {
  function handleKeyDown(event: KeyboardEvent) {
    // Ignora se estiver digitando em um input ou textarea
    const target = event.target as HTMLElement;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable)
    ) {
      return;
    }

    if (event.key === "1" && callbacks.onKey1) {
      event.preventDefault();
      callbacks.onKey1();
    } else if (event.key === "2" && callbacks.onKey2) {
      event.preventDefault();
      callbacks.onKey2();
    } else if (event.key === "0" && callbacks.onKey0) {
      event.preventDefault();
      callbacks.onKey0();
    } else if (event.key === "Enter" && callbacks.onEnter) {
      event.preventDefault();
      callbacks.onEnter();
    } else if (
      (event.key === "Backspace" || event.key === "Delete") &&
      callbacks.onBackspace
    ) {
      event.preventDefault();
      callbacks.onBackspace();
    } else if (event.key === " " && callbacks.onSpace) {
      event.preventDefault();
      callbacks.onSpace();
    } else if (event.key === "Escape" && callbacks.onEscape) {
      event.preventDefault();
      callbacks.onEscape();
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });
}
