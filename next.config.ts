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
    // Configuración diferente para servidor vs cliente
    if (isServer) {
      // En el servidor, externalizar completamente pdf-parse para evitar conflictos
      config.externals = [...(config.externals || []), 'pdf-parse'];
    } else {
      // En el cliente, configurar alias para usar la versión core
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdf-parse': 'pdf-parse/lib/pdf-parse.js'
      };
    }

    // Configuración de fallbacks para ambos entornos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      canvas: false,
      jsdom: false,
    };

    // Ignorar archivos problemáticos
    config.module.rules.push(
      {
        test: /node_modules\/handlebars\/lib\/index\.js$/,
        use: 'null-loader'
      },
      {
        test: /node_modules\/pdf-parse\/test\/data\/.*\.pdf$/,
        use: 'null-loader'
      }
    );

    // Configuración adicional para ignorar warnings
    config.ignoreWarnings = [
      /require\.extensions is not supported by webpack/,
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve 'canvas'/,
      /Module not found: Can't resolve 'jsdom'/,
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
