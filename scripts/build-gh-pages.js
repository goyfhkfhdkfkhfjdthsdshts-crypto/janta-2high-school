const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting GitHub Pages static export build for Janta +2 High School...');

const rootDir = process.cwd();
const apiDir = path.join(rootDir, 'app', 'api');
const backupDir = path.join(rootDir, 'api_routes_backup');
const outDir = path.join(rootDir, 'out');

let apiMoved = false;

try {
  // 1. Temporarily move API routes outside of app/ directory so Next.js static export succeeds without server route conflicts
  if (fs.existsSync(apiDir)) {
    console.log('📁 Temporarily shelving server-side API routes for client static export...');
    fs.renameSync(apiDir, backupDir);
    apiMoved = true;
  }

  // 2. Clear old cached types that could cause transient type conflicts
  const nextDevTypes = path.join(rootDir, '.next-dev', 'types');
  const nextTypes = path.join(rootDir, '.next', 'types');
  if (fs.existsSync(nextDevTypes)) fs.rmSync(nextDevTypes, { recursive: true, force: true });
  if (fs.existsSync(nextTypes)) fs.rmSync(nextTypes, { recursive: true, force: true });

  // 3. Run production build with static export flag
  console.log('⚡ Executing Next.js static build...');
  execSync('next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      GITHUB_PAGES: 'true',
      STATIC_EXPORT: 'true',
    },
  });

  // 4. Ensure .nojekyll is present in out/ to prevent GitHub Pages from blocking _next folder
  const nojekyllPath = path.join(outDir, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '', 'utf8');
  console.log('✅ Created .nojekyll in export directory');

  // 5. Ensure 404.html is configured for Single Page App client routing on GitHub Pages
  const out404 = path.join(outDir, '404.html');
  const outIndex = path.join(outDir, 'index.html');
  if (fs.existsSync(outIndex)) {
    // Also provide a copy of index.html as 404.html if 404 doesn't exist so client-side navigation reloads cleanly
    if (!fs.existsSync(out404)) {
      fs.copyFileSync(outIndex, out404);
      console.log('✅ Generated 404.html for GitHub Pages SPA routing');
    }
  }

  console.log('🎉 GitHub Pages static export completed successfully in /out directory!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exitCode = 1;
} finally {
  // Always restore API routes back to app/api
  if (apiMoved && fs.existsSync(backupDir)) {
    console.log('📁 Restoring server-side API routes to app/api...');
    fs.renameSync(backupDir, apiDir);
  }
}
