import { createTestingPinia } from "@pinia/testing";
import { mount, type VueWrapper } from "@vue/test-utils";
import { useCounterStore } from "~/store";
import BoxCount from "./BoxCount.vue";

describe("BoxCount", () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(BoxCount, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vitest.fn,
          }),
        ],
      },
    });
  });
  test("increments count when button is clicked", async () => {
    const store = useCounterStore();

    const button = wrapper.find("button");
    await button.trigger("click");

    expect(store.increment).toHaveBeenCalledOnce();
  });
});
