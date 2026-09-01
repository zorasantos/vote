import { createTestingPinia } from "@pinia/testing";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import VotingQrCodeCard from "../VotingQrCodeCard.vue";

vi.mock("~/services/qrCodeService", () => ({
  VERCEL_BASE_URL: "https://vote-pi-sable.vercel.app",
  CABIN_PATH: "/voting",
  getDefaultCabinUrl: () => "https://vote-pi-sable.vercel.app/voting",
  getCurrentCabinUrl: () => "https://vote-pi-sable.vercel.app/voting",
  generateQrCodeDataUrl: vi
    .fn()
    .mockResolvedValue("data:image/png;base64,fake-qr-code"),
  downloadQrCodeImage: vi.fn(),
}));

describe("VotingQrCodeCard.vue", () => {
  it("deve renderizar o card de QR Code com o link oficial da Vercel", async () => {
    const wrapper = mount(VotingQrCodeCard, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              election: {
                currentElection: {
                  id: "el-1",
                  title: "Eleição 2026",
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

    expect(wrapper.text()).toContain("QR Code da Cabine de Votação");
    const input = wrapper.find<HTMLInputElement>("input");
    expect(input.exists()).toBe(true);
    expect(input.element.value).toBe("https://vote-pi-sable.vercel.app/voting");
  });
});
