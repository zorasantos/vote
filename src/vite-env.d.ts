/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";

  // biome-ignore lint/complexity/noBannedTypes: generic Vue component shim
  // biome-ignore lint/suspicious/noExplicitAny: generic Vue component shim
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
