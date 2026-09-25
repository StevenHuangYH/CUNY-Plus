import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "~style.css": fileURLToPath(new URL("./src/style.css", import.meta.url)),
      "data-base64:~../assets/icon.png": fileURLToPath(
        new URL("./assets/icon.png", import.meta.url)
      )
    }
  },
  test: { include: ["tests/**/*.test.{ts,tsx}"], restoreMocks: true }
})
