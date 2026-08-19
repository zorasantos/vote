<script setup lang="ts">
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileJson,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-vue-next";
import { ref } from "vue";
import BaseButton from "~/components/common/BaseButton.vue";
import BaseModal from "~/components/common/BaseModal.vue";
import PinModal from "~/components/common/PinModal.vue";
import {
  createElectionBackup,
  downloadBackupFile,
  validateElectionBackup,
} from "~/services/backupService";
import { useElectionStore } from "~/store/electionStore";
import { useUiStore } from "~/store/uiStore";

const electionStore = useElectionStore();
const uiStore = useUiStore();

const isExporting = ref(false);
const isImporting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const showConfirmResetModal = ref(false);
const showPinForReset = ref(false);

async function handleExport() {
  if (!electionStore.currentElection) {
    uiStore.addToast(
      "warning",
      "Sem dados",
      "Nenhuma eleição encontrada para exportar.",
    );
    return;
  }
  isExporting.value = true;
  try {
    const backup = await createElectionBackup(
      electionStore.currentElection,
      electionStore.slates,
      electionStore.votes,
      electionStore.voters,
    );
    downloadBackupFile(backup);
    uiStore.addToast(
      "success",
      "Backup Exportado!",
      "Arquivo JSON baixado com sucesso.",
    );
  } catch (e: any) {
    uiStore.addToast("error", "Erro ao exportar backup", e.message);
  } finally {
    isExporting.value = false;
  }
}

function handleTriggerFileInput() {
  fileInput.value?.click();
}

async function handleFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  isImporting.value = true;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const validatedBackup = await validateElectionBackup(parsed);

    if (
      confirm(
        `Deseja restaurar a eleição "${validatedBackup.election.title}" com ${validatedBackup.votes.length} voto(s)? Os dados atuais do navegador serão substituídos.`,
      )
    ) {
      await electionStore.restoreFromBackup(validatedBackup);
      uiStore.addToast(
        "success",
        "Backup Restaurado!",
        "Os dados foram recuperados e validados.",
      );
    }
  } catch (e: any) {
    uiStore.addToast("error", "Falha na restauração do backup", e.message);
  } finally {
    isImporting.value = false;
    if (fileInput.value) fileInput.value.value = "";
  }
}

function handleResetClick() {
  showPinForReset.value = true;
}

function onPinSuccessForReset() {
  showConfirmResetModal.value = true;
}

async function handleConfirmReset() {
  try {
    await electionStore.resetDatabase();
    showConfirmResetModal.value = false;
    uiStore.addToast(
      "info",
      "Banco Zerado!",
      "Todos os dados locais foram apagados.",
    );
  } catch (e: any) {
    uiStore.addToast("error", "Erro ao zerar banco", e.message);
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 py-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
        Backup & Gestão de Dados
      </h1>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Exporte cópias de segurança em formato JSON com validação de integridade ou restaure dados salvos.
      </p>
    </div>

    <!-- Seção de Exportação e Importação -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Card de Exportação -->
      <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
        <div class="space-y-2">
          <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-2xl">
            <Download class="w-6 h-6" />
          </div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Exportar Backup JSON</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Gera um arquivo JSON contendo a eleição, chapas e votos, acompanhado do hash criptográfico SHA-256 para conferência.
          </p>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
          <BaseButton
            variant="primary"
            size="lg"
            class="w-full justify-center"
            :loading="isExporting"
            :disabled="!electionStore.currentElection"
            @click="handleExport"
          >
            <FileJson class="w-5 h-5 mr-1" />
            Baixar Arquivo de Backup
          </BaseButton>
        </div>
      </div>

      <!-- Card de Importação -->
      <div class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
        <div class="space-y-2">
          <div class="w-12 h-12 flex items-center justify-center bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-2xl">
            <Upload class="w-6 h-6" />
          </div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Restaurar Backup</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Importa um arquivo JSON previamente exportado, validando sua consistência e integridade antes da gravação.
          </p>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
          <input
            ref="fileInput"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="handleFileSelected"
          />
          <BaseButton
            variant="outline"
            size="lg"
            class="w-full justify-center"
            :loading="isImporting"
            @click="handleTriggerFileInput"
          >
            <Upload class="w-5 h-5 mr-1" />
            Selecionar Arquivo JSON
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Zona de Perigo / Reset -->
    <div class="p-6 bg-rose-50 dark:bg-rose-950/30 rounded-3xl border border-rose-200 dark:border-rose-900/60 space-y-4">
      <div class="flex items-start gap-3.5">
        <div class="p-2 bg-rose-600 text-white rounded-xl shrink-0">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-bold text-rose-900 dark:text-rose-200">
            Zerar Banco de Dados Local
          </h2>
          <p class="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
            Apaga permanentemente todas as eleições, chapas e votos armazenados no IndexedDB deste navegador. Certifique-se de ter feito backup antes.
          </p>
        </div>
      </div>

      <div class="pt-2 flex justify-end">
        <BaseButton variant="danger" size="md" @click="handleResetClick">
          <Trash2 class="w-4 h-4 mr-1" />
          Zerar Todos os Dados
        </BaseButton>
      </div>
    </div>

    <!-- Modal PIN para Reset -->
    <PinModal
      v-model="showPinForReset"
      title="Autorização do Mesário"
      description="Digite o PIN para autorizar a exclusão completa dos dados."
      @success="onPinSuccessForReset"
    />

    <!-- Modal Confirmação de Reset -->
    <BaseModal
      v-model="showConfirmResetModal"
      title="Tem certeza absoluta?"
      description="Esta ação não pode ser desfeita e removerá todos os registros do navegador."
      max-width="sm"
    >
      <template #footer>
        <BaseButton variant="outline" size="md" @click="showConfirmResetModal = false">
          Cancelar
        </BaseButton>
        <BaseButton variant="danger" size="md" @click="handleConfirmReset">
          Sim, Apagar Tudo
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
