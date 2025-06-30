import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Configuración para pdf-parse para evitar problemas con archivos de test
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdf-parse': 'pdf-parse/lib/pdf-parse.js'
    };

    // Ignora los archivos de test de pdf-parse
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        'pdf-parse/test/data/05-versions-space.pdf': 'commonjs pdf-parse/test/data/05-versions-space.pdf'
      });
    }

    // Configuración para ignorar handlebars require.extensions warnings
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    // Ignorar archivos problemáticos de handlebars
    config.module.rules.push({
      test: /node_modules\/handlebars\/lib\/index\.js$/,
      use: 'null-loader'
    });

    // Configuración adicional para ignorar warnings de require.extensions
    config.ignoreWarnings = [
      /require\.extensions is not supported by webpack/,
    ];

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Added for Firebase Storage
        port: '',
        pathname: '/**',
      }
    ],
    // Permite cargar imágenes desde rutas locales
    unoptimized: true,
  },
};

export default nextConfig;
