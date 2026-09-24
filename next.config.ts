import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitimos que VS Code y tu red local puedan renderizar la app y sus estilos
  allowedDevOrigins: ['192.168.18.185', 'localhost'],
};

export default nextConfig;