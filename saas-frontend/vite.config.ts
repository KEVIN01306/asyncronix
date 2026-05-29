import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/logo_app.png","icons/asyncronix_corto.png", "icons/asyncronix.png"],
      manifest: {
        name: "Asyncronix ERP",
        short_name: "Asyncronix",
        description: "Sistema de gestión empresarial para pymes, con módulos de ventas, productos, clientes y más.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait",
        icons: [
          {
            src: "icons/logo_app.png",
            sizes: "150x150",
            type: "image/png"
          },
          {
            src: "icons/asyncronix.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"]
      }
    })
  ],

  server: {
    host: '0.0.0.0',
    allowedHosts: ['app.asyncronix.com', 'www.app.asyncronix.com'],
    port: 5001,
  },
})
