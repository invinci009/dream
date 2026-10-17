/**
 * Vercel Environment Variables Synchronizer
 *
 * Reads `.env.local` and pushes all required environment variables directly to your Vercel project
 * using `npx vercel env`.
 *
 * Usage:
 *   npm run vercel:env
 *   node scripts/update-vercel-env.js [environments...]
 *
 * Examples:
 *   node scripts/update-vercel-env.js production preview development
 *   node scripts/update-vercel-env.js production
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ENV_FILE = path.join(__dirname, '..', '.env.local');

// Variables to sync to Vercel
const TARGET_KEYS = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_SERVICE_ACCOUNT',
  'NEXT_PUBLIC_APP_URL',
  'APP_DOMAIN',
  'SESSION_COOKIE_SECRET',
  'HASH_SALT',
  'GROQ_API_KEY',
  'ANTHROPIC_API_KEY',
  'ADMIN_INITIAL_PASSWORD',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];

// Target Vercel environments: 'production', 'preview', 'development'
const TARGET_ENVIRONMENTS = process.argv.slice(2).length > 0
  ? process.argv.slice(2)
  : ['production', 'preview', 'development'];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: ${filePath} does not exist.`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  const lines = content.split(/\r?\n/);

  let currentKey = null;
  let currentValue = '';
  let inMultiLine = false;
  let quoteChar = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    if (!inMultiLine) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) continue;

      const key = line.slice(0, equalIndex).trim();
      let val = line.slice(equalIndex + 1);

      if (val.startsWith('"') || val.startsWith("'")) {
        quoteChar = val[0];
        val = val.slice(1);
        if (val.endsWith(quoteChar) && !val.endsWith('\\' + quoteChar)) {
          // Closed on same line
          env[key] = val.slice(0, -1).replace(/\\n/g, '\n');
        } else {
          inMultiLine = true;
          currentKey = key;
          currentValue = val;
        }
      } else {
        env[key] = val.trim();
      }
    } else {
      if (rawLine.endsWith(quoteChar) && !rawLine.endsWith('\\' + quoteChar)) {
        currentValue += '\n' + rawLine.slice(0, -1);
        env[currentKey] = currentValue.replace(/\\n/g, '\n');
        inMultiLine = false;
        currentKey = null;
        quoteChar = null;
      } else {
        currentValue += '\n' + rawLine;
      }
    }
  }

  return env;
}

function updateVercelEnv() {
  console.log('\n========================================');
  console.log('🚀 Dream Bazaar • Vercel Env Sync Tool');
  console.log('========================================\n');

  console.log(`Reading configuration from: ${path.relative(process.cwd(), ENV_FILE)}`);
  const parsedEnv = parseEnvFile(ENV_FILE);

  // If service account JSON exists on disk, ensure FIREBASE_SERVICE_ACCOUNT is available
  const saPath = path.join(__dirname, '..', 'firebase-service-account.json');
  if (fs.existsSync(saPath) && !parsedEnv['FIREBASE_SERVICE_ACCOUNT']) {
    try {
      const saRaw = fs.readFileSync(saPath, 'utf8');
      parsedEnv['FIREBASE_SERVICE_ACCOUNT'] = saRaw.trim();
    } catch {}
  }

  console.log(`Target Vercel environments: ${TARGET_ENVIRONMENTS.join(', ')}\n`);

  let totalUpdated = 0;
  let totalErrors = 0;

  for (const key of TARGET_KEYS) {
    const value = parsedEnv[key];
    if (value === undefined || value === null || value === '') {
      continue;
    }

    console.log(`\n📌 Processing [${key}]...`);

    for (const envTarget of TARGET_ENVIRONMENTS) {
      process.stdout.write(`   └─> Setting for "${envTarget}": `);

      // 1. Remove existing env variable if present (avoids "already exists" failure)
      spawnSync('npx', ['-y', 'vercel', 'env', 'rm', key, envTarget, '-y'], {
        stdio: 'ignore',
        shell: true,
      });

      // 2. Add the environment variable by streaming value to stdin
      const result = spawnSync('npx', ['-y', 'vercel', 'env', 'add', key, envTarget], {
        input: value,
        encoding: 'utf8',
        shell: true,
      });

      if (result.status === 0) {
        console.log('✅ Added');
        totalUpdated++;
      } else {
        const errorOut = (result.stderr || result.stdout || '').trim();
        if (errorOut.includes('already exists')) {
          console.log('ℹ️ Already set');
        } else {
          console.log('⚠️ Failed');
          if (errorOut) {
            console.log(`      Error: ${errorOut.split('\n')[0]}`);
          }
          totalErrors++;
        }
      }
    }
  }

  console.log('\n========================================');
  console.log(`🎉 Sync Completed! (Updated: ${totalUpdated}, Errors: ${totalErrors})`);
  console.log('========================================');
  console.log('\nNext steps:');
  console.log('  1. Deploy with fresh envs: npx vercel --prod');
  console.log('  2. Or pull envs locally:   npx vercel env pull\n');
}

updateVercelEnv();
