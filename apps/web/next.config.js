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
      '@nestjs/swagger': path.resolve(
        __dirname,
        'shims/nestjs-swagger-shim.js',
      ),
      'class-transformer/storage': 'class-transformer/cjs/storage.js',
      'file-type': path.resolve(__dirname, 'shims/file-type-shim.js'),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
        fs: false,
        os: false,
        perf_hooks: false,
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
