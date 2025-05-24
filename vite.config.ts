import path from "node:path"
import react from "@vitejs/plugin-react"
import rune from "rune-sdk/vite"
import { defineConfig } from "vite"
import { qrcode } from "vite-plugin-qrcode"

// https://vitejs.dev/config/
export default defineConfig({
  base: "", // Makes paths relative
  plugins: [
    react(),
    qrcode(), // only applies in dev mode
    rune({
      logicPath: path.resolve("./src/logic.ts"),
      minifyLogic: false,
      ignoredDependencies: [],
    }),
  ],
})
