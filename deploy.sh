#!/usr/bin/env bash
# =============================================================================
# CAGD Website Deploy Script
# Usage:
#   bash deploy.sh                   — auto timestamp commit message
#   bash deploy.sh "my message"      — custom commit message
#
# Flow: local → GitHub → build → cPanel (FTP)
# Upload order: assets FIRST, index.html LAST (prevents mid-deploy race condition)
# =============================================================================

set -e  # Exit immediately on any error

FTP_USER="terrdnjk"
FTP_PASS='c9At{%7m&pIBo}c{vs'
FTP_HOST="premium328.web-hosting.com"
FTP_ROOT="public_html/cagd.gov.gh"
FTP_BASE="ftp://${FTP_HOST}/${FTP_ROOT}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Commit message: custom arg or auto timestamp
if [ -n "$1" ]; then
  COMMIT_MSG="$1"
else
  COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M')"
fi

echo ""
echo "============================================================"
echo " CAGD Deploy"
echo " Commit: $COMMIT_MSG"
echo "============================================================"

# ── Step 1: Git — stage, commit, push ────────────────────────────────────────
echo ""
echo "[ 1/4 ] Syncing to GitHub..."

git add -A

# Only commit if there are staged changes
if git diff --cached --quiet; then
  echo "        Nothing to commit — working tree clean."
else
  git commit -m "$COMMIT_MSG"
  echo "        Committed: $COMMIT_MSG"
fi

git push origin main
echo "        Pushed to GitHub ✓"

# ── Step 2: Build ─────────────────────────────────────────────────────────────
echo ""
echo "[ 2/4 ] Building..."
npm run build
echo "        Build complete ✓"

# ── Step 3: Upload assets (JS + CSS) FIRST ───────────────────────────────────
echo ""
echo "[ 3/4 ] Uploading assets to cPanel (JS + CSS first)..."

ftp_upload() {
  local src="$1"
  local dest="$2"
  curl -s \
    -u "${FTP_USER}:${FTP_PASS}" \
    -T "$src" \
    "${FTP_BASE}/${dest}" \
    --connect-timeout 60 \
    --max-time 300
}

# Upload all assets (everything in dist/assets/)
for f in dist/assets/*; do
  filename=$(basename "$f")
  echo "        → assets/$filename"
  ftp_upload "$f" "assets/$filename"
done

echo "        Assets uploaded ✓"

# ── Step 4: Upload index.html LAST ───────────────────────────────────────────
echo ""
echo "[ 4/4 ] Uploading index.html (last)..."
ftp_upload "dist/index.html" "index.html"
echo "        index.html uploaded ✓"

# ── Verify deployment ─────────────────────────────────────────────────────────
echo ""
echo "[ ✓ ] Verifying live site..."

LIVE_JS=$(curl -sk "https://cagd.gov.gh/" --connect-timeout 15 | grep -o 'index-[^"]*\.js' | head -1)
LOCAL_JS=$(ls dist/assets/ | grep '^index-.*\.js$' | head -1)

if [ "$LIVE_JS" = "$LOCAL_JS" ]; then
  echo "      Live: $LIVE_JS ✓ Matches build"
else
  echo "      WARNING: Live ($LIVE_JS) does not match build ($LOCAL_JS)"
  echo "      The site may have a CDN cache — wait a minute and check again."
fi

echo ""
echo "============================================================"
echo " Deploy complete!"
echo "============================================================"
echo ""
