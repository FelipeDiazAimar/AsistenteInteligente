import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer, dev }) => {
    // Configuraciones específicas para el servidor
    if (isServer) {
      // En el servidor, externalizar solo las dependencias problemáticas
      config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
      
      // En producción, externalizar pdf-parse para evitar problemas de build
      if (!dev) {
        config.externals.push('pdf-parse');
      }
    } else {
      // En el cliente, evitar completamente pdf-parse y sus dependencias
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdf-parse': false,
        'pdf2pic': false,
        'node-ensure': false,
      };
    }

    // Configuración de fallbacks para ambos entornos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      canvas: false,
      jsdom: false,
      'pdf-parse': false,
      'pdf2pic': false,
      'node-ensure': false,
    };

    // Ignorar módulos problemáticos durante el build
    config.module.rules.push(
      {
        test: /node_modules\/pdf-parse\/.*\.js$/,
        use: isServer && dev ? 'babel-loader' : 'null-loader'
      },
      {
        test: /node_modules\/handlebars\/lib\/index\.js$/,
        use: 'null-loader'
      },
      {
        test: /node_modules\/pdf-parse\/test\/data\/.*\.pdf$/,
        use: 'null-loader'
      },
      {
        test: /node_modules\/@babel\/runtime\/.*\.js$/,
        use: 'null-loader'
      }
    );

    // Ignorar warnings específicos
    config.ignoreWarnings = [
      /require\.extensions is not supported by webpack/,
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve 'canvas'/,
      /Module not found: Can't resolve 'jsdom'/,
      /Module not found: Can't resolve 'pdf-parse'/,
      /Module not found: Can't resolve 'babel-loader'/,
      /Can't resolve 'babel-loader'/,
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
