import { mount } from "@vue/test-utils";
import Count from "./Count.vue";

describe("Count", () => {
  it("should render the correct props", () => {
    const wrapper = mount(Count, {
      props: {
        count: 42,
        text: "State increments",
      },
    });
    expect(wrapper.text()).toMatch("State increments 42");
  });
});
