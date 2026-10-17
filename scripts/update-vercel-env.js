/**
 * Vercel Environment Variables Synchronizer
 *
 * Reads `.env.local` and pushes all configuration variables directly to your Vercel project
 * using the Vercel CLI (`npx vercel env`).
 *
 * Usage:
 *   npm run vercel:env
 *   node scripts/update-vercel-env.js [environments...]
 *
 * Examples:
 *   npm run vercel:env                                  # Pushes to production, preview & development
 *   node scripts/update-vercel-env.js production        # Pushes to production only
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ENV_FILE = path.join(__dirname, '..', '.env.local');

// Keys that should NEVER be synced to Vercel (internal tokens, temp vars)
const IGNORED_KEYS = new Set([
  'VERCEL_OIDC_TOKEN',
  'VERCEL_PROJECT_ID',
  'VERCEL_ORG_ID',
]);

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
  console.log('\n======================================================');
  console.log('🚀 Dream Bazaar • Vercel Environment Synchronizer');
  console.log('======================================================\n');

  console.log(`📂 Reading configuration from: ${path.relative(process.cwd(), ENV_FILE)}`);
  const parsedEnv = parseEnvFile(ENV_FILE);

  // Fallback: If service account JSON exists on disk, ensure FIREBASE_SERVICE_ACCOUNT is available
  const saPath = path.join(__dirname, '..', 'firebase-service-account.json');
  if (fs.existsSync(saPath) && !parsedEnv['FIREBASE_SERVICE_ACCOUNT']) {
    try {
      const saRaw = fs.readFileSync(saPath, 'utf8');
      parsedEnv['FIREBASE_SERVICE_ACCOUNT'] = saRaw.trim();
    } catch {}
  }

  const keysToSync = Object.keys(parsedEnv).filter(
    (key) => !IGNORED_KEYS.has(key) && parsedEnv[key] !== undefined && parsedEnv[key] !== ''
  );

  console.log(`🎯 Target Vercel environments: ${TARGET_ENVIRONMENTS.join(', ')}`);
  console.log(`📋 Total variables to synchronize: ${keysToSync.length}\n`);

  let totalUpdated = 0;
  let totalErrors = 0;

  for (const key of keysToSync) {
    const value = parsedEnv[key];

    console.log(`📌 Syncing [${key}]...`);

    for (const envTarget of TARGET_ENVIRONMENTS) {
      process.stdout.write(`   └─> [${envTarget}]: `);

      // 1. Remove existing env variable if present to avoid conflict
      spawnSync('npx', ['-y', 'vercel', 'env', 'rm', key, envTarget, '-y'], {
        stdio: 'ignore',
        shell: true,
      });

      // 2. Add the environment variable by passing value into stdin
      const result = spawnSync('npx', ['-y', 'vercel', 'env', 'add', key, envTarget], {
        input: String(value) + '\n',
        encoding: 'utf8',
        shell: true,
      });

      if (result.status === 0) {
        console.log('✅ Added');
        totalUpdated++;
      } else {
        const errorOut = (result.stderr || result.stdout || '').trim();
        if (errorOut.includes('already exists')) {
          console.log('ℹ️ Already exists');
        } else {
          console.log('⚠️ Failed');
          if (errorOut) {
            console.log(`      ${errorOut.split('\n')[0]}`);
          }
          totalErrors++;
        }
      }
    }
  }

  console.log('\n======================================================');
  console.log(`🎉 Sync Completed! (Successfully set: ${totalUpdated}, Errors: ${totalErrors})`);
  console.log('======================================================');
  console.log('\nNext steps:');
  console.log('  • View your envs:    npx vercel env ls');
  console.log('  • Redeploy project:  npx vercel --prod\n');
}

updateVercelEnv();
