import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Disable Rollup's native WASM parser to avoid memory exhaustion on large bundles
process.env.ROLLUP_NO_NATIVE = "1";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Split into smaller chunks so each file stays under NITA's cPanel
    // savefile payload cap (~2 MB URL-encoded) — the whole-app 3 MB bundle
    // could not be uploaded through the API. Also cheaper for Ghanaian
    // mobile users to load in parallel.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router') || id.includes('/react-dom/') || id.includes('/react/')) return 'react-vendor';
          if (id.includes('@supabase')) return 'supabase-vendor';
          if (id.includes('@tanstack')) return 'tanstack-vendor';
          if (id.includes('@radix-ui')) return 'radix-vendor';
          if (id.includes('lucide-react') || id.includes('sonner') || id.includes('cmdk') || id.includes('vaul') || id.includes('embla')) return 'ui-vendor';
          if (id.includes('recharts') || id.includes('d3-')) return 'chart-vendor';
          if (id.includes('date-fns') || id.includes('react-day-picker')) return 'date-vendor';
          if (id.includes('framer-motion') || id.includes('/motion/')) return 'motion-vendor';
          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'form-vendor';
          if (id.includes('lodash')) return 'lodash-vendor';
          if (id.includes('xlsx')) return 'xlsx-vendor';
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf-vendor';
          return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
}));
