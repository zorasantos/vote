<script setup lang="ts">
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  MinusCircle,
  ShieldCheck,
  XCircle,
} from "lucide-vue-next";
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
      title: "SIM — APROVAR A CHAPA",
      badgeClass:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300",
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
      description: "Você está votando favoravelmente pela eleição da chapa.",
      slate: props.slates[0],
    };
  }
  if (props.choice === "NO") {
    return {
      title: "NÃO — REJEITAR A CHAPA",
      badgeClass:
        "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300",
      icon: XCircle,
      iconClass: "text-rose-600",
      description: "Você está votando contrariamente à eleição da chapa.",
      slate: props.slates[0],
    };
  }
  if (props.choice === "BLANK") {
    return {
      title: "VOTO EM BRANCO",
      badgeClass:
        "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-400",
      icon: MinusCircle,
      iconClass: "text-slate-600",
      description:
        "Você optou por não manifestar preferência por nenhuma chapa.",
      slate: null,
    };
  }
  if (typeof props.choice === "object" && props.choice.type === "SLATE") {
    const s = props.slates.find(
      (slate) => slate.id === (props.choice as any).slateId,
    );
    return {
      title: `VOTO NA ${s?.name || "CHAPA"}`,
      badgeClass:
        "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900",
      icon: CheckCircle2,
      iconClass: "text-slate-900 dark:text-slate-100",
      description: `Você está votando na Chapa ${s?.number || ""}.`,
      slate: s,
    };
  }
  return {
    title: "VOTO INDEFINIDO",
    badgeClass: "bg-slate-100 text-slate-800",
    icon: ShieldCheck,
    iconClass: "text-slate-500",
    description: "",
    slate: null,
  };
});
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-black text-slate-900 dark:text-white">
        Confira seu voto antes de confirmar
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Esta ação registrará sua cédula na urna eletrônica de forma definitiva e anônima.
      </p>
    </div>

    <!-- Card de Confirmação -->
    <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-300 dark:border-slate-700 shadow-xl space-y-5">
      <div class="flex items-center gap-4">
        <component
          :is="choiceDetails.icon"
          class="w-12 h-12 shrink-0"
          :class="choiceDetails.iconClass"
        />
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
            Opção Selecionada:
          </span>
          <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {{ choiceDetails.title }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ choiceDetails.description }}
          </p>
        </div>
      </div>

      <!-- Resumo da Chapa (se houver) -->
      <div
        v-if="choiceDetails.slate"
        class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700"
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-0.5 text-xs font-black bg-slate-900 text-white rounded-md">
            {{ choiceDetails.slate.number }}
          </span>
          <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">
            {{ choiceDetails.slate.name }}
          </h4>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
          <div
            v-for="member in choiceDetails.slate.members.slice(0, 4)"
            :key="member.id"
            class="truncate"
          >
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ member.role }}: </span>
            <span class="text-slate-600 dark:text-slate-400">{{ member.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Botões de Ação: Corrigir vs Confirmar -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
      <!-- Botão Corrigir (Voltar) -->
      <BaseButton
        variant="outline"
        size="xl"
        class="w-full justify-center text-slate-700 dark:text-slate-300"
        :disabled="isSaving"
        @click="emit('cancel')"
      >
        <ArrowLeft class="w-5 h-5 mr-1" />
        CORRIGIR VOTO (Backspace)
      </BaseButton>

      <!-- Botão Confirmar (Salvar) -->
      <BaseButton
        variant="success"
        size="xl"
        class="w-full justify-center text-lg font-black tracking-wide shadow-xl"
        :loading="isSaving"
        @click="emit('confirm')"
      >
        <Check class="w-6 h-6 mr-1.5" />
        CONFIRMAR MEU VOTO (Enter)
      </BaseButton>
    </div>
  </div>
</template>
