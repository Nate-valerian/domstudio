import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    proxy: {
      "/auth": { target: "https://domstudio1-nate.amvera.io", changeOrigin: true },
      "/content": { target: "https://domstudio1-nate.amvera.io", changeOrigin: true },
      "/vision": { target: "https://domstudio1-nate.amvera.io", changeOrigin: true },
      "/marketplaces": { target: "https://domstudio1-nate.amvera.io", changeOrigin: true },
      "/generate": { target: "https://domstudio1-nate.amvera.io", changeOrigin: true },
      "/users": { target: "https://domstudio1-nate.amvera.io", changeOrigin: true },
      "/plans": { target: "https://domstudio1-nate.amvera.io", changeOrigin: true },
      "/version": { target: "https://domstudio1-nate.amvera.io", changeOrigin: true },
    },
  },
});
