import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/TheTwo/" : "/",
  plugins: [react()],
  server: {
    port: 4173,
  },
}));
