import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Disable Rollup's native WASM parser to avoid memory exhaustion on large bundles
process.env.ROLLUP_NO_NATIVE = "1";

/**
 * Split the third-party libraries into named files instead of one blob.
 *
 * Why: the homepage used to ship every library the whole site owns in a
 * single 3.25 MB file — the rich-text editor, the charts, the spreadsheet
 * writer and the map included, none of which a citizen reading the homepage
 * will ever touch. Each name below becomes its own file, fetched only by the
 * pages that actually import it, and cached for a year afterwards.
 *
 * Anything not listed here falls into the default "vendor" file.
 */
function manualChunks(id: string): string | undefined {
  /* Rollup's tiny CommonJS interop helpers are shared by almost every chunk.
     They are not inside node_modules, so without this line Rollup parks them
     in whichever real chunk it likes — it chose the Leaflet one, which meant
     every single page imported the 154 kB map library just to get a 200-byte
     helper, and the homepage preloaded it. Give them a chunk of their own. */
  if (id.includes("commonjsHelpers") || id.includes("commonjs-dynamic-modules")) {
    return "shared";
  }

  if (!id.includes("node_modules")) return undefined;

  /* React, the DOM renderer and the router go in ONE file together.
     @remix-run/router MUST be in here too. It is what react-router is built
     on, so leaving it out put it in "vendor" — and because "vendor" also
     holds libraries that call React.createContext as they load, the two
     files ended up importing each other. A circular pair like that leaves
     one side's exports undefined while the other starts, and the whole site
     renders as a blank white page. Verified by loading the built site in a
     real browser: "Cannot read properties of undefined (reading
     'createContext')". Keep this list closed. */
  if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|@remix-run[\\/]router)[\\/]/.test(id)) {
    return "react-core";
  }
  /* ── Used by ONE area of the site, so never sent to the homepage ── */
  // Rich-text editor — the two admin "write a story" screens only.
  if (/@tiptap|prosemirror|lowlight|highlight\.js|refractor|devlop/.test(id)) return "editor";
  // Charts — the admin dashboard only.
  if (id.includes("recharts") || id.includes("d3-")) return "charts";
  // Spreadsheet writer — the staff-list import screen only.
  if (id.includes("xlsx")) return "spreadsheet";
  // Map — the regional-offices map page only.
  if (id.includes("leaflet")) return "map";
  // Date picker — calendars and admin date fields only.
  if (id.includes("react-day-picker") || id.includes("date-fns")) return "dates";
  // Form validation — the contact form and admin forms only.
  if (/react-hook-form|@hookform|[\\/]zod[\\/]|input-otp/.test(id)) return "forms";
  if (id.includes("embla-carousel")) return "carousel";
  if (id.includes("qrcode")) return "qrcode";
  // HTML sanitiser — the chat widget and the article pages only.
  if (id.includes("dompurify")) return "sanitize";

  /* ── Shared across the whole site ── */
  if (id.includes("framer-motion")) return "motion";
  if (id.includes("@supabase")) return "supabase";
  if (id.includes("@radix-ui")) return "ui";
  if (id.includes("lucide-react")) return "icons";
  if (id.includes("i18next")) return "i18n";
  if (id.includes("@tanstack")) return "query";

  /* Everything left over goes to one predictable file.
     Do NOT return undefined here: Rollup would then be free to park a small
     shared utility (clsx, for one) inside whichever big chunk it liked, and
     the homepage would import the whole chart or editor library to reach it.
     That is exactly the bug this line prevents. */
  return "vendor";
}

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
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: { manualChunks },
    },
  },
}));
