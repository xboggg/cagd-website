#!/usr/bin/env bash
# =============================================================================
# CAGD Website Deploy Script  (cPanel API over HTTPS:2083 — no FTP, no SSH)
# Usage:
#   bash deploy.sh                   — auto timestamp commit message
#   bash deploy.sh "my message"      — custom commit message
#
# Why the API? This host has no FTP, and the ISP blocks outbound SSH ports.
# The cPanel UAPI (Fileman::upload_files) works over HTTPS:2083, which IS
# reachable, and authenticates with a git-ignored API token in .env.deploy.
#
# Flow: local → GitHub → build → cPanel API upload (assets first, index.html last)
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Load cPanel API settings from git-ignored .env.deploy ────────────────────
if [ ! -f "$SCRIPT_DIR/.env.deploy" ]; then
  echo ""
  echo " ERROR: .env.deploy not found."
  echo " Create it from the template:  cp .env.deploy.example .env.deploy"
  echo " then edit it with your cPanel API token. This file is git-ignored."
  echo ""
  exit 1
fi
# shellcheck disable=SC1091
source "$SCRIPT_DIR/.env.deploy"

: "${CPANEL_USER:?CPANEL_USER not set in .env.deploy}"
: "${CPANEL_HOST:?CPANEL_HOST not set in .env.deploy}"
: "${CPANEL_PORT:?CPANEL_PORT not set in .env.deploy}"     # usually 2083
: "${CPANEL_TOKEN:?CPANEL_TOKEN not set in .env.deploy}"
: "${REMOTE_ROOT:?REMOTE_ROOT not set in .env.deploy}"      # e.g. public_html

# cPanel needs ABSOLUTE paths (/home/<user>/public_html). REMOTE_HOME defaults
# to /home/<user> if not set in .env.deploy.
REMOTE_HOME="${REMOTE_HOME:-/home/${CPANEL_USER}}"
REMOTE_BASE="${REMOTE_HOME}/${REMOTE_ROOT}"    # e.g. /home/cagdgov/public_html

# IMPORTANT (Windows/Git Bash): stop MSYS from rewriting /home/... into C:/...
# Without this, uploads silently land in a junk "C:" folder. Applied per-curl below.
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL='*'

API="https://${CPANEL_HOST}:${CPANEL_PORT}/execute/Fileman/upload_files"
AUTH="Authorization: cpanel ${CPANEL_USER}:${CPANEL_TOKEN}"

# Commit message
if [ -n "$1" ]; then COMMIT_MSG="$1"; else COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M')"; fi

echo ""
echo "============================================================"
echo " CAGD Deploy  →  cPanel API @ ${CPANEL_HOST}:${CPANEL_PORT}"
echo " User: ${CPANEL_USER}   Remote root: ${REMOTE_ROOT}"
echo " Commit: $COMMIT_MSG"
echo "============================================================"
echo ""
echo " ⚠  This will push code to GitHub AND go LIVE on the new host."
echo ""
read -p " Have you tested locally on http://localhost:5173? Deploy now? (y/n): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo ""; echo " Deploy cancelled."; echo ""; exit 0
fi

# ── Upload helper: one file → a remote dir, via cPanel UAPI ──────────────────
# Args: <local-file> <remote-dir>   e.g.  api_upload dist/index.html public_html
api_upload() {
  local src="$1" dir="$2"
  local resp
  # $dir MUST be an absolute remote path (e.g. /home/cagdgov/public_html/assets)
  # overwrite=1 → re-deploys replace old files instead of failing.
  resp=$(MSYS_NO_PATHCONV=1 curl -sk -H "$AUTH" \
      -F "dir=${dir}" \
      -F "overwrite=1" \
      -F "file-1=@${src}" \
      "$API" \
      --connect-timeout 30 --max-time 300)
  # upload_files reports success=1 per file; overall "errors":null
  if echo "$resp" | grep -q '"succeeded":1'; then
    return 0
  else
    echo ""
    echo "   UPLOAD FAILED for $src → $dir"
    echo "   Response: $resp"
    return 1
  fi
}

# Note: cPanel's upload_files auto-creates the destination directory (and
# nested parents), so no explicit mkdir is needed.

# ── Step 1: Git ──────────────────────────────────────────────────────────────
# Set SKIP_PUSH=1 to build+upload WITHOUT committing/pushing to GitHub, e.g.:
#   SKIP_PUSH=1 bash deploy.sh
if [ "${SKIP_PUSH:-0}" = "1" ]; then
  echo ""; echo "[ 1/5 ] Skipping GitHub push (SKIP_PUSH=1)."
else
  echo ""; echo "[ 1/5 ] Syncing to GitHub..."
  git add -A
  if git diff --cached --quiet; then echo "        Nothing to commit."; else
    git commit -m "$COMMIT_MSG"; echo "        Committed: $COMMIT_MSG"; fi
  git push origin main && echo "        Pushed to GitHub ✓"
fi

# ── Step 2: Build ─────────────────────────────────────────────────────────────
echo ""; echo "[ 2/5 ] Building..."
npm run build
echo "        Build complete ✓"

# ── Step 3: assets/ FIRST ────────────────────────────────────────────────────
echo ""; echo "[ 3/5 ] Uploading assets (JS + CSS first)..."
for f in dist/assets/*; do
  [ -f "$f" ] || continue
  echo "        → assets/$(basename "$f")"
  api_upload "$f" "${REMOTE_BASE}/assets"
done
echo "        Assets uploaded ✓"

# ── Step 4: rest of dist/ (php, htaccess, images…) + api/ folder ─────────────
echo ""; echo "[ 4/5 ] Uploading site files + PHP endpoints..."
# top-level files in dist/ except index.html (last) and assets (done)
for f in dist/*; do
  base="$(basename "$f")"
  [ "$base" = "index.html" ] && continue
  [ "$base" = "assets" ] && continue
  if [ -f "$f" ]; then
    echo "        → $base"
    api_upload "$f" "${REMOTE_BASE}"
  elif [ -d "$f" ]; then
    # recurse subdirs (images/, downloads/, etc.) — dirs auto-created on upload
    find "$f" -type f | while read -r sub; do
      rel="${sub#dist/}"                 # e.g. images/logo.png
      subdir="${REMOTE_BASE}/$(dirname "$rel")"
      echo "        → $rel"
      api_upload "$sub" "$subdir"
    done
  fi
done
# api/upload.php + api/.htaccess (NOT in dist/)
echo "        → api/upload.php"
api_upload "api/upload.php" "${REMOTE_BASE}/api"
echo "        → api/.htaccess"
api_upload "api/.htaccess" "${REMOTE_BASE}/api"
echo "        Site files + api/ uploaded ✓"

# ── Step 5: index.html LAST ──────────────────────────────────────────────────
echo ""; echo "[ 5/5 ] Uploading index.html (last)..."
api_upload "dist/index.html" "${REMOTE_BASE}"
echo "        index.html uploaded ✓"

# ── Verify ────────────────────────────────────────────────────────────────────
echo ""; echo "[ ✓ ] Verifying live site..."
LIVE_JS=$(curl -sk "https://cagd.gov.gh/" --connect-timeout 15 | grep -o 'index-[^"]*\.js' | head -1)
LOCAL_JS=$(ls dist/assets/ | grep '^index-.*\.js$' | head -1)
if [ "$LIVE_JS" = "$LOCAL_JS" ]; then
  echo "      Live: $LIVE_JS ✓ Matches build"
else
  echo "      NOTE: Live ($LIVE_JS) != build ($LOCAL_JS)."
  echo "      DNS may still point at the OLD host, or CDN cache — recheck after DNS cutover."
fi
echo ""
echo "============================================================"
echo " Deploy complete!"
echo "============================================================"
echo ""
