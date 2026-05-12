---
description: Commit and push all changes to the remote git repository
---

# Git Push Workflow

After making code changes, follow these steps to commit and push to the remote repository.

// turbo-all

1. Check current git status:
```
git status
```

2. Stage all changes:
```
git add -A
```

3. Commit with a descriptive message based on the changes made. Use conventional commits format (feat:, fix:, refactor:, etc.):
```
git commit -m "<type>: <descriptive message in Portuguese>"
```

4. Push to the remote repository:
```
git push origin main
```

5. Confirm the push was successful by checking the status:
```
git status
```
