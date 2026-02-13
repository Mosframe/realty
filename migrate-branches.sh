#!/bin/bash

# Script to complete the branch migration task
# This script requires proper GitHub credentials to execute

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

echo "=========================================="
echo "Branch Migration Script"
echo "=========================================="
echo ""

# Step 1: Push the main branch deletion
echo "Step 1: Pushing deletion of files from main branch..."
git checkout main
git push origin main

if [ $? -eq 0 ]; then
    echo "✓ Successfully pushed main branch changes"
else
    echo "✗ Failed to push main branch changes"
    echo "  Please ensure you have push access to the main branch"
    exit 1
fi

echo ""
echo "Step 2: Change default branch to naver-realty"
echo "This requires GitHub CLI (gh) to be installed and authenticated."
echo ""

# Check if gh is installed
if command -v gh &> /dev/null; then
    echo "GitHub CLI found. Attempting to change default branch..."
    gh repo edit Mosframe/realty --default-branch naver-realty
    
    if [ $? -eq 0 ]; then
        echo "✓ Successfully changed default branch to naver-realty"
    else
        echo "✗ Failed to change default branch"
        echo "  You may need to change it manually in repository settings:"
        echo "  https://github.com/Mosframe/realty/settings/branches"
    fi
else
    echo "GitHub CLI (gh) not found."
    echo "Please change the default branch manually:"
    echo "  1. Go to https://github.com/Mosframe/realty/settings/branches"
    echo "  2. Under 'Default branch', click the switch icon"
    echo "  3. Select 'naver-realty' from the dropdown"
    echo "  4. Click 'Update' and confirm"
fi

echo ""
echo "=========================================="
echo "Migration Complete!"
echo "=========================================="
echo ""
echo "Verification:"
echo "- Main branch should be empty (no files)"
echo "- Default branch should be 'naver-realty'"
echo ""
