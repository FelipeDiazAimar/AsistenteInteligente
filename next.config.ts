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
    // Configuración ultra-robusta para evitar problemas con pdf-parse
    
    if (isServer) {
      // En el servidor, externalizar todas las dependencias problemáticas
      const externals = ['canvas', 'jsdom', 'pdf2pic'];
      
      // En producción, también externalizar pdf-parse completamente
      if (!dev) {
        externals.push('pdf-parse');
      }
      
      config.externals = [...(config.externals || []), ...externals];
    } else {
      // En el cliente, bloquear completamente pdf-parse y dependencias relacionadas
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdf-parse': false,
        'pdf2pic': false,
        'node-ensure': false,
        'canvas': false,
        'jsdom': false,
      };
    }

    // Fallbacks globales
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      canvas: false,
      jsdom: false,
      'pdf-parse': false,
      'pdf2pic': false,
      'node-ensure': false,
      stream: false,
      util: false,
      buffer: false,
    };

    // Reglas de módulos más agresivas
    config.module.rules.push(
      // Bloquear completamente pdf-parse en cliente y en builds de producción
      {
        test: /node_modules\/pdf-parse/,
        use: isServer && dev ? 'babel-loader' : 'null-loader'
      },
      // Bloquear handlebars problemático
      {
        test: /node_modules\/handlebars\/lib\/index\.js$/,
        use: 'null-loader'
      },
      // Bloquear archivos de test de pdf-parse
      {
        test: /node_modules\/pdf-parse\/test/,
        use: 'null-loader'
      },
      // Bloquear babel runtime problemático
      {
        test: /node_modules\/@babel\/runtime/,
        use: 'null-loader'
      },
      // Bloquear jQuery y dependencias relacionadas que causan h.noConflict
      {
        test: /node_modules\/jquery/,
        use: 'null-loader'
      }
    );

    // Ignorar todos los warnings relacionados
    config.ignoreWarnings = [
      /require\.extensions is not supported by webpack/,
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve 'canvas'/,
      /Module not found: Can't resolve 'jsdom'/,
      /Module not found: Can't resolve 'pdf-parse'/,
      /Module not found: Can't resolve 'babel-loader'/,
      /Can't resolve 'babel-loader'/,
      /Module not found: Can't resolve 'jquery'/,
      /noConflict/,
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
