<script setup lang="ts">
import { ArrowLeft, Check, CheckCircle2, XCircle } from "lucide-vue-next";
import { computed } from "vue";
import BaseButton from "~/components/common/BaseButton.vue";
import type { Slate, VoteChoice } from "~/domain/types";

const props = defineProps<{
  choice: VoteChoice;
  slates: Slate[];
  isSaving?: boolean;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const choiceDetails = computed(() => {
  if (props.choice === "YES") {
    return {
      title: "SIM",
      subtitle: "Aprovação da Chapa 01",
      containerClass:
        "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-400 text-emerald-900 dark:text-emerald-100",
      icon: CheckCircle2,
      iconClass: "text-emerald-600 dark:text-emerald-400",
    };
  }
  return {
    title: "NÃO",
    subtitle: "Rejeição da Chapa 01",
    containerClass:
      "bg-rose-50 dark:bg-rose-950/80 border-rose-400 text-rose-900 dark:text-rose-100",
    icon: XCircle,
    iconClass: "text-rose-600 dark:text-rose-400",
  };
});
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="text-center space-y-2">
      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
        CONFIRA SEU VOTO
      </h2>
      <p class="text-base text-slate-600 dark:text-slate-300">
        Verifique abaixo se sua escolha está correta antes de finalizar:
      </p>
    </div>

    <!-- Card de Destaque da Opção Escolhida -->
    <div
      class="p-8 rounded-3xl border-4 shadow-xl text-center space-y-4 transition-all"
      :class="choiceDetails.containerClass"
    >
      <component
        :is="choiceDetails.icon"
        class="w-20 h-20 mx-auto"
        :class="choiceDetails.iconClass"
      />
      
      <div>
        <span class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1">
          Sua escolha foi:
        </span>
        <h3 class="text-4xl sm:text-5xl font-black tracking-tight">
          {{ choiceDetails.title }}
        </h3>
        <p class="text-lg font-bold mt-1 opacity-90">
          {{ choiceDetails.subtitle }}
        </p>
      </div>
    </div>

    <!-- Botões de Ação: Corrigir vs Confirmar -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
      <!-- Botão Corrigir -->
      <BaseButton
        variant="outline"
        size="xl"
        class="w-full justify-center py-5 text-base font-bold text-slate-700 dark:text-slate-300 border-2"
        :disabled="isSaving"
        @click="emit('cancel')"
      >
        <ArrowLeft class="w-6 h-6 mr-2" />
        CORRIGIR VOTO
      </BaseButton>

      <!-- Botão Confirmar -->
      <BaseButton
        variant="success"
        size="xl"
        class="w-full justify-center py-5 text-lg font-black tracking-wide shadow-xl"
        :loading="isSaving"
        @click="emit('confirm')"
      >
        <Check class="w-7 h-7 mr-2" />
        CONFIRMAR MEU VOTO
      </BaseButton>
    </div>
  </div>
</template>
