import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: { tsgo: process.env.CI !== "true" },
    exports: true,
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {},
});
