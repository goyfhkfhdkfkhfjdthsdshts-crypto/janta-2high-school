import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

const nextConfig = (phase: string): NextConfig => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const isExport =
    process.env.GITHUB_PAGES === 'true' ||
    process.env.STATIC_EXPORT === 'true' ||
    process.env.NEXT_EXPORT === 'true';

  // Determine repository base path for GitHub Pages (e.g., /repo-name)
  // When deploying to https://<username>.github.io/<repo-name>/, basePath is required.
  const repoName = process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`
    : '';
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (isExport ? repoName : '');

  return {
    // Enable static export when building for GitHub Pages or static hosting
    ...(isExport
      ? {
          output: 'export' as const,
          trailingSlash: true,
          basePath: basePath || undefined,
          assetPrefix: basePath ? `${basePath}/` : undefined,
        }
      : {
          // Separate dev server cache from production build directory to avoid
          // file access race conditions between running dev server and next build.
          distDir: isDev ? '.next-dev' : '.next',
        }),
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: false,
    },
    images: {
      unoptimized: isExport,
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    transpilePackages: ['motion'],
    webpack: (config, { dev }) => {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      if (dev && process.env.DISABLE_HMR === 'true') {
        config.watchOptions = {
          ignored: /.*/,
        };
      }
      return config;
    },
  };
};

export default nextConfig;
