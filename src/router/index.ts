import { createRouter, createWebHistory } from "vue-router";
import NewPage from "~/views/ExampleNewRouter.vue";
import Home from "~/views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: NewPage,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
