import { createRouter, createWebHistory } from "vue-router";
import BackupView from "~/views/BackupView.vue";
import DashboardView from "~/views/DashboardView.vue";
import ResultsView from "~/views/ResultsView.vue";
import SetupView from "~/views/SetupView.vue";
import VoteCompleteView from "~/views/VoteCompleteView.vue";
import VotingView from "~/views/VotingView.vue";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: DashboardView,
  },
  {
    path: "/setup",
    name: "Setup",
    component: SetupView,
  },
  {
    path: "/voting",
    name: "Voting",
    component: VotingView,
  },
  {
    path: "/voted",
    name: "VoteComplete",
    component: VoteCompleteView,
  },
  {
    path: "/results",
    name: "Results",
    component: ResultsView,
  },
  {
    path: "/backup",
    name: "Backup",
    component: BackupView,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
