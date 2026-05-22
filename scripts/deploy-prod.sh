#!/usr/bin/env bash
set -euo pipefail

# deploy-prod.sh
# Build, deploy to production, and update bayes-second-brain.vercel.app alias.
#
# Usage:
#   ./scripts/deploy-prod.sh
#   pnpm deploy:prod

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

ALIAS_DOMAIN="bayes-second-brain.vercel.app"

cd "$ROOT"

# Step 1: Build
echo "→ Building docs site..."
pnpm docs:build

# Step 2: Deploy to production and capture the deployment URL
echo "→ Deploying to production..."
DEPLOY_OUTPUT=$(pnpm vercel --prod 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract the production deployment URL
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://second-brain-[a-zA-Z0-9]+-bayes-wang-s-projects\.vercel\.app' | head -1)

if [ -z "$DEPLOY_URL" ]; then
  echo "⚠️  Could not extract deployment URL. Skipping alias update."
  exit 0
fi

echo "→ Updating alias $ALIAS_DOMAIN → $DEPLOY_URL"
pnpm vercel alias set "$DEPLOY_URL" "$ALIAS_DOMAIN"

echo "✅ Deployed and alias updated."
