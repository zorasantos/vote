import { createTestingPinia } from "@pinia/testing";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import AppNavbar from "../AppNavbar.vue";

const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRoute: () => ({ path: "/" }),
  useRouter: () => ({ push: mockPush }),
}));

describe("AppNavbar.vue", () => {
  it("deve renderizar a barra com título e botões de navegação", () => {
    const wrapper = mount(AppNavbar, {
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
                  status: "OPEN",
                },
              },
            },
          }),
        ],
        stubs: {
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    expect(wrapper.text()).toContain("Associação Cearense de Escritores - ACE");
    expect(wrapper.text()).toContain("Votação Aberta");
  });

  it("deve alternar a visibilidade do menu móvel ao clicar no botão hambúrguer", async () => {
    const wrapper = mount(AppNavbar, {
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
                  status: "OPEN",
                },
              },
            },
          }),
        ],
        stubs: {
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    const menuButton = wrapper.find(
      'button[aria-label="Alternar menu de navegação"]',
    );
    expect(menuButton.exists()).toBe(true);

    // Inicialmente o menu mobile não está visível
    expect(wrapper.find(".md\\:hidden.border-t").exists()).toBe(false);

    // Clica para abrir o menu mobile
    await menuButton.trigger("click");
    expect(wrapper.find(".md\\:hidden.border-t").exists()).toBe(true);
    expect(wrapper.text()).toContain("Início");
    expect(wrapper.text()).toContain("Configuração");
    expect(wrapper.text()).toContain("Apuração");
    expect(wrapper.text()).toContain("Backup");
    expect(wrapper.text()).not.toContain("Cabine de Votação");
    expect(wrapper.text()).not.toContain("Modo Telão");

    // Clica novamente para fechar
    await menuButton.trigger("click");
    expect(wrapper.find(".md\\:hidden.border-t").exists()).toBe(false);
  });
});
