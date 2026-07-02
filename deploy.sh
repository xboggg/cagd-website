#!/usr/bin/env bash
# =============================================================================
# CAGD Website Deploy Script  (SFTP over SSH — new host, NO FTP)
# Usage:
#   bash deploy.sh                   — auto timestamp commit message
#   bash deploy.sh "my message"      — custom commit message
#
# Flow: local → GitHub → build → new cPanel via SFTP (SSH key auth)
# Upload order: assets FIRST, index.html LAST (prevents mid-deploy race condition)
#
# Credentials & connection details live in git-ignored .env.deploy
# (copy .env.deploy.example → .env.deploy and fill it in). NEVER commit them.
# =============================================================================

set -e  # Exit immediately on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Load SFTP/SSH settings from git-ignored .env.deploy ──────────────────────
if [ ! -f "$SCRIPT_DIR/.env.deploy" ]; then
  echo ""
  echo " ERROR: .env.deploy not found."
  echo " Create it from the template:  cp .env.deploy.example .env.deploy"
  echo " then edit it with your SSH details. This file is git-ignored."
  echo ""
  exit 1
fi
# shellcheck disable=SC1091
source "$SCRIPT_DIR/.env.deploy"

: "${SSH_USER:?SSH_USER not set in .env.deploy}"
: "${SSH_HOST:?SSH_HOST not set in .env.deploy}"
: "${SSH_PORT:?SSH_PORT not set in .env.deploy}"
: "${SSH_KEY:?SSH_KEY not set in .env.deploy}"
: "${REMOTE_ROOT:?REMOTE_ROOT not set in .env.deploy}"   # e.g. public_html  (or public_html/cagd.gov.gh)

# Resolve key path (allow relative-to-script or absolute)
if [ ! -f "$SSH_KEY" ]; then
  if [ -f "$SCRIPT_DIR/$SSH_KEY" ]; then SSH_KEY="$SCRIPT_DIR/$SSH_KEY"; else
    echo " ERROR: SSH key not found at: $SSH_KEY"; exit 1
  fi
fi

SSH_OPTS=(-i "$SSH_KEY" -p "$SSH_PORT" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=20)

# Commit message: custom arg or auto timestamp
if [ -n "$1" ]; then
  COMMIT_MSG="$1"
else
  COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M')"
fi

echo ""
echo "============================================================"
echo " CAGD Deploy  →  $SSH_USER@$SSH_HOST:$SSH_PORT"
echo " Remote root: $REMOTE_ROOT"
echo " Commit: $COMMIT_MSG"
echo "============================================================"
echo ""
echo " ⚠  This will push code to GitHub AND go LIVE on cagd.gov.gh"
echo ""
read -p " Have you tested locally on http://localhost:5173? Deploy now? (y/n): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo ""
  echo " Deploy cancelled. Run 'npm run dev' to preview locally first."
  echo ""
  exit 0
fi

# ── Step 1: Git — stage, commit, push ────────────────────────────────────────
echo ""
echo "[ 1/5 ] Syncing to GitHub..."
git add -A
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
echo "[ 2/5 ] Building..."
npm run build
echo "        Build complete ✓"

# ── Helper: run an sftp batch over SSH ───────────────────────────────────────
# Reads sftp commands from stdin. -b - means "batch from stdin".
run_sftp() {
  sftp "${SSH_OPTS[@]}" -b - "$SSH_USER@$SSH_HOST"
}

# ── Step 3: Upload assets (JS + CSS) FIRST ───────────────────────────────────
echo ""
echo "[ 3/5 ] Uploading assets (JS + CSS first)..."
{
  echo "-mkdir $REMOTE_ROOT"
  echo "cd $REMOTE_ROOT"
  echo "-mkdir assets"
  echo "cd assets"
  # put every file in dist/assets/
  for f in dist/assets/*; do
    echo "put \"$f\""
  done
} | run_sftp
echo "        Assets uploaded ✓"

# ── Step 4: Upload the rest of dist/ (php, htaccess, images, etc.) then api/ ──
echo ""
echo "[ 4/5 ] Uploading site files + PHP endpoints..."
{
  echo "cd $REMOTE_ROOT"
  # everything at the top of dist/ EXCEPT index.html (uploaded last) and the assets dir (done)
  for f in dist/*; do
    base="$(basename "$f")"
    [ "$base" = "index.html" ] && continue
    [ "$base" = "assets" ] && continue
    if [ -d "$f" ]; then
      echo "-mkdir $base"
      echo "put -r \"$f\""
    else
      echo "put \"$f\" \"$base\""
    fi
  done
  # api/ folder (upload.php + .htaccess) — NOT in dist/, must be sent explicitly
  echo "-mkdir api"
  echo "cd api"
  echo "put \"api/upload.php\" \"upload.php\""
  echo "put \"api/.htaccess\" \".htaccess\""
} | run_sftp
echo "        Site files + api/ uploaded ✓"

# ── Step 5: Upload index.html LAST ───────────────────────────────────────────
echo ""
echo "[ 5/5 ] Uploading index.html (last)..."
{
  echo "cd $REMOTE_ROOT"
  echo "put \"dist/index.html\" \"index.html\""
} | run_sftp
echo "        index.html uploaded ✓"

# ── Verify deployment ─────────────────────────────────────────────────────────
echo ""
echo "[ ✓ ] Verifying live site..."
LIVE_JS=$(curl -sk "https://cagd.gov.gh/" --connect-timeout 15 | grep -o 'index-[^"]*\.js' | head -1)
LOCAL_JS=$(ls dist/assets/ | grep '^index-.*\.js$' | head -1)
if [ "$LIVE_JS" = "$LOCAL_JS" ]; then
  echo "      Live: $LIVE_JS ✓ Matches build"
else
  echo "      NOTE: Live ($LIVE_JS) does not match build ($LOCAL_JS)."
  echo "      DNS may still point at the OLD host, or a CDN cache — recheck after DNS cutover."
fi

echo ""
echo "============================================================"
echo " Deploy complete!"
echo "============================================================"
echo ""
