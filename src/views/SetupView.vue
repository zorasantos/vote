<script setup lang="ts">
import { AlertCircle, Lock, Play, Plus, Sparkles } from "lucide-vue-next";
import { ref } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "~/components/common/BaseButton.vue";
import BaseModal from "~/components/common/BaseModal.vue";
import ElectionConfigForm from "~/components/setup/ElectionConfigForm.vue";
import SlateFormModal from "~/components/setup/SlateFormModal.vue";
import SlateList from "~/components/setup/SlateList.vue";
import { seedSingleSlateElection } from "~/db/seed";
import type { Election, Slate } from "~/domain/types";
import { useElectionStore } from "~/store/electionStore";
import { useUiStore } from "~/store/uiStore";

const router = useRouter();
const electionStore = useElectionStore();
const uiStore = useUiStore();

const showSlateModal = ref(false);
const slateToEdit = ref<Slate | null>(null);
const showConfirmOpenModal = ref(false);

async function handleSaveElection(data: Partial<Election>) {
  try {
    await electionStore.createOrUpdateElection(data);
    uiStore.addToast(
      "success",
      "Dados Salvos!",
      "Configurações da eleição atualizadas com sucesso.",
    );
  } catch (e: any) {
    uiStore.addToast("error", "Falha ao salvar", e.message);
  }
}

function handleAddSlateClick() {
  slateToEdit.value = null;
  showSlateModal.value = true;
}

function handleEditSlate(slate: Slate) {
  slateToEdit.value = slate;
  showSlateModal.value = true;
}

async function handleSaveSlate(data: any) {
  try {
    if (slateToEdit.value) {
      await electionStore.updateSlate(slateToEdit.value.id, data);
      uiStore.addToast(
        "success",
        "Chapa Atualizada!",
        `A chapa "${data.name}" foi salva.`,
      );
    } else {
      await electionStore.addSlate(data);
      uiStore.addToast(
        "success",
        "Chapa Cadastrada!",
        `A chapa "${data.name}" foi adicionada.`,
      );
    }
  } catch (e: any) {
    uiStore.addToast("error", "Falha na chapa", e.message);
  }
}

async function handleRemoveSlate(id: string) {
  if (confirm("Tem certeza de que deseja remover esta chapa?")) {
    try {
      await electionStore.removeSlate(id);
      uiStore.addToast("info", "Chapa Removida");
    } catch (e: any) {
      uiStore.addToast("error", "Falha ao remover", e.message);
    }
  }
}

async function handleOpenElection() {
  try {
    await electionStore.openElection();
    showConfirmOpenModal.value = false;
    uiStore.addToast(
      "success",
      "Eleição Aberta com Sucesso!",
      "A cabine de votação está pronta para receber votos.",
    );
    router.push("/voting");
  } catch (e: any) {
    uiStore.addToast("error", "Não foi possível abrir a eleição", e.message);
  }
}

async function handleLoadSeed() {
  try {
    await seedSingleSlateElection();
    await electionStore.loadActiveElection();
    uiStore.addToast("success", "Exemplo Carregado com Sucesso!");
  } catch (e: any) {
    uiStore.addToast("error", "Erro ao carregar exemplo", e.message);
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 py-6">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Configuração da Eleição
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Defina as regras estatutárias, dados da assembleia e cadastre as chapas concorrentes.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton
          v-if="!electionStore.currentElection"
          variant="outline"
          size="md"
          @click="handleLoadSeed"
        >
          <Sparkles class="w-4 h-4 mr-1 text-amber-500" />
          Carregar Exemplo
        </BaseButton>

        <BaseButton
          v-if="electionStore.isDraft"
          variant="success"
          size="lg"
          class="shadow-md"
          @click="showConfirmOpenModal = true"
        >
          <Play class="w-5 h-5 mr-1" />
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
        <span class="font-bold block">Modo de Leitura (Eleição em Andamento ou Encerrada)</span>
        Os dados e chapas não podem mais ser alterados para assegurar a integridade do pleito.
      </div>
    </div>

    <!-- 1. Dados Gerais da Eleição -->
    <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
        1. Dados Gerais e Regras de Votação
      </h2>

      <ElectionConfigForm
        :election="electionStore.currentElection"
        :disabled="!electionStore.isDraft && !!electionStore.currentElection"
        @save="handleSaveElection"
      />
    </div>

    <!-- 2. Chapas Concorrentes -->
    <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            2. Chapas & Integrantes da Mesa Diretora
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Cadastre os membros que compõem cada chapa (Presidente, Vice, Secretários, Tesoureiros, etc.).
          </p>
        </div>

        <BaseButton
          v-if="electionStore.isDraft || !electionStore.currentElection"
          variant="primary"
          size="md"
          @click="handleAddSlateClick"
        >
          <Plus class="w-4 h-4 mr-1" />
          Adicionar Chapa
        </BaseButton>
      </div>

      <div v-if="electionStore.slates.length === 0" class="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Nenhuma chapa cadastrada até o momento.
        </p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Clique em "Adicionar Chapa" para cadastrar os concorrentes.
        </p>
      </div>

      <SlateList
        v-else
        :slates="electionStore.slates"
        :disabled="!electionStore.isDraft && !!electionStore.currentElection"
        @edit="handleEditSlate"
        @remove="handleRemoveSlate"
      />
    </div>

    <!-- Modal de Chapa -->
    <SlateFormModal
      v-model="showSlateModal"
      :slate-to-edit="slateToEdit"
      @save="handleSaveSlate"
    />

    <!-- Modal de Confirmação de Abertura -->
    <BaseModal
      v-model="showConfirmOpenModal"
      title="Confirmar Abertura da Eleição?"
      description="Esta ação iniciará o pleito e travará a edição de dados e chapas."
      max-width="md"
    >
      <div class="space-y-4">
        <div class="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
          <p class="font-bold">✓ Checklist de Validação:</p>
          <p>• Associação: {{ electionStore.currentElection?.associationName }}</p>
          <p>• Modalidade: {{ electionStore.currentElection?.mode === 'SINGLE_SLATE_APPROVAL' ? 'Chapa Única' : 'Múltiplas Chapas' }}</p>
          <p>• Chapas Cadastradas: {{ electionStore.slates.length }} chapa(s)</p>
          <p>• Quórum: {{ electionStore.currentElection?.quorumBasis }}</p>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400">
          Ao abrir a eleição, a cabine de votação estará liberada para os associados votarem.
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
