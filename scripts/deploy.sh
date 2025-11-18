#!/usr/bin/env bash
set -euo pipefail

# Simple deploy helper
# Stages all changes, commits with provided message or timestamp, pushes to current branch,
# and triggers a GitHub Pages rebuild via `gh` if available.
# Usage: ./scripts/deploy.sh "My commit message"

MSG=${1:-"Site update: $(date -u +%Y-%m-%dT%H:%M:%SZ)"}

echo "Staging all changes..."
git add -A

if git diff --cached --quiet; then
  echo "No changes to commit. Still attempting to push and trigger Pages rebuild."
else
  echo "Committing: $MSG"
  git commit -m "$MSG"
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Pushing to origin/$BRANCH..."
git push origin "$BRANCH"

# Attempt to trigger a Pages build via gh (optional)
if command -v gh >/dev/null 2>&1; then
  # derive owner/repo from origin
  ORIG_URL=$(git remote get-url origin)
  # support HTTPS and SSH remotes
  if [[ $ORIG_URL =~ github.com[:/](.+)/(.+)(\.git)?$ ]]; then
    OWNER=${BASH_REMATCH[1]}
    REPO=${BASH_REMATCH[2]}
    echo "Triggering Pages rebuild for $OWNER/$REPO via gh..."
    gh api -X POST "/repos/$OWNER/$REPO/pages/builds" || true
  else
    echo "Could not parse origin URL to trigger Pages build: $ORIG_URL"
  fi
else
  echo "gh CLI not found; rely on GitHub Pages auto-build after push."
fi

echo "Done."
