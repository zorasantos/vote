<script setup lang="ts">
import {
  Check,
  Copy,
  Download,
  Maximize2,
  QrCode,
  Smartphone,
  Sparkles,
} from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "~/components/common/BaseButton.vue";
import {
  downloadQrCodeImage,
  generateQrCodeDataUrl,
  getCurrentCabinUrl,
  getDefaultCabinUrl,
} from "~/services/qrCodeService";
import { useElectionStore } from "~/store/electionStore";
import { useUiStore } from "~/store/uiStore";

const router = useRouter();
const electionStore = useElectionStore();
const uiStore = useUiStore();

const defaultUrl = getDefaultCabinUrl();
const currentUrl = getCurrentCabinUrl();

// Opção de seleção de URL (padrão é sempre a da Vercel)
const selectedUrlMode = ref<"vercel" | "current">("vercel");

const activeCabinUrl = computed(() => {
  return selectedUrlMode.value === "vercel" ? defaultUrl : currentUrl;
});

const qrDataUrl = ref<string>("");
const isCopied = ref(false);
const isGenerating = ref(false);

async function loadQrCode() {
  isGenerating.value = true;
  try {
    qrDataUrl.value = await generateQrCodeDataUrl(activeCabinUrl.value, {
      width: 400,
      margin: 2,
    });
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
  } finally {
    isGenerating.value = false;
  }
}

watch(activeCabinUrl, () => {
  loadQrCode();
});

onMounted(() => {
  loadQrCode();
});

async function handleCopyLink() {
  try {
    await navigator.clipboard.writeText(activeCabinUrl.value);
    isCopied.value = true;
    uiStore.playBeep("confirm");
    uiStore.addToast(
      "success",
      "Link Copiado!",
      "URL da cabine copiada para a área de transferência.",
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
  const fileName = "qrcode-cabine-votacao-ace.png";
  downloadQrCodeImage(qrDataUrl.value, fileName);
  uiStore.addToast("success", "Download Concluído", "Imagem do QR Code salva.");
}

function handleOpenDisplay() {
  window.open("/display", "_blank", "noopener,noreferrer");
}
</script>

<template>
  <div class="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
    <!-- Header do Card -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
      <div class="flex items-center gap-3.5">
        <div class="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
          <QrCode class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              QR Code da Cabine de Votação
            </h2>
            <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Acesso Móvel
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Disponibilize este QR Code para os associados votarem pelo celular ou tablet.
          </p>
        </div>
      </div>

      <!-- Botão Abrir Modo Apresentação / Telão -->
      <BaseButton
        variant="outline"
        size="sm"
        class="font-bold shrink-0 self-start sm:self-center"
        @click="handleOpenDisplay"
      >
        <Maximize2 class="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
        Abrir Modo Telão (Página Pública)
      </BaseButton>
    </div>

    <!-- Conteúdo Principal em 2 Colunas -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <!-- Coluna Esquerda: QR Code com Moldura -->
      <div class="md:col-span-5 flex flex-col items-center">
        <div
          class="relative group cursor-pointer p-4 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-md transition-transform hover:scale-102"
          @click="handleOpenDisplay"
          title="Clique para abrir a página pública do Telão"
        >
          <div v-if="isGenerating" class="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
            Gerando QR Code...
          </div>
          <img
            v-else-if="qrDataUrl"
            :src="qrDataUrl"
            alt="QR Code da Cabine de Votação"
            class="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
          />

          <div class="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
            <Maximize2 class="w-8 h-8 mb-1" />
            <span class="text-xs font-bold text-center">Abrir Telão em Tela Cheia</span>
          </div>
        </div>

        <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
          <Smartphone class="w-3.5 h-3.5 text-emerald-500" />
          Aponte a câmera para votar
        </p>
      </div>

      <!-- Coluna Direita: Informações, Links e Ações -->
      <div class="md:col-span-7 space-y-4">
        <!-- Detalhes do Link -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Endereço da Cabine (Vercel)
            </label>
            <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles class="w-3 h-3" /> Link Ativo
            </span>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="text"
              readonly
              :value="activeCabinUrl"
              class="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 select-all outline-none"
            />
            <button
              type="button"
              class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
              @click="handleCopyLink"
            >
              <Check v-if="isCopied" class="w-3.5 h-3.5 text-white" />
              <Copy v-else class="w-3.5 h-3.5" />
              {{ isCopied ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>

        <!-- Orientações para a Mesa Diretora -->
        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <p class="font-bold text-slate-800 dark:text-slate-200">
            Como usar na Assembleia:
          </p>
          <ul class="list-disc list-inside space-y-0.5 opacity-90">
            <li>Exiba o QR Code no telão ou projete para o auditório.</li>
            <li>Baixe a imagem PNG e imprima para colocar nas mesas receptoras.</li>
            <li>Os associados votam diretamente em seus celulares com total sigilo.</li>
          </ul>
        </div>

        <!-- Ação de Download -->
        <div class="flex flex-wrap items-center gap-2.5 pt-1">
          <BaseButton
            variant="outline"
            size="sm"
            class="font-bold text-xs"
            @click="handleDownloadQrCode"
          >
            <Download class="w-3.5 h-3.5 mr-1.5 text-slate-600 dark:text-slate-300" />
            Baixar Imagem (PNG)
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
