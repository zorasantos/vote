<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import AppNavbar from "~/components/common/AppNavbar.vue";
import ToastContainer from "~/components/common/ToastContainer.vue";
import { useElectionStore } from "~/store/electionStore";

const route = useRoute();
const electionStore = useElectionStore();

const isImmersiveScreen = computed(
  () =>
    route.path === "/voting" ||
    route.path === "/voted" ||
    route.path === "/display" ||
    route.path === "/telao" ||
    route.path === "/qrcode",
);

onMounted(async () => {
  await electionStore.loadActiveElection();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased transition-colors">
    <AppNavbar v-if="!isImmersiveScreen" />

    <main :class="isImmersiveScreen ? 'flex-1 w-full' : 'flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'">
      <router-view />
    </main>

    <footer
      v-if="!isImmersiveScreen"
      class="py-6 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 mt-auto"
    >
      Sistema Eletrônico de Votação da Mesa Diretora • Armazenamento Local Seguro & Anônimo
    </footer>

    <ToastContainer />
  </div>
</template>
