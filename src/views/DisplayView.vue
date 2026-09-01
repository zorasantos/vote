<script setup lang="ts">
import { Smartphone, Sparkles } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import {
  generateQrCodeDataUrl,
  getDefaultCabinUrl,
} from "~/services/qrCodeService";
import { useElectionStore } from "~/store/electionStore";

const electionStore = useElectionStore();

const cabinUrl = getDefaultCabinUrl();
const qrDataUrl = ref<string>("");
const isGenerating = ref(false);

const statusBadge = computed(() => {
  if (electionStore.isOpen) {
    return {
      label: "VOTAÇÃO ABERTA",
      class: "bg-emerald-600 text-white shadow-xs",
    };
  }
  if (electionStore.isClosed) {
    return {
      label: "VOTAÇÃO ENCERRADA",
      class: "bg-slate-600 text-white",
    };
  }
  return {
    label: "CABINE DISPONÍVEL",
    class: "bg-teal-600 text-white",
  };
});

async function loadQrCode() {
  isGenerating.value = true;
  try {
    qrDataUrl.value = await generateQrCodeDataUrl(cabinUrl, {
      width: 800,
      margin: 2,
    });
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
  } finally {
    isGenerating.value = false;
  }
}

onMounted(async () => {
  if (!electionStore.currentElection) {
    await electionStore.loadActiveElection();
  }
  await loadQrCode();
});
</script>

<template>
  <div class="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-8 select-none font-sans">
    <!-- Barra Superior / Header do Telão em Tema Light -->
    <header class="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div class="flex items-center gap-4">
        <img
          :src="electionStore.currentElection?.associationLogo || '/ace-logo.jpg'"
          alt="Logo da Associação"
          class="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-2xl bg-white p-1.5 border border-slate-200 shadow-sm"
        />
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {{ electionStore.currentElection?.associationName || 'Associação Cearense de Escritores - ACE' }}
            </h1>
            <span
              class="px-3 py-1 text-xs font-black tracking-wider uppercase rounded-full"
              :class="statusBadge.class"
            >
              {{ statusBadge.label }}
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-600 font-medium">
            {{ electionStore.currentElection?.title || 'Eleição da Mesa Diretora — Biênio 2026/2028' }} (Chapa 01)
          </p>
        </div>
      </div>
    </header>

    <!-- Conteúdo Central: QR Code em Escala Gigante e Passos -->
    <main class="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 py-8">
      <!-- Bloco Esquerdo: QR Code Nítido com Moldura Clara -->
      <div class="flex flex-col items-center">
        <div class="relative p-6 sm:p-8 bg-white rounded-3xl sm:rounded-4xl shadow-xl border-2 border-slate-200">
          <div v-if="isGenerating" class="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center text-slate-400 font-bold">
            Gerando QR Code...
          </div>
          <img
            v-else-if="qrDataUrl"
            :src="qrDataUrl"
            alt="QR Code da Cabine de Votação"
            class="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain rounded-2xl"
          />
          <div class="mt-4 flex items-center justify-center gap-2 text-slate-900 font-black text-sm sm:text-base">
            <Smartphone class="w-5 h-5 text-emerald-600" />
            <span>APONTE A CÂMERA DO CELULAR</span>
          </div>
        </div>
      </div>

      <!-- Bloco Direito: Orientações de Votação para o Eleitor -->
      <div class="max-w-xl space-y-6 text-center lg:text-left">
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles class="w-3.5 h-3.5" />
            Votação Digital e Segura
          </div>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Vote pelo Celular
          </h2>
          <p class="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
            O voto é anônimo, seguro e pode ser realizado diretamente no seu smartphone.
          </p>
        </div>

        <!-- Passos Ilustrados -->
        <div class="space-y-3">
          <div class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div class="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white font-black rounded-xl text-lg shrink-0 shadow-xs">
              1
            </div>
            <div class="text-left">
              <p class="font-bold text-slate-900 text-sm sm:text-base">Abra a câmera do celular</p>
              <p class="text-xs text-slate-500">Aponte para o QR Code exibido ao lado.</p>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div class="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white font-black rounded-xl text-lg shrink-0 shadow-xs">
              2
            </div>
            <div class="text-left">
              <p class="font-bold text-slate-900 text-sm sm:text-base">Acesse a Cabine Oficial</p>
              <p class="text-xs text-slate-500">Você entrará na cédula eletrônica da Chapa 01.</p>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div class="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white font-black rounded-xl text-lg shrink-0 shadow-xs">
              3
            </div>
            <div class="text-left">
              <p class="font-bold text-slate-900 text-sm sm:text-base">Confirme o seu Voto</p>
              <p class="text-xs text-slate-500">Escolha SIM ou NÃO e confirme na tela.</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Rodapé Discreto -->
    <footer class="text-center text-xs text-slate-500 border-t border-slate-200 pt-3">
      Associação Cearense de Escritores • Eleição Oficial
    </footer>
  </div>
</template>
