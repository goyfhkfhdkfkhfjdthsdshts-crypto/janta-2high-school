#!/usr/bin/env node

/**
 * GitHub Pages Static Export Build Script for Next.js
 * 
 * Solves:
 * 1. Missing .nojekyll causing GitHub Pages Jekyll to drop _next/ directory.
 * 2. Static export failure caused by dynamic /api route handlers.
 * 3. Base path configuration for GitHub Pages repository subpaths (https://username.github.io/repo/).
 * 4. 404.html fallback for client-side SPA routing on GitHub Pages.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const APP_API_DIR = path.join(ROOT_DIR, 'app', 'api');
const BACKUP_API_DIR = path.join(ROOT_DIR, '.api_static_export_backup');
const OUT_DIR = path.join(ROOT_DIR, 'out');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

console.log('🚀 Starting GitHub Pages Static Export Build...\n');

// 1. Detect and configure basePath
let repoName = '';
if (process.env.GITHUB_REPOSITORY) {
  const parts = process.env.GITHUB_REPOSITORY.split('/');
  const repo = parts[1];
  if (repo && !repo.endsWith('.github.io')) {
    repoName = `/${repo}`;
  }
}

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || process.env.BASE_PATH || repoName;
const basePath = rawBasePath && rawBasePath !== '/' 
  ? (rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`).replace(/\/$/, '') 
  : '';

console.log(`📦 Configuration:`);
console.log(`   - GITHUB_REPOSITORY: ${process.env.GITHUB_REPOSITORY || '(not set)'}`);
console.log(`   - Resolved basePath:  "${basePath || '/'}"`);
console.log(`   - Output directory:   out/\n`);

// 2. Ensure public/.nojekyll exists
const publicNoJekyll = path.join(PUBLIC_DIR, '.nojekyll');
if (!fs.existsSync(publicNoJekyll)) {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  fs.writeFileSync(publicNoJekyll, '');
  console.log('✅ Created public/.nojekyll');
}

// 3. Temporarily isolate app/api during static export
// Static export cannot export dynamic server-side Route Handlers (POST/database endpoints)
let movedApi = false;
if (fs.existsSync(APP_API_DIR)) {
  console.log('📦 Temporarily isolating app/api directory for static HTML generation...');
  try {
    fs.renameSync(APP_API_DIR, BACKUP_API_DIR);
    movedApi = true;
  } catch (err) {
    console.warn('⚠️ Could not move app/api:', err.message);
  }
}

// Clean dev cache that could have stale types
const devCache = path.join(ROOT_DIR, '.next-dev');
if (fs.existsSync(devCache)) {
  try {
    fs.rmSync(devCache, { recursive: true, force: true });
  } catch {}
}

let buildError = null;

try {
  console.log('🔨 Compiling static Next.js export...');
  execSync('npx next build', {
    stdio: 'inherit',
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      GITHUB_PAGES: 'true',
      STATIC_EXPORT: 'true',
      NEXT_PUBLIC_BASE_PATH: basePath,
      BASE_PATH: basePath,
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('ais-dev-')
          ? process.env.NEXT_PUBLIC_API_URL
          : '',
      NEXT_PUBLIC_APP_URL:
        process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('ais-dev-')
          ? process.env.NEXT_PUBLIC_APP_URL
          : '',
    },
  });
  console.log('\n✅ Static compilation finished successfully!');
} catch (err) {
  buildError = err;
} finally {
  // Always restore app/api directory
  if (movedApi && fs.existsSync(BACKUP_API_DIR)) {
    try {
      fs.renameSync(BACKUP_API_DIR, APP_API_DIR);
      console.log('🔄 Restored app/api directory.');
    } catch (err) {
      console.error('❌ Failed to restore app/api:', err);
    }
  }
}

if (buildError) {
  console.error('\n❌ Static build failed.');
  process.exit(1);
}

// 4. Post-build verification and fixes for GitHub Pages
if (fs.existsSync(OUT_DIR)) {
  // A. Guarantee .nojekyll in out/
  const outNoJekyll = path.join(OUT_DIR, '.nojekyll');
  if (!fs.existsSync(outNoJekyll)) {
    fs.writeFileSync(outNoJekyll, '');
    console.log('✅ Injected out/.nojekyll (prevents GitHub Pages Jekyll from skipping _next/ folder)');
  }

  // B. Guarantee 404.html for SPA client-side routing fallback
  const outIndex = path.join(OUT_DIR, 'index.html');
  const out404 = path.join(OUT_DIR, '404.html');
  if (fs.existsSync(outIndex) && !fs.existsSync(out404)) {
    fs.copyFileSync(outIndex, out404);
    console.log('✅ Created out/404.html fallback from index.html for client-side routing');
  }

  console.log('\n🎉 SUCCESS! GitHub Pages static build is ready in `out/` directory.');
  console.log('\n📌 How to deploy:');
  console.log('   Option 1 (GitHub Actions - Recommended):');
  console.log('     Push to GitHub. The included .github/workflows/deploy.yml will automatically build and deploy.');
  console.log('   Option 2 (Manual or gh-pages branch):');
  console.log('     npx gh-pages -d out -t true\n');
} else {
  console.error('❌ Error: out/ directory was not generated.');
  process.exit(1);
}
