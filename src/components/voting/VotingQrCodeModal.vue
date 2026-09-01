<script setup lang="ts">
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Printer,
  QrCode,
  Sparkles,
} from "lucide-vue-next";
import { onMounted, ref, watch } from "vue";
import BaseButton from "~/components/common/BaseButton.vue";
import BaseModal from "~/components/common/BaseModal.vue";
import {
  downloadQrCodeImage,
  generateQrCodeDataUrl,
  getDefaultCabinUrl,
} from "~/services/qrCodeService";
import { useElectionStore } from "~/store/electionStore";
import { useUiStore } from "~/store/uiStore";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    cabinUrl?: string;
  }>(),
  {
    cabinUrl: getDefaultCabinUrl(),
  },
);

const emit = defineEmits<(e: "update:modelValue", value: boolean) => void>();

const electionStore = useElectionStore();
const uiStore = useUiStore();

const qrDataUrl = ref<string>("");
const isCopied = ref(false);
const isGenerating = ref(false);

async function loadQrCode() {
  isGenerating.value = true;
  try {
    qrDataUrl.value = await generateQrCodeDataUrl(props.cabinUrl, {
      width: 600,
      margin: 2,
    });
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    uiStore.addToast(
      "error",
      "Erro ao gerar QR Code",
      "Não foi possível gerar a imagem.",
    );
  } finally {
    isGenerating.value = false;
  }
}

watch(
  () => [props.modelValue, props.cabinUrl],
  ([isOpen]) => {
    if (isOpen) {
      loadQrCode();
    }
  },
);

onMounted(() => {
  if (props.modelValue) {
    loadQrCode();
  }
});

async function handleCopyLink() {
  try {
    await navigator.clipboard.writeText(props.cabinUrl);
    isCopied.value = true;
    uiStore.playBeep("confirm");
    uiStore.addToast(
      "success",
      "Link Copiado!",
      "O link da cabine de votação foi copiado para a área de transferência.",
    );
    setTimeout(() => {
      isCopied.value = false;
    }, 2500);
  } catch (_e) {
    uiStore.addToast("error", "Erro ao copiar", "Copie o link manualmente.");
  }
}

function handleDownloadQrCode() {
  if (!qrDataUrl.value) return;
  const fileName = `qrcode-cabine-${electionStore.currentElection?.associationName ? "ace" : "votacao"}.png`;
  downloadQrCodeImage(qrDataUrl.value, fileName);
  uiStore.addToast(
    "success",
    "Download Concluído",
    "Imagem do QR Code salva com sucesso.",
  );
}

function handlePrint() {
  window.print();
}

function handleOpenNewTab() {
  window.open(props.cabinUrl, "_blank", "noopener,noreferrer");
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    title="Acesso à Cabine de Votação (QR Code)"
    description="Aponte a câmera do celular ou acesse o link direto para votar."
    max-width="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-6 text-center print:m-0 print:p-0">
      <!-- Identificação da Entidade -->
      <div class="flex flex-col items-center gap-2">
        <img
          :src="electionStore.currentElection?.associationLogo || '/ace-logo.jpg'"
          alt="Logo da Associação"
          class="w-16 h-16 object-contain rounded-2xl bg-white p-1.5 border border-slate-200 dark:border-slate-700 shadow-sm"
        />
        <div>
          <h3 class="font-black text-slate-900 dark:text-white text-lg sm:text-xl">
            {{ electionStore.currentElection?.associationName || 'Associação Cearense de Escritores - ACE' }}
          </h3>
          <p class="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
            {{ electionStore.currentElection?.title || 'Eleição da Mesa Diretora — Biênio 2026/2028' }}
          </p>
        </div>
      </div>

      <!-- Área de Apresentação do QR Code -->
      <div class="relative inline-block mx-auto p-4 sm:p-6 bg-white rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-xl">
        <div v-if="isGenerating" class="w-64 h-64 flex items-center justify-center text-slate-400 text-sm">
          Gerando QR Code...
        </div>
        <img
          v-else-if="qrDataUrl"
          :src="qrDataUrl"
          alt="QR Code da Cabine de Votação"
          class="w-60 h-60 sm:w-72 sm:h-72 object-contain mx-auto rounded-xl"
        />
        <div class="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
          <Sparkles class="w-3.5 h-3.5 text-amber-500" />
          <span>Escaneie com a câmera do celular</span>
        </div>
      </div>

      <!-- Caixa do Link URL -->
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Link Oficial da Cabine
        </label>
        <div class="flex items-center gap-2 max-w-md mx-auto">
          <input
            type="text"
            readonly
            :value="cabinUrl"
            class="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 select-all outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            class="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
            @click="handleCopyLink"
          >
            <Check v-if="isCopied" class="w-4 h-4 text-white" />
            <Copy v-else class="w-4 h-4" />
            {{ isCopied ? 'Copiado' : 'Copiar' }}
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap items-center justify-between w-full gap-2">
        <div class="flex items-center gap-2">
          <BaseButton
            variant="outline"
            size="sm"
            class="font-semibold"
            @click="handleDownloadQrCode"
          >
            <Download class="w-4 h-4 mr-1.5" />
            Baixar PNG
          </BaseButton>

          <BaseButton
            variant="outline"
            size="sm"
            class="font-semibold"
            @click="handlePrint"
          >
            <Printer class="w-4 h-4 mr-1.5" />
            Imprimir
          </BaseButton>
        </div>

        <div class="flex items-center gap-2">
          <BaseButton
            variant="primary"
            size="sm"
            class="font-semibold"
            @click="handleOpenNewTab"
          >
            <ExternalLink class="w-4 h-4 mr-1.5" />
            Abrir Cabine
          </BaseButton>

          <BaseButton
            variant="outline"
            size="sm"
            @click="emit('update:modelValue', false)"
          >
            Fechar
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
