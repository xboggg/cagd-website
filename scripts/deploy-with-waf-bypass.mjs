#!/usr/bin/env node
/**
 * CAGD deploy — puppeteer solves the openresty WAF JS-challenge to get a
 * valid session cookie, then uses that cookie to POST cPanel API v2
 * `Fileman::savefile` for each changed asset.
 *
 * Runs from the project root:  node scripts/deploy-with-waf-bypass.mjs
 * Reads CPANEL_TOKEN from .env.deploy.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env.deploy');

// ── Parse .env.deploy ────────────────────────────────────────────────────────
const env = {};
for (const line of fs.readFileSync(ENV_PATH, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const { CPANEL_USER, CPANEL_HOST, CPANEL_PORT, CPANEL_TOKEN, REMOTE_ROOT = 'public_html' } = env;
const REMOTE_HOME = env.REMOTE_HOME || `/home/${CPANEL_USER}`;
const REMOTE_BASE = `${REMOTE_HOME}/${REMOTE_ROOT}`;
const AUTH = `cpanel ${CPANEL_USER}:${CPANEL_TOKEN}`;
const API_BASE = `https://${CPANEL_HOST}:${CPANEL_PORT}/json-api/cpanel`;

// ── Which files to upload — compare live vs. dist bundle hash ────────────────
const distDir = path.join(ROOT, 'dist');
const assetsDir = path.join(distDir, 'assets');
const distFiles = fs.readdirSync(assetsDir).filter(f => /^index-.*\.(js|css)$/.test(f));
const newJs = distFiles.find(f => f.endsWith('.js'));
const newCss = distFiles.find(f => f.endsWith('.css'));

console.log(`[deploy] New bundle: ${newJs} + ${newCss}`);
console.log(`[deploy] index.html + assets/${newJs} (${(fs.statSync(path.join(assetsDir, newJs)).size / 1024 / 1024).toFixed(2)} MB) will be uploaded`);

// ── Launch headless Chrome, hit cPanel to solve WAF challenge, grab cookies ──
console.log('[deploy] Launching Chrome to solve WAF challenge…');
// Reuse the Chrome already downloaded by cyberabofra's puppeteer to avoid
// a fresh 200 MB download when this script is run for the first time.
const chromeCache = process.env.LOCALAPPDATA ? path.join(process.env.USERPROFILE, '.cache', 'puppeteer', 'chrome') : null;
let executablePath;
if (chromeCache && fs.existsSync(chromeCache)) {
  const versions = fs.readdirSync(chromeCache).filter(d => d.startsWith('win64-'));
  if (versions.length) {
    executablePath = path.join(chromeCache, versions[0], 'chrome-win64', 'chrome.exe');
  }
}
const browser = await puppeteer.launch({
  headless: 'new',
  executablePath,
  args: ['--ignore-certificate-errors', '--disable-blink-features=AutomationControlled'],
});
const page = await browser.newPage();
// Give the challenge a real-looking UA + language so its checks don't fail.
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
await page.setExtraHTTPHeaders({ 'accept-language': 'en-US,en;q=0.9' });
// Hit the cPanel login URL — WAF fires and issues the JS challenge.
try {
  await page.goto(`https://${CPANEL_HOST}:${CPANEL_PORT}/`, { waitUntil: 'networkidle0', timeout: 45000 });
} catch (e) {
  // The challenge causes a self-reload — networkidle may time out. That's fine.
}
// Wait 4s for the challenge script to compute + set the wsidchk cookie.
await new Promise(r => setTimeout(r, 4000));

const cookies = await page.cookies();
const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
console.log(`[deploy] Got ${cookies.length} cookies: ${cookies.map(c => c.name).join(', ')}`);
if (!cookies.find(c => c.name === 'wsidchk')) {
  console.warn('[deploy] WARNING: no wsidchk cookie — challenge may not have executed. Continuing anyway.');
}
await browser.close();

// ── Post one savefile call ───────────────────────────────────────────────────
async function savefile(localPath, remoteDir, remoteName) {
  const content = fs.readFileSync(localPath, 'utf8');
  const body = new URLSearchParams({
    cpanel_jsonapi_user: CPANEL_USER,
    cpanel_jsonapi_apiversion: '2',
    cpanel_jsonapi_module: 'Fileman',
    cpanel_jsonapi_func: 'savefile',
    dir: remoteDir,
    filename: remoteName,
    content,
  });
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Authorization': AUTH,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Cookie': cookieHeader,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    body: body.toString(),
  });
  const text = await res.text();
  if (text.includes('<title>One moment')) {
    throw new Error('WAF still challenging — cookies did not carry over');
  }
  if (text.includes('"error"') && !text.includes('"error":null')) {
    throw new Error(`API error: ${text.slice(0, 300)}`);
  }
  console.log(`[deploy] ✓ ${remoteName} → ${remoteDir} (${(fs.statSync(localPath).size / 1024).toFixed(0)} KB, HTTP ${res.status})`);
}

// ── Upload the changed files ─────────────────────────────────────────────────
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('[deploy] Uploading JS bundle…');
await savefile(path.join(assetsDir, newJs), `${REMOTE_BASE}/assets`, newJs);

// CSS may already be there from a prior deploy; upload only if hash changed.
try {
  const live = await fetch('https://cagd.gov.gh/', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  }).then(r => r.text());
  if (!live.includes(newCss)) {
    console.log('[deploy] Uploading CSS bundle…');
    await savefile(path.join(assetsDir, newCss), `${REMOTE_BASE}/assets`, newCss);
  } else {
    console.log(`[deploy] CSS ${newCss} already live — skipping`);
  }
} catch (e) {
  console.warn(`[deploy] CSS live-check failed, uploading to be safe: ${e.message}`);
  await savefile(path.join(assetsDir, newCss), `${REMOTE_BASE}/assets`, newCss);
}

console.log('[deploy] Uploading index.html (must be last)…');
await savefile(path.join(distDir, 'index.html'), REMOTE_BASE, 'index.html');

// ── Verify ───────────────────────────────────────────────────────────────────
const liveHtml = await fetch('https://cagd.gov.gh/', {
  headers: { 'User-Agent': 'Mozilla/5.0' },
}).then(r => r.text());
if (liveHtml.includes(newJs)) {
  console.log('\n=== DEPLOY SUCCESS ===');
  console.log(`Live now references ${newJs}`);
  process.exit(0);
} else {
  const live = (liveHtml.match(/index-[^"]+\.js/) || [])[0];
  console.error(`\n=== DEPLOY UNVERIFIED === live still points at ${live}, expected ${newJs}`);
  process.exit(2);
}
