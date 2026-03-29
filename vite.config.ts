import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import relay from 'vite-plugin-relay-lite'

export default defineConfig({
  plugins: [
    react(),
    relay()
  ],
  base: "./",
  resolve: {
    alias: {
      'react-dom/client': 'react-dom/profiling',
      'scheduler/tracing': 'scheduler/tracing-profiling',
    },
  },
  build: {
    // Keeps component names readable in the profiler
    minify: false, 
  },
});

