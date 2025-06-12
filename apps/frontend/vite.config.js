import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths" // Keep this, it's good practice

import path from "path" // Import path module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()], // Keep tsconfigPaths plugin
  resolve: {
    alias: {
      // Explicitly define the alias for @/components and @/lib
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
