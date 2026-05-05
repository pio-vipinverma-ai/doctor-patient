# Worktree Management Guide

## Overview

This guide provides procedures for managing git worktrees for the Patient Management Application project. Worktrees enable isolated, branch-specific work without affecting the main branch or other ongoing development.

---

## Quick Reference

### Create a Worktree
```bash
# For a new feature branch
git worktree add ../doc-patient-<feature> -b feature/<feature-name>

# For an existing branch
git worktree add ../doc-patient-<feature> feature/<feature-name>
```

### List Active Worktrees
```bash
git worktree list
```

### Remove a Completed Worktree
```bash
git worktree remove ../doc-patient-<feature>
```

---

## Worktree Workflow

### 1. Creating a Worktree for Feature Development

**Scenario:** Implementing a feature from the BRD

```bash
# Step 1: Create worktree
git worktree add ../doc-patient-appointments -b feature/appointment-scheduling

# Step 2: Navigate to worktree
cd ../doc-patient-appointments

# Step 3: Install/update dependencies
npm install --workspace backend --workspace frontend

# Step 4: Begin development
# ... make changes ...

# Step 5: Commit and push
git add .
git commit -m "feat: implement appointment scheduling"
git push -u origin feature/appointment-scheduling
```

### 2. Creating a Worktree for BRD Analysis & Planning

**Scenario:** Analyzing requirements and creating implementation plans

```bash
# Step 1: Create worktree
git worktree add ../doc-patient-analysis -b analysis/phase-1-planning

# Step 2: Navigate and work
cd ../doc-patient-analysis

# Step 3: Create/update analysis documents
# - Update Implementation_Plan.md
# - Create PHASE_1_CHECKLIST.md
# - Add architecture decisions

# Step 4: Commit
git add Document/ workspace/
git commit -m "docs: phase 1 analysis and implementation plan"
git push -u origin analysis/phase-1-planning
```

### 3. Creating a Worktree for Bug Fixes

**Scenario:** Fixing an issue from main

```bash
# Step 1: Create worktree from main
git worktree add ../doc-patient-bugfix -b bugfix/authentication-issue

# Step 2: Fix the issue
# ... make changes ...

# Step 3: Test and commit
npm test --workspace backend
git add .
git commit -m "fix: resolve auth token validation issue"
git push -u origin bugfix/authentication-issue
```

---

## Worktree Status Tracking

### Current Active Worktrees

| Path | Branch | Purpose | Created | Status |
|------|--------|---------|---------|--------|
| `../doc-patient-main` | `main` | Primary development | N/A | Active |
| — | — | — | — | — |

**Last Updated:** [Date]

---

## Key Workflows

### Phase 1 Implementation Workflow

```
1. Create analysis worktree
   ├─ Review BRD (Doc_BRD.md)
   ├─ Validate requirements
   └─ Create implementation plan

2. Create backend worktree
   ├─ Set up database schema
   ├─ Implement models & controllers
   ├─ Create API routes
   └─ Write unit tests

3. Create frontend worktree
   ├─ Build UI components
   ├─ Integrate with API
   └─ Test workflows

4. Integration testing
   ├─ Cross-worktree validation
   └─ End-to-end testing

5. Merge & cleanup
   ├─ Review PRs
   ├─ Merge to main
   └─ Remove worktrees
```

---

## Best Practices

### ✅ DO

- **Create a new worktree for each feature or task**  
  Keeps work isolated and easy to track

- **Name worktrees meaningfully**  
  e.g., `doc-patient-appointments`, `doc-patient-auth`, `doc-patient-analysis`

- **Keep worktrees focused**  
  One feature/task per worktree; separate concerns

- **Commit frequently**  
  Smaller commits make history clearer and recovery easier

- **Document progress**  
  Update checklists and plans as you work

- **Test before cleanup**  
  Validate that all changes work before removing a worktree

### ❌ DON'T

- **Modify main from a worktree**  
  Always work in feature/analysis branches

- **Neglect to push changes**  
  Push commits regularly to avoid local-only loss

- **Leave stale worktrees**  
  Clean up completed worktrees promptly

- **Share worktrees between developers**  
  Each person maintains their own worktree instances

- **Skip validation steps**  
  Always verify functionality before merging

---

## Troubleshooting

### Worktree is Locked

**Problem:** `fatal: working tree '/path/to/worktree' is locked`

**Solution:**
```bash
# Check what's happening
git worktree list --porcelain

# If safe to unlock (verify no processes are using it)
git worktree unlock ../doc-patient-<feature>
```

### Worktree Lost Connection to Branch

**Problem:** Worktree shows detached HEAD

**Solution:**
```bash
cd ../doc-patient-<feature>
git checkout <branch-name>
```

### Can't Remove Worktree

**Problem:** `fatal: cannot remove '<path>'`

**Solution:**
```bash
# Remove with force flag
git worktree remove --force ../doc-patient-<feature>

# If still stuck, clean up manually
rm -rf ../doc-patient-<feature>
git worktree prune
```

---

## Integration with Implementation Plan

Each task in the implementation plan can have its own worktree:

- **Analysis & Planning** → `analysis/phase-1-planning`
- **Backend - Phase 1** → `feature/backend-auth`
- **Frontend - Phase 1** → `feature/frontend-auth`
- **Database Setup** → `feature/database-schema`
- **Bug Fixes** → `bugfix/<issue-name>`

See [Implementation_Plan.md](./workspace/Implementation_Plan.md) for detailed task breakdown.

---

## Related Documentation

- [Implementation Plan](./workspace/Implementation_Plan.md)
- [Phase 1 Checklist](./workspace/PHASE_1_CHECKLIST.md)
- [BRD](./Document/Doc_BRD.md)
- [Architecture](./workspace/docs/architecture.md)

---

## Quick Commands Reference

```bash
# List all worktrees with details
git worktree list --porcelain

# Prune dead worktree references
git worktree prune

# Lock a worktree (prevent accidental removal)
git worktree lock ../doc-patient-<feature>

# Unlock a worktree
git worktree unlock ../doc-patient-<feature>

# Repair worktrees after moving repository
git worktree repair
```

---

## Support

For issues or questions about worktree management, refer to [Git Worktree Documentation](https://git-scm.com/docs/git-worktree) or run `git worktree --help`.
