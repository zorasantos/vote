<script setup lang="ts">
import confetti from "canvas-confetti";
import { AlertTriangle, Award } from "lucide-vue-next";
import { onMounted } from "vue";
import type { ElectionResult } from "~/domain/types";

const props = defineProps<{
  result: ElectionResult;
}>();

const isElected = props.result.singleSlateResult?.isElected ?? false;

const proclamationText = props.result.singleSlateResult?.proclamationText ?? "";

onMounted(() => {
  if (isElected) {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignora se canvas não estiver disponível
    }
  }
});
</script>

<template>
  <div
    class="p-6 sm:p-8 rounded-3xl border-2 shadow-lg transition-all"
    :class="
      isElected
        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-50'
        : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-50'
    "
  >
    <div class="flex items-start gap-4">
      <div
        class="p-3 rounded-2xl shrink-0"
        :class="
          isElected
            ? 'bg-emerald-600 text-white'
            : 'bg-amber-600 text-white'
        "
      >
        <Award v-if="isElected" class="w-8 h-8" />
        <AlertTriangle v-else class="w-8 h-8" />
      </div>

      <div class="flex-1 space-y-2">
        <div class="flex items-center gap-2">
          <span
            class="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-md"
            :class="
              isElected
                ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100'
                : 'bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100'
            "
          >
            {{ isElected ? 'Resultado: APROVADA' : 'Resultado: NÃO APROVADA' }}
          </span>
        </div>

        <h3 class="text-xl sm:text-2xl font-black">
          {{ isElected ? 'CHAPA 01 ELEITA COM SUCESSO' : 'A CHAPA 01 NÃO OBTEVE APROVAÇÃO' }}
        </h3>

        <p class="text-sm sm:text-base opacity-90 leading-relaxed font-medium">
          {{ proclamationText }}
        </p>
      </div>
    </div>
  </div>
</template>
