<script setup lang="ts">
import { onMounted } from "vue";
import AppNavbar from "~/components/common/AppNavbar.vue";
import ToastContainer from "~/components/common/ToastContainer.vue";
import { useElectionStore } from "~/store/electionStore";

const electionStore = useElectionStore();

onMounted(async () => {
  await electionStore.loadActiveElection();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased transition-colors">
    <AppNavbar />

    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <router-view />
    </main>

    <footer class="py-6 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 mt-auto">
      Sistema Eletrônico de Votação da Mesa Diretora • Armazenamento Local Seguro & Anônimo
    </footer>

    <ToastContainer />
  </div>
</template>
