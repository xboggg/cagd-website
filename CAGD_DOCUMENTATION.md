# CAGD Website — Master Documentation

**Site:** cagd.gov.gh  
**Department:** Controller and Accountant-General's Department, Ghana  
**Stack:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Supabase  
**Last updated:** 2026-07-17 (rev 2 — image storage architecture, Imunify360 on :2083, deploy method update)

---

## 1. Architecture Overview

```
Browser (admin — uploading image)
    │
    │  NEW (from 2026-07-17): FileUpload.tsx uploads DIRECTLY to Supabase
    │  — NITA server is NOT involved in new image uploads at all
    ▼
db.techtrendi.com  ←── Contabo server 38 (38.242.195.0)
                          • Self-hosted Supabase (Docker)
                          • Kong API gateway on port 8090 internally
                          • nginx proxies db.techtrendi.com → Kong
                          • All database + auth + storage
                          • Supabase storage buckets (cagd-news-images, etc.)

Browser (public visitor)
    │
    ▼
cagd.gov.gh  ←── NITA server (197.253.67.104) — Apache/cPanel
    │                 • Hosts the built React SPA (dist/)
    │                 • Serves OLD static images (/images/news/, etc.)
    │                   (images uploaded before 2026-07-17 live here)
    │                 • PHP endpoints: contact-email.php
    │                 • upload.php still present but no longer used
    │
    ▼  (for data + NEW image URLs)
db.techtrendi.com  ←── Contabo server 38 (38.242.195.0)
```

### Image Storage — Two Eras (important)

| Era | Where images live | URL format |
|---|---|---|
| **Before 2026-07-17** | NITA server `/images/` folder | `/images/news/filename.webp` (relative path) |
| **After 2026-07-17** | Supabase storage on srv-38 | `https://db.techtrendi.com/storage/v1/object/public/cagd-news-images/file.webp` |

**Both eras work simultaneously and permanently.** Old articles still load their images from the NITA server fine — nothing was migrated or broken. New articles upload images directly to Supabase and use full Supabase URLs. The frontend handles both URL formats automatically.

### Key servers

| Server | IP | Purpose |
|---|---|---|
| NITA (cPanel) | 197.253.67.104 | Hosts the website files |
| Contabo srv-38 | 38.242.195.0 | Supabase (database, auth, storage) |
| Contabo srv-144 | 144.91.71.106 | TrendiMovies / TechTrendi (unrelated to CAGD) |

---

## 2. Local Development

```bash
cd cagd-website
npm run dev        # Vite dev server at http://localhost:5173
npm run build      # Build to dist/
```

**Environment file:** `cagd-website/.env` (git-ignored)
```
VITE_SUPABASE_URL="https://db.techtrendi.com"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 3. Deploy Method

### ⚠️ NITA Server Constraints

The NITA server has several restrictions that affect how you can deploy:

| Method | Status | Reason |
|---|---|---|
| FTP (port 21) | BLOCKED | Port refused |
| SSH/SFTP | BLOCKED | ISP/corporate network blocks outbound SSH |
| cPanel multipart upload | BLOCKED | openresty WAF returns 415 |
| cPanel API v2 `savefile` (PowerShell) | ⚠️ INTERMITTENT | Imunify360 intercepts it when IP is flagged — returns bot-challenge HTML instead of JSON (see Section 4) |
| **Browser — cPanel File Manager** | **ALWAYS WORKS** | Real browser passes Imunify360 JS challenge automatically |

### ⚠️ Imunify360 Now Blocks Port 2083 Too (discovered 2026-07-17)

Imunify360 on the NITA server is now intercepting automated POST requests even to the cPanel API on port `:2083`. When triggered, the API returns an HTML bot-challenge page instead of a JSON response:

```
"One moment, please... Please wait while your request is being verified..."
```

This means the PowerShell `savefile` method may fail even though it previously worked (it worked on 2026-07-03 during the initial site upload). A real browser passes this JS challenge automatically; PowerShell cannot.

**When this happens, the only working deploy method is the browser-based cPanel File Manager.**

### Working Deploy — cPanel File Manager (Browser)

1. Open `https://197.253.67.104:2083/` in a browser
2. Log in → File Manager → navigate to `public_html/assets/`
3. Upload the JS and CSS bundle files
4. Navigate to `public_html/` root → upload `index.html` LAST

### PowerShell Deploy — Use When IP is Not Flagged

Credentials are in `cagd-website/.env.deploy` (git-ignored):
```
CPANEL_USER=cagdgov
CPANEL_HOST=197.253.67.104
CPANEL_PORT=2083
CPANEL_TOKEN=<token>
REMOTE_ROOT=public_html
```

Deploy command (may be blocked by Imunify360 — try browser first):
```powershell
$AUTH = "cpanel cagdgov:<TOKEN>"
$BASE = "https://197.253.67.104:2083/json-api/cpanel"

$body = @{
    cpanel_jsonapi_user       = "cagdgov"
    cpanel_jsonapi_apiversion = "2"
    cpanel_jsonapi_module     = "Fileman"
    cpanel_jsonapi_func       = "savefile"
    dir                       = "/home/cagdgov/public_html/assets"
    filename                  = "index-HASH.js"
    content                   = (Get-Content "dist\assets\index-HASH.js" -Raw)
}
Invoke-RestMethod -Uri $BASE -Method Post -Body $body `
    -Headers @{Authorization=$AUTH} -ContentType "application/x-www-form-urlencoded" `
    -SkipCertificateCheck -TimeoutSec 300
```

**If the response is an HTML page starting with `<!DOCTYPE html>` instead of JSON → Imunify360 has flagged your IP. Switch to browser File Manager.**

### Deploy Order (ALWAYS follow this)

1. `dist/assets/index-HASH.js` → `public_html/assets/`
2. `dist/assets/index-HASH.css` → `public_html/assets/` (only if hash changed)
3. `api/upload.php` → `public_html/api/` (if changed)
4. `dist/index.html` → `public_html/` ← ALWAYS LAST

### What Must Deploy (not just dist/)

| Local file | Server path | Notes |
|---|---|---|
| `dist/*` | `public_html/` | Built React SPA |
| `api/upload.php` | `public_html/api/` | Image/PDF upload endpoint |
| `api/.htaccess` | `public_html/api/` | Passes Authorization header to PHP |
| `public/contact-email.php` | `public_html/` | Contact form mailer |
| `site.htaccess` | `public_html/.htaccess` | SPA routing |

---

## 4. Imunify360 WAF — Known Issues

The NITA server runs Imunify360 which aggressively blocks automated requests.

### Scope of Imunify360 Protection (updated 2026-07-17)

Imunify360 protects **both** the website port AND the cPanel admin port:

| Port | What it protects | Effect on us |
|---|---|---|
| 80 / 443 | Website (Apache) | Blocks file upload POST, bans IPs |
| **2083** | **cPanel API** | **Also blocked** — even the `savefile` API gets the JS challenge |

This means there is **no fully automated deploy path** from a flagged IP. A real browser is required.

### Triggers that get our IP flagged

- Sending PHP code (`<?php`) in POST body content
- Sending binary or large file content via POST
- Multiple rapid POST requests to the server
- Any automated HTTP client (PowerShell, curl) making POST requests to port 2083

### Symptoms of being flagged/banned

- Any POST to port 2083 returns HTML: `"One moment, please... Please wait while your request is being verified..."`
- The HTML contains obfuscated JavaScript that real browsers execute to pass the challenge
- Automated scripts (PowerShell, curl) cannot execute JavaScript → permanently fail
- Bans are **temporary** — usually clears within a few hours
- Diagnosis: if `Invoke-RestMethod` result starts with `<!DOCTYPE html>` instead of JSON → you are flagged

### Workarounds (in order of preference)

1. **Use browser cPanel File Manager** at `https://197.253.67.104:2083/` — real browsers always pass the challenge
2. **Wait** a few hours for the IP flag to expire, then retry PowerShell
3. **For image uploads specifically** — use Supabase storage (Section 7) which bypasses NITA entirely, permanently

### Long-term solution

The permanent fix for image uploads is already in place (FileUpload.tsx rewritten to use Supabase storage directly — no POST to NITA server needed). For code deploys, the File Manager is the only reliable method until NITA whitelists our IP or disables Imunify360 challenges on port 2083.

---

## 5. Supabase Setup

**URL:** `https://db.techtrendi.com`  
**Server:** Contabo 38 (38.242.195.0)  
**Docker path:** `/opt/supabase/docker/`  
**Kong port (internal):** 8090  

### Credentials (on server 38)

SSH to `root@38.242.195.0` (key: `~/.ssh/id_rsa`), then:
```bash
cat /opt/supabase/docker/.env | grep -E 'SERVICE_ROLE|ANON_KEY|JWT_SECRET'
```

### CAGD Tables (all prefixed `cagd_`)

`cagd_news`, `cagd_events`, `cagd_reports`, `cagd_management_profiles`,  
`cagd_divisions`, `cagd_projects`, `cagd_gallery_albums`, `cagd_gallery_photos`,  
`cagd_regional_offices`, `cagd_site_settings`, `cagd_contact_messages`,  
`cagd_newsletter_subscribers`, `cagd_user_roles`, `cagd_profiles`

### Supabase Storage Buckets (CAGD)

`cagd-news-images`, `cagd-report-pdfs`, `cagd-gallery-images`,  
`cagd-profile-photos`, `cagd-leadership`, `cagd-hero-images`,  
`cagd-events`, `cagd-regional`, `cagd-announcements`

All CAGD buckets are **public** (`"public": true`).

### Running DB Queries via SSH

```bash
ssh -i ~/.ssh/id_rsa root@38.242.195.0
docker exec supabase-db psql -U postgres -c "YOUR SQL HERE"
```

---

## 6. Admin Panel

**URL:** `https://cagd.gov.gh/admin`  
**Login:** `https://cagd.gov.gh/admin/login`

### User Roles

Managed in `cagd_user_roles` table. Two roles:
- `admin` — full access to all sections
- `editor` — access to: Dashboard, News, Reports, Events, Messages only

### Admin Spinner Fix (implemented 2026-07)

**Problem:** Admin page showed infinite spinner when role fetch was slow or returned null.  
**Root cause:** `AdminLayout.tsx` spun forever on `!role` instead of tracking whether the fetch had completed.  
**Fix:** Added `roleLoaded: boolean` state to `useAuth.tsx`. Spinner condition changed from `!role` to `!roleLoaded`.  
**Files:** `src/hooks/useAuth.tsx`, `src/components/admin/AdminLayout.tsx`

### New Post Draft Persistence (implemented 2026-07)

**Problem:** Writing a new post and switching tabs (or browser refreshing) wiped everything typed.  
**Root cause:** React modal state is in-memory only — unmounting discards it.  
**Fix:** Auto-save to `localStorage` key `cagd_news_draft` on every keystroke. Restore on next "New Post" open. Clear on successful save.  
**Files:** `src/pages/admin/NewsManager.tsx`  
**UX:** Yellow banner "Draft restored — your unsaved work is back" appears when a draft is found. "Discard draft" button clears it.

---

## 7. Image Uploads

### How Images Work — Two Storage Locations

Images for the CAGD site live in two places depending on when they were uploaded:

| Location | Path format | Status |
|---|---|---|
| **NITA server** `/images/` folder | `/images/news/filename.webp` (relative path) | Old images only — articles published before 2026-07-17. Still served fine, nothing to migrate. |
| **Supabase storage** on srv-38 | `https://db.techtrendi.com/storage/v1/object/public/cagd-news-images/file.webp` (full URL) | All new uploads from 2026-07-17 onwards. The professional standard. |

**Both formats work permanently side by side.** The database stores whatever URL format was used when the article was saved. The frontend renders whichever URL is in the `featured_image` field — relative path (NITA) or full URL (Supabase).

### Why Supabase Storage Is the Better Professional Choice

1. **Backed up daily** — part of the Supabase DB backup on srv-38 (runs every night)
2. **Never depends on NITA** — bypasses Imunify360 WAF entirely, no 500 errors ever
3. **Clean permanent URLs** — accessible from any device, no server path fragility
4. **Direct browser upload** — admin uploads straight from browser to Supabase without touching NITA
5. **Scales independently** — storage can grow without affecting the NITA server at all

### FileUpload.tsx — Permanent Fix (2026-07-17)

`src/components/FileUpload.tsx` was completely rewritten to upload directly to Supabase storage using the Supabase JS client (`supabase.storage.from(bucket).upload()`). This eliminates ALL dependency on `upload.php` for new uploads.

**How it works:**
1. Admin picks a file in the browser
2. Browser calls `supabase.storage.from('cagd-news-images').upload(path, file)` directly
3. Supabase returns a public URL
4. URL is stored in the `featured_image` database field
5. NITA server is never involved

**upload.php is now retired for new uploads.** It still exists on the server but is no longer called by the frontend.

### upload.php — Historical Issues & Solutions (archive)

These issues were fixed but upload.php is now bypassed entirely. Documented for reference.

### upload.php — Known Issues & Solutions

**File location:** `public_html/api/upload.php` on NITA server

#### Issue 1: "JWT secret not set" error
**Cause:** Script tried to read `/home/cagdgov/.cagd_upload_secret` which doesn't exist.  
**Fix:** Replaced with local JWT decode — no secret file needed. JWT is decoded from its base64 payload and validated by checking `sub` (user ID), `role ≠ anon`, and `exp` (not expired).

#### Issue 2: "Missing or invalid Authorization header"
**Cause:** Apache on cPanel strips the `Authorization` header before passing to PHP.  
**Fix:** Two-part fix:
1. `api/.htaccess` passes the header: `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]`
2. PHP checks three sources: `$_SERVER['HTTP_AUTHORIZATION']`, `$_SERVER['REDIRECT_HTTP_AUTHORIZATION']`, `getallheaders()['Authorization']`

#### Issue 3: Upload times out (ERR_TIMED_OUT)
**Cause:** Old version of upload.php used `curl` to call `db.techtrendi.com/auth/v1/user` for JWT validation. NITA server cannot make outbound HTTP connections — curl hangs indefinitely.  
**Fix:** Removed all outbound calls. JWT decoded entirely locally.

#### Issue 4: ERR_SSL_PROTOCOL_ERROR on upload
**Cause:** PHP arrow function `fn($t) => ...` syntax requires PHP 7.4+. NITA server likely runs older PHP. Script crashed silently, malformed response broke SSL stream.  
**Fix:** Replaced arrow function with compatible syntax:
```php
// OLD (PHP 7.4+ only):
$timestamps = array_filter($timestamps, fn($t) => $t > ($now - 60));

// FIXED (PHP 5.3+):
$timestamps = array_filter($timestamps, function($t) use ($now) { return $t > ($now - 60); });
```

#### Issue 5: Imunify360 blocks file upload POST
**Cause:** WAF detects multipart file upload to PHP and terminates connection.  
**Workaround:** Upload images via Supabase storage instead (see Section 7 below).

### Uploading Images to Supabase Storage (bypass NITA)

When NITA upload is broken/blocked, upload directly to Supabase storage via SSH:

```bash
# 1. SCP image to server 38
scp -i ~/.ssh/id_rsa image.webp root@38.242.195.0:/tmp/

# 2. Upload to Supabase storage bucket
ssh -i ~/.ssh/id_rsa root@38.242.195.0
curl -s -X POST \
  'http://127.0.0.1:8090/storage/v1/object/cagd-news-images/image.webp' \
  -H 'Authorization: Bearer <SERVICE_ROLE_KEY>' \
  -H 'Content-Type: image/webp' \
  --data-binary @/tmp/image.webp

# 3. Public URL (use this in featured_image field):
# https://db.techtrendi.com/storage/v1/object/public/cagd-news-images/image.webp
```

### Updating featured_image in Database

```bash
ssh -i ~/.ssh/id_rsa root@38.242.195.0
docker exec supabase-db psql -U postgres -c \
  "UPDATE cagd_news SET featured_image = '/images/news/file.webp' WHERE id = 'ARTICLE-UUID';"
```

To find an article's ID:
```bash
docker exec supabase-db psql -U postgres -c \
  "SELECT id, title FROM cagd_news WHERE title ILIKE '%keyword%';"
```

### Image Optimisation

Before uploading images, optimise with ffmpeg (install once, use always):
```bash
ffmpeg -i input.png -vf scale=1200:-1 -c:v libwebp -quality 85 output.webp
```
Target: **under 100KB** at 1200px wide.

---

## 8. User Management

### Admin Panel User Management

Path: `https://cagd.gov.gh/admin/users`  
Rule: Only `@cagd.gov.gh` email addresses can be added.

### Resetting a Forgotten Password

Cannot be done from the admin UI — must be done via SSH:

```bash
# 1. Find user ID
ssh -i ~/.ssh/id_rsa root@38.242.195.0
docker exec supabase-db psql -U postgres -c \
  "SELECT id, email FROM auth.users WHERE email = 'user@cagd.gov.gh';"

# 2. Set temporary password via Supabase admin API
curl -s -X PUT "http://127.0.0.1:8090/auth/v1/admin/users/<USER-ID>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"password": "TempPass@2026!"}'
```

Share the temporary password with the user. They log in then use **Change Password** in the admin sidebar (bottom left).

---

## 9. SSL & Connectivity

### db.techtrendi.com SSL

- **Server:** Contabo 38 (38.242.195.0)
- **Cert:** Let's Encrypt via certbot, cert name `db.techtrendi.com-0001`
- **Valid until:** 2026-10-09
- **nginx config:** `/etc/nginx/sites-enabled/db.techtrendi.com`
- **Note:** There is also an EXPIRED cert (`db.techtrendi.com`) from before — nginx uses the `-0001` one which is valid.

### "Login failed — Failed to fetch" on cagd.gov.gh/admin/login

**Most common cause:** VPN or corporate network TLS interception. The SSL error appears in browser console but resolves when tested from outside the VPN.  
**Check:** If the error only happens on one network/device, it's the VPN, not the server.  
**Verify server is fine:** `curl -sk https://db.techtrendi.com/health` should return `{"message":"Unauthorized"}` (not an SSL error — correct Supabase response).

### Supabase containers on srv-38

If Supabase is down, check:
```bash
ssh root@38.242.195.0
docker ps | grep supabase
# All supabase-* containers should be listed
# supabase-kong should show port 0.0.0.0:8090->8000/tcp
```

---

## 10. GitHub Repository

**Repo:** `https://github.com/xboggg/cagd-website` (public)  
**Branch:** `main`  

### ⚠️ Security Debt

- FTP password was previously hardcoded in `deploy.sh` and pushed to the public repo (commit `34d001e`). Password is STILL in git history.
- **Action needed:** Rotate the cPanel password AND do a `git filter-repo` history purge.
- Credentials now live in `.env.deploy` (git-ignored) — never hardcode again.

---

## 11. Quick Reference — Common Tasks

### Deploy a code change

1. Make change locally, test on `http://localhost:5173`
2. `npm run build` in `cagd-website/`
3. Note the new hashes in `dist/index.html` (open the file, check the `src=` and `href=` on the last two lines of `<head>`)
4. Upload via cPanel File Manager (browser — most reliable):
   - `dist/assets/index-XXXXX.js` → `public_html/assets/`
   - `dist/assets/index-XXXXX.css` → `public_html/assets/` (only if CSS hash changed)
   - `dist/index.html` → `public_html/` ← **ALWAYS LAST**
5. Try PowerShell savefile API only if IP is not flagged by Imunify360 (see Section 3 + 4)
6. Verify deploy: open `https://cagd.gov.gh/` in browser → View Source → check JS filename matches new hash

### Add a news article with image

1. Go to `https://cagd.gov.gh/admin/news` → New Post
2. Fill title, excerpt, content, tags, date
3. Click the image upload area — it uploads directly to Supabase storage (no NITA involvement)
4. Optimise image first if needed: `ffmpeg -i input.png -vf scale=1200:-1 -c:v libwebp -quality 85 output.webp` (target < 100KB)
5. Set category to "Press Release" (or appropriate)
6. Set status to "Published" and save

**If Supabase upload fails** (rare — check browser console for error):
- SCP to server 38, upload to `cagd-news-images` bucket manually (see Section 7 "Uploading Images to Supabase Storage via SSH")
- Update DB `featured_image` field to Supabase storage URL

### Reset a user's password

See Section 8 above. Requires SSH to server 38.

### Find why admin spinner won't stop

Check browser console for errors on `db.techtrendi.com` requests. If SSL errors → likely VPN. If network errors → check Supabase containers on srv-38.

### Check if deploy went through

```powershell
(Invoke-WebRequest https://cagd.gov.gh/ -SkipCertificateCheck).Content | Select-String 'index-.*\.js'
```
Compare the JS filename to what you just built.

---

## 12. File Structure (key files only)

```
cagd-website/
├── src/
│   ├── hooks/useAuth.tsx          # Auth + roleLoaded fix
│   ├── components/admin/
│   │   └── AdminLayout.tsx        # Admin shell + spinner fix
│   ├── components/FileUpload.tsx  # Uploads DIRECTLY to Supabase storage (upload.php retired)
│   ├── pages/admin/
│   │   └── NewsManager.tsx        # News CRUD + draft persistence
│   └── integrations/supabase/
│       └── client.ts              # Supabase client (reads .env)
├── api/
│   ├── upload.php                 # File upload endpoint (PHP 5.3+ compatible)
│   └── .htaccess                  # Passes Authorization header to PHP
├── public/
│   └── images/                    # Static images (hero, news, etc.)
├── dist/                          # Built output — deploy this to NITA
├── .env                           # Supabase URL + anon key (git-ignored)
├── .env.deploy                    # cPanel deploy credentials (git-ignored)
└── CAGD_DOCUMENTATION.md          # This file
```

---

## 13. Contacts & Access

| Resource | Details |
|---|---|
| cPanel URL | `https://197.253.67.104:2083/` |
| cPanel user | `cagdgov` |
| cPanel token | In `.env.deploy` |
| SSH to srv-38 | `ssh -i ~/.ssh/id_rsa root@38.242.195.0` |
| Supabase admin | `https://db.techtrendi.com` (Kong proxied) |
| Admin login | `https://cagd.gov.gh/admin/login` |
| Admin email | `edmund.adjekum@cagd.gov.gh` |
