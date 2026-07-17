# CAGD Website — Master Documentation

**Site:** cagd.gov.gh  
**Department:** Controller and Accountant-General's Department, Ghana  
**Stack:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Supabase  
**Last updated:** 2026-07-17

---

## 1. Architecture Overview

```
Browser (user)
    │
    ▼
cagd.gov.gh  ←── NITA server (197.253.67.104) — Apache/cPanel
    │                 • Hosts the built React SPA (dist/)
    │                 • Serves static images (/images/news/, etc.)
    │                 • PHP endpoints: upload.php, contact-email.php
    │
    ▼
db.techtrendi.com  ←── Contabo server 38 (38.242.195.0)
                          • Self-hosted Supabase (Docker)
                          • Kong API gateway on port 8090 internally
                          • nginx proxies db.techtrendi.com → Kong
                          • All database + auth + storage
```

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
| **cPanel API v2 `savefile`** | **WORKS** | URL-encoded POST to port 2083 |

### Working Deploy — PowerShell Script

Credentials are in `cagd-website/.env.deploy` (git-ignored):
```
CPANEL_USER=cagdgov
CPANEL_HOST=197.253.67.104
CPANEL_PORT=2083
CPANEL_TOKEN=<token>
REMOTE_ROOT=public_html
```

Deploy command:
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

### Triggers that get our IP banned

- Sending PHP code (`<?php`) in POST body content
- Sending binary file content (images, PDFs) via API
- Multiple rapid POST requests

### Symptoms of being banned

- cPanel API returns HTML page: `"One moment, please... Please wait while your request is being verified"`
- Even GET requests start returning the challenge page
- Bans are **temporary** — usually clears within a few hours

### Workarounds

1. **Wait** for the ban to expire (few hours)
2. **Upload manually** via browser-based cPanel File Manager at `https://197.253.67.104:2083/`
3. **Use Supabase storage** instead of the NITA server for images (see Section 7)

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

### How Images Work

Images can be stored in **two places**:

| Location | Path format | When to use |
|---|---|---|
| NITA server | `/images/news/filename.webp` | Uploaded via admin upload.php |
| Supabase storage | `https://db.techtrendi.com/storage/v1/object/public/cagd-news-images/file.webp` | When NITA upload fails |

The `resolveImagePath()` function in the frontend handles both formats automatically.

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
2. `npm run build`
3. Note the new JS hash in `dist/assets/index-XXXXX.js`
4. Upload via cPanel File Manager (if API blocked) or PowerShell savefile API:
   - `dist/assets/index-XXXXX.js` → `public_html/assets/`
   - `dist/index.html` → `public_html/`

### Add a news article with image

1. Go to `https://cagd.gov.gh/admin/news` → New Post
2. Fill title, excerpt, content, tags
3. If image upload fails via admin panel:
   - Optimise image with ffmpeg → WebP under 100KB
   - SCP to server 38, upload to `cagd-news-images` Supabase bucket
   - Update DB `featured_image` field to Supabase storage URL
4. Set category to "Press Release" (or appropriate)
5. Set status to "Published" and save

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
│   ├── components/FileUpload.tsx  # Posts to /api/upload.php
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
