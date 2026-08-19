<script setup lang="ts">
import { CheckCircle2, Users } from "lucide-vue-next";
import type { Slate } from "~/domain/types";

defineProps<{
  slate: Slate;
}>();
</script>

<template>
  <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <Users class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 class="text-base font-bold text-slate-900 dark:text-white">
          Composição Nominal da Mesa Diretora Eleita
        </h3>
      </div>
      <span class="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg">
        {{ slate.name }}
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="member in slate.members"
        :key="member.id"
        class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800"
      >
        <div class="p-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg shrink-0">
          <CheckCircle2 class="w-4 h-4" />
        </div>
        <div class="overflow-hidden">
          <span class="text-xs font-bold text-slate-900 dark:text-slate-200 block truncate">
            {{ member.role }}
          </span>
          <span class="text-xs text-slate-600 dark:text-slate-400 block truncate">
            {{ member.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
