/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  
  // Turbopack configuration (Next.js 16+)
  turbopack: {
    resolveAlias: {
      // Fix for React Three Fiber compatibility
      fs: false,
      path: false,
      crypto: false,
    },
  },
  
  // Webpack configuration (fallback for --webpack flag)
  webpack: (config, { isServer }) => {
    // Fix for React Three Fiber compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  
  redirects() {
    return [
      {
        source: '/docs',
        destination: 'https://docs.netlify.com/frameworks/next-js/overview/',
        permanent: false,
      },
      {
        source: '/old-blog/:slug',
        destination: '/classics',
        permanent: true,
      },
      {
        source: '/github',
        destination: 'https://github.com/netlify-templates/next-platform-starter',
        permanent: false,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/quotes/random',
      },
      {
        source: '/blog',
        destination: '/classics',
      },
    ];
  },
};

export default nextConfig;
