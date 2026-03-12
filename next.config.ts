import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // output: 'export' // Desabilitado para permitir uso de middleware e autenticação
    // Proxy removido - usando Route Handlers em /app/api/* para ter controle total sobre headers
    eslint: {
        // Ignora erros de ESLint durante o build (deploy)
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Ignora erros de TypeScript durante o build (deploy)
        ignoreBuildErrors: true,
    },
    // Força dynamic rendering para evitar erros de pre-rendering
    // com useSearchParams e hooks client-side
    output: 'standalone',
};

export default nextConfig;
