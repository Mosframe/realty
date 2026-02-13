# Branch Migration Instructions

## Task Summary
이 작업은 main 브런치의 모든 파일을 삭제하고 naver-realty 브런치를 기본 브런치로 설정하는 것입니다.

(This task is to delete all files from the main branch and set naver-realty as the default branch.)

## Current State
- **main branch**: Contains LICENSE and README.md files
- **naver-realty branch**: Contains the full application code (13 files)

## Steps to Complete This Task

### Step 1: Delete All Files from Main Branch
Since I cannot directly push to the main branch using automated tools, this needs to be done manually:

```bash
# Checkout main branch
git checkout main

# Remove all files
git rm LICENSE README.md

# Commit the changes
git commit -m "Remove all files from main branch"

# Push to remote
git push origin main
```

**Note**: The commit has been created locally (commit hash: a4e3bef), but needs to be pushed with proper credentials.

### Step 2: Change Default Branch to naver-realty
This can only be done through GitHub's web interface:

1. Go to: https://github.com/Mosframe/realty/settings/branches
2. Under "Default branch", you'll see the current default branch
3. Click the switch/pencil icon next to the default branch name
4. Select "naver-realty" from the dropdown
5. Click "Update" 
6. Confirm the change

## Alternative: Using GitHub CLI
If you have GitHub CLI (gh) installed and authenticated:

```bash
# Change default branch
gh repo edit Mosframe/realty --default-branch naver-realty
```

## Verification
After completing both steps:
1. Main branch should be empty (no files)
2. Default branch should show "naver-realty" on the repository home page
3. New clones will automatically use naver-realty as the default branch

## Why This Approach?
The automated system has the following limitations:
- Cannot push directly to protected branches (like main)
- Cannot change repository settings (like default branch)
- Can only work within the context of pull request branches

Therefore, manual intervention is required for these repository-level changes.
