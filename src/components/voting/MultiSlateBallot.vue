<script setup lang="ts">
import { Check, MinusCircle, Users } from "lucide-vue-next";
import BaseButton from "~/components/common/BaseButton.vue";
import type { Slate, VoteChoice } from "~/domain/types";

defineProps<{
  slates: Slate[];
  allowBlankVote?: boolean;
}>();

const emit = defineEmits<(e: "select", choice: VoteChoice) => void>();
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="text-center">
      <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
        Selecione a chapa de sua preferência
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Toque na chapa desejada para revisar a composição e confirmar o seu voto.
      </p>
    </div>

    <!-- Grid de Chapas Concorrentes -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="(slate, idx) in slates"
        :key="slate.id"
        class="flex flex-col justify-between p-5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-900 dark:hover:border-slate-400 transition-all cursor-pointer group"
        @click="emit('select', { type: 'SLATE', slateId: slate.id })"
      >
        <div>
          <div class="flex items-start gap-3.5 mb-3">
            <div class="w-12 h-12 flex items-center justify-center bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-black text-xl rounded-2xl group-hover:scale-105 transition-transform shrink-0">
              {{ slate.number }}
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-slate-100">
                {{ slate.name }}
              </h3>
              <p v-if="slate.slogan" class="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">
                "{{ slate.slogan }}"
              </p>
            </div>
          </div>

          <!-- Membros da Chapa -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              <div
                v-for="member in slate.members.slice(0, 4)"
                :key="member.id"
                class="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/40"
              >
                <span class="font-bold text-slate-800 dark:text-slate-300">{{ member.role }}</span>
                <span class="text-slate-600 dark:text-slate-400 truncate max-w-[140px]">{{ member.name }}</span>
              </div>
              <p v-if="slate.members.length > 4" class="text-xs text-slate-400 text-center pt-1">
                + {{ slate.members.length - 4 }} outros integrantes
              </p>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-2">
          <BaseButton
            variant="primary"
            size="lg"
            class="w-full justify-center text-sm font-bold tracking-wide"
          >
            <Check class="w-4 h-4 mr-1" />
            VOTAR NA CHAPA {{ slate.number }} (Tecla {{ idx + 1 }})
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Botão Voto em Branco -->
    <div v-if="allowBlankVote" class="flex justify-center pt-2">
      <BaseButton
        variant="secondary"
        size="md"
        class="text-slate-600 dark:text-slate-300"
        @click="emit('select', 'BLANK')"
      >
        <MinusCircle class="w-4 h-4" />
        Votar em Branco (Tecla 0)
      </BaseButton>
    </div>
  </div>
</template>
