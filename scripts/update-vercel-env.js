/**
 * Dream Bazaar • 100% Fully Automated Vercel Environment Synchronizer
 *
 * Uses official Vercel flags:
 *   --value "<val>"
 *   --force (overwrites existing without asking)
 *   --yes (accepts all defaults)
 *   --non-interactive (disables all prompts)
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ENV_FILE = path.join(__dirname, '..', '.env.local');

const IGNORED_KEYS = new Set([
  'VERCEL_OIDC_TOKEN',
  'VERCEL_PROJECT_ID',
  'VERCEL_ORG_ID',
]);

const TARGET_ENV = process.argv[2] || 'production,preview,development';

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
  console.log('🚀 Dream Bazaar • Automated Vercel Env Sync');
  console.log('======================================================\n');

  const parsedEnv = parseEnvFile(ENV_FILE);

  // If service account JSON exists on disk, ensure FIREBASE_SERVICE_ACCOUNT is populated
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

  console.log(`🎯 Target environments: [${TARGET_ENV}]`);
  console.log(`📋 Total variables: ${keysToSync.length}\n`);

  let count = 0;

  for (const key of keysToSync) {
    const value = parsedEnv[key];
    process.stdout.write(`[${++count}/${keysToSync.length}] ${key} ... `);

    // Call Vercel CLI with --force --yes --non-interactive
    // Pipe input via stdin to safely support multi-line values (like RSA private keys)
    const result = spawnSync(
      'npx',
      [
        '--yes',
        'vercel',
        'env',
        'add',
        key,
        TARGET_ENV,
        '--force',
        '--yes',
        '--non-interactive',
      ],
      {
        input: String(value) + '\n',
        encoding: 'utf8',
        shell: true,
        timeout: 20000,
      }
    );

    if (result.status === 0) {
      console.log('✅ Synced');
    } else {
      const err = (result.stderr || result.stdout || '').trim();
      const firstLine = err.split('\n').filter((l) => !l.includes('Vercel CLI'))[0] || 'Error';
      console.log(`⚠️ ${firstLine}`);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 All environment variables synchronized to Vercel!');
  console.log('======================================================\n');
}

updateVercelEnv();
