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
  let repoName = '';
  if (process.env.GITHUB_REPOSITORY) {
    const parts = process.env.GITHUB_REPOSITORY.split('/');
    const repo = parts[1];
    // If repository is username.github.io, it is served at root domain, so basePath is ''
    if (repo && !repo.endsWith('.github.io')) {
      repoName = `/${repo}`;
    }
  }

  const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || process.env.BASE_PATH || (isExport ? repoName : '');
  const basePath = rawBasePath && rawBasePath !== '/' 
    ? (rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`).replace(/\/$/, '') 
    : '';

  return {
    // Enable static export when building for GitHub Pages or static hosting
    ...(isExport
      ? {
          output: 'export' as const,
          trailingSlash: true,
          basePath: basePath || undefined,
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
      ignoreBuildErrors: isExport,
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
