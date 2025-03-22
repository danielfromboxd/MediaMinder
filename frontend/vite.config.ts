import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["mediaminder.onrender.com", "*.onrender.com"] // Allow all Render domains
  },
  plugins: [
    react(),
    // Only use component tagger in development
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add SPA configuration for React Router
  build: {
    outDir: "dist",
    // Ensure the build doesn't include the component tagger
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  }
}));
