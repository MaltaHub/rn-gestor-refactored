import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

const hmrClientPortEnv = process.env.HMR_CLIENT_PORT ?? process.env.VITE_HMR_CLIENT_PORT
const hmrClientPort = hmrClientPortEnv ? Number.parseInt(hmrClientPortEnv, 10) : undefined

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    hmr: hmrClientPort ? { clientPort: hmrClientPort } : undefined,
  },
})
