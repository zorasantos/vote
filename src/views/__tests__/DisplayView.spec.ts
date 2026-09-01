import { createTestingPinia } from "@pinia/testing";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import DisplayView from "../DisplayView.vue";

vi.mock("~/services/qrCodeService", () => ({
  VERCEL_BASE_URL: "https://vote-pi-sable.vercel.app",
  CABIN_PATH: "/voting",
  getDefaultCabinUrl: () => "https://vote-pi-sable.vercel.app/voting",
  getCurrentCabinUrl: () => "https://vote-pi-sable.vercel.app/voting",
  generateQrCodeDataUrl: vi
    .fn()
    .mockResolvedValue("data:image/png;base64,mock-qr-code-telao"),
  downloadQrCodeImage: vi.fn(),
}));

describe("DisplayView.vue (Modo Apresentação / Telão)", () => {
  it("deve renderizar a página pública em tema claro com instruções e sem botões desnecessários", async () => {
    const wrapper = mount(DisplayView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              election: {
                currentElection: {
                  id: "el-1",
                  title: "Eleição da Mesa Diretora — Biênio 2026/2028",
                  associationName: "Associação Cearense de Escritores - ACE",
                  associationLogo: "/ace-logo.jpg",
                  status: "OPEN",
                },
              },
            },
          }),
        ],
      },
    });

    expect(wrapper.text()).toContain("Associação Cearense de Escritores - ACE");
    expect(wrapper.text()).toContain("Vote pelo Celular");
    expect(wrapper.text()).toContain("Abra a câmera do celular");
    expect(wrapper.text()).toContain("Confirme o seu Voto");
    expect(wrapper.find("button").exists()).toBe(false);
  });
});
