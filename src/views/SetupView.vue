<script setup lang="ts">
import { CheckCircle2, Lock, Play, ShieldCheck } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "~/components/common/BaseButton.vue";
import BaseModal from "~/components/common/BaseModal.vue";
import ElectionConfigForm from "~/components/setup/ElectionConfigForm.vue";

import type { Election } from "~/domain/types";

import { useElectionStore } from "~/store/electionStore";
import { useUiStore } from "~/store/uiStore";

const router = useRouter();
const electionStore = useElectionStore();
const uiStore = useUiStore();

const showConfirmOpenModal = ref(false);

onMounted(async () => {
  if (!electionStore.currentElection || electionStore.slates.length === 0) {
    await electionStore.loadActiveElection();
  }
});

async function handleSaveElection(data: Partial<Election>) {
  try {
    await electionStore.createOrUpdateElection(data);
    uiStore.addToast(
      "success",
      "Configuração Salva!",
      "Os dados da votação foram atualizados com sucesso.",
    );
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Erro desconhecido";
    uiStore.addToast("error", "Falha ao salvar", errorMsg);
  }
}

async function handleOpenElection() {
  try {
    await electionStore.openElection();
    showConfirmOpenModal.value = false;
    uiStore.addToast(
      "success",
      "Votação Aberta com Sucesso!",
      "A cabine de votação está pronta para receber os votos dos associados.",
    );
    router.push("/voting");
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Erro desconhecido";
    uiStore.addToast("error", "Não foi possível abrir a votação", errorMsg);
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 py-6">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Configuração da Votação
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Defina os dados da <strong>Associação Cearense de Escritores - ACE</strong>, logotipo e os dados de quórum para a votação da <strong>Chapa 01</strong>.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton
          v-if="electionStore.isDraft"
          variant="success"
          size="lg"
          class="shadow-lg py-3 px-6 text-base font-bold cursor-pointer"
          @click="showConfirmOpenModal = true"
        >
          <Play class="w-5 h-5 mr-1.5" />
          Abrir Votação Oficial
        </BaseButton>
      </div>
    </div>

    <!-- Alerta se a eleição não estiver em DRAFT -->
    <div
      v-if="!electionStore.isDraft && electionStore.currentElection"
      class="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-start gap-3 text-amber-900 dark:text-amber-200 text-sm font-medium"
    >
      <Lock class="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <span class="font-bold block">Votação em Andamento ou Encerrada</span>
        Os parâmetros foram congelados para garantir a lisura do pleito.
      </div>
    </div>

    <!-- Card 1: Chapa 01 Ativa -->
    <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 flex items-center justify-center bg-emerald-600 text-white rounded-2xl font-black text-xl shadow-sm">
            01
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Chapa 01
              </h2>
              <span class="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                Chapa Única
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Candidatura oficial da Mesa Diretora para aprovação na assembleia.
            </p>
          </div>
        </div>

        <div class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          Opções: SIM ou NÃO
        </div>
      </div>
    </div>

    <!-- Card 2: Inputs de Configuração -->
    <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
        Parâmetros da Entidade & Quórum
      </h2>

      <ElectionConfigForm
        :election="electionStore.currentElection"
        :disabled="!electionStore.isDraft && !!electionStore.currentElection"
        @save="handleSaveElection"
      />
    </div>

    <!-- Modal de Confirmação de Abertura -->
    <BaseModal
      v-model="showConfirmOpenModal"
      title="Confirmar Abertura da Votação?"
      description="Esta ação iniciará o pleito da Chapa 01 e liberará a cabine para os associados."
      max-width="md"
    >
      <div class="space-y-4">
        <div class="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-900 dark:text-emerald-200 space-y-1.5">
          <p class="font-bold flex items-center gap-1.5">
            <ShieldCheck class="w-4 h-4" /> Resumo da Votação:
          </p>
          <p>• Chapa Concorrente: <strong>Chapa 01</strong></p>
          <p>• Total na Associação: <strong>{{ electionStore.currentElection?.totalMembers || 100 }} associados</strong></p>
          <p>• Presentes na Votação: <strong>{{ electionStore.currentElection?.presentMembers || 50 }} associados</strong></p>
          <p>• Opções da Cédula: <strong>SIM / NÃO</strong></p>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400">
          Ao confirmar, a urna eletrônica será inicializada e o primeiro votante poderá votar.
        </p>
      </div>

      <template #footer>
        <BaseButton variant="outline" size="md" @click="showConfirmOpenModal = false">
          Cancelar
        </BaseButton>
        <BaseButton variant="success" size="md" @click="handleOpenElection">
          <Play class="w-4 h-4 mr-1" />
          Confirmar e Abrir Votação
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
