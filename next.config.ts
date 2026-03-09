import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // output: 'export' // Desabilitado para permitir uso de middleware e autenticação
    // Proxy removido - usando Route Handlers em /app/api/* para ter controle total sobre headers
};

export default nextConfig;
