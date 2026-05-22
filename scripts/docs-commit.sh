#!/usr/bin/env bash
set -euo pipefail

# docs-commit.sh
# 封装完整文档提交流程：更新索引 → 暂存变更 → 提交
#
# 用法:
#   ./scripts/docs-commit.sh "commit message"
#   pnpm docs:commit "commit message"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMMIT_MSG="${1:-}"

if [ -z "$COMMIT_MSG" ]; then
  echo -e "${RED}Usage: docs-commit.sh \"commit message\"${NC}"
  exit 1
fi

# Step 1: Update docs index and timeline
echo -e "${YELLOW}→ Running docs:update-index...${NC}"
cd "$ROOT"
pnpm docs:update-index

# Step 2: Stage updated index/timeline and any untracked docs changes
echo -e "${YELLOW}→ Staging docs changes...${NC}"
git add -A docs/

# Step 3: Show what will be committed
echo -e "${YELLOW}→ Changes to commit:${NC}"
git diff --cached --stat

# Step 4: Commit
echo -e "${YELLOW}→ Committing...${NC}"
git commit -m "$COMMIT_MSG"

echo -e "${GREEN}✅ Done.${NC}"
