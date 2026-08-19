<script setup lang="ts">
import { Edit2, ShieldCheck, Trash2, Users } from "lucide-vue-next";
import type { Slate } from "~/domain/types";

defineProps<{
  slates: Slate[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "edit", slate: Slate): void;
  (e: "remove", id: string): void;
}>();
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="slate in slates"
      :key="slate.id"
      class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3.5">
          <div class="w-11 h-11 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-lg rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            {{ slate.number }}
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              {{ slate.name }}
            </h3>
            <p v-if="slate.slogan" class="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">
              "{{ slate.slogan }}"
            </p>
          </div>
        </div>

        <div v-if="!disabled" class="flex items-center gap-1.5">
          <button
            type="button"
            class="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            title="Editar Chapa"
            @click="emit('edit', slate)"
          >
            <Edit2 class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            title="Excluir Chapa"
            @click="emit('remove', slate.id)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Membros da Diretoria -->
      <div class="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          <Users class="w-3.5 h-3.5 text-slate-500" />
          Membros da Composição ({{ slate.members.length }})
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <div
            v-for="member in slate.members"
            :key="member.id"
            class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
          >
            <span class="font-bold text-slate-900 dark:text-slate-200 block truncate">
              {{ member.role }}
            </span>
            <span class="text-slate-600 dark:text-slate-400 block truncate">
              {{ member.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
