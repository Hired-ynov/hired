import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://localhost:3000'],
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'class-transformer/storage': 'class-transformer/cjs/storage.js',
      'file-type': path.resolve(__dirname, 'shims/file-type-shim.js'),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Masque l'avertissement "Critical dependency: the request of a dependency is an expression"
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        message:
          /Critical dependency: the request of a dependency is an expression/,
        module: /load-esm/,
      },
    ];

    return config;
  },
};

export default nextConfig;
