import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // escucha en todas las interfaces de red, no solo localhost
    // Permite servir a través de un túnel público (Cloudflare/ngrok): el Host
    // header es el dominio del túnel, que Vite bloquearía por defecto.
    allowedHosts: true,
    // Proxy al API para que TODO viaje por el mismo origen (:5173) — así un solo
    // túnel expone web + WebSocket. El WS necesita ws:true.
    proxy: {
      "/realtime": { target: "ws://localhost:3000", ws: true, changeOrigin: true },
      "/health": { target: "http://localhost:3000", changeOrigin: true },
      "/buildtrack": { target: "http://localhost:3000", changeOrigin: true },
      // /timelapse (manifest + jpgs) lo sirve Vite directo desde public/, no hace falta proxy.
    },
  },
});
