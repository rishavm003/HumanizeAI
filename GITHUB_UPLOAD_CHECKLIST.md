# GitHub Upload Checklist for HumanizeAI

## ⚠️ CRITICAL: Files to VERIFY Before Upload

### 1. Check for Large Files (>100MB)
GitHub rejects files over 100MB. Check these common culprits:

```powershell
# Run this in PowerShell to find large files:
Get-ChildItem -Path "f:\Text Humanize\humanizeai" -Recurse -File | 
Where-Object { $_.Length -gt 50MB } | 
Select-Object FullName, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}
```

**Common large directories to check:**
- [ ] `backend/node_modules/` - Should be in .gitignore
- [ ] `frontend/node_modules/` - Should be in .gitignore
- [ ] `backend/dist/` or `frontend/dist/` - Build outputs
- [ ] Any `.mp4`, `.mov`, `.avi` video files
- [ ] Any `.zip`, `.tar.gz` archive files
- [ ] Any `.psd`, `.ai` design files

### 2. Verify .gitignore is Working

```bash
# Check what git will track (run in project root)
git init
git add -A --dry-run

# Should NOT see:
# - node_modules/
# - .env files
# - dist/ or build/
# - Any large binary files
```

### 3. Files That SHOULD NOT Be Uploaded

#### 🔴 NEVER Upload:
- [ ] `.env` (all variations)
- [ ] `backend/.env`
- [ ] `frontend/.env`
- [ ] Any file containing:
  - `gsk_` (Groq keys)
  - `sk_test_` or `sk_live_` (Stripe keys)
  - `eyJhbG` (JWT tokens)
  - `postgresql://` with passwords
  - `sb_publishable_` (Supabase keys)

#### 🟡 Large Directories (Check Size):
- [ ] `node_modules/` - Should be ~200-500MB per project
  - **If tracked by git**: Delete and recommit
  - **Fix**: Ensure in .gitignore
- [ ] `dist/` or `build/` - Usually 5-50MB
- [ ] `.git/` directory (already ignored)

### 4. Acceptable File Sizes

| File Type | Acceptable Size | Action if Larger |
|-----------|-----------------|------------------|
| Source code (.js, .jsx) | < 100KB | Normal |
| Images (.png, .jpg) | < 5MB | Compress or use CDN |
| Documentation (.md) | < 1MB | Normal |
| node_modules/ | NOT ALLOWED | Add to .gitignore |
| Videos | NOT ALLOWED | Use YouTube/Vimeo |
| Database dumps | NOT ALLOWED | Use cloud storage |

### 5. Quick Pre-Upload Verification

Run these commands in PowerShell:

```powershell
cd "F:\Text Humanize\humanizeai"

# Count total files
git init 2>$null
$files = git add -A -n 2>&1
Write-Host "Total files to upload: $($files.Count)"

# Check for node_modules
if ($files | Select-String "node_modules") {
    Write-Host "⚠️  WARNING: node_modules will be uploaded!" -ForegroundColor Red
}

# Check for .env files
if ($files | Select-String "\.env") {
    Write-Host "⚠️  WARNING: .env files will be uploaded!" -ForegroundColor Red
}
```

### 6. Repository Size Limits

GitHub has these limits:
- **Per-file limit**: 100MB (hard limit)
- **Recommended repo size**: < 1GB
- **Warning at**: > 1GB
- **Push blocked at**: > 2GB

**Current estimates for HumanizeAI:**
- Source code: ~500KB
- Documentation: ~100KB
- **Total (without node_modules)**: < 1MB ✅
- **With node_modules**: ~500MB ❌ (must exclude)

### 7. Clean Upload Steps

```bash
# 1. Initialize git
cd "F:\Text Humanize\humanizeai"
git init

# 2. Create proper .gitignore (already done)
# Verify these exist:
# - .gitignore
# - backend/.gitignore
# - frontend/.gitignore

# 3. Check what will be committed
git add -A --dry-run

# 4. If node_modules appears, fix it:
# Remove from tracking if accidentally added
git rm -r --cached backend/node_modules
git rm -r --cached frontend/node_modules

# 5. Add files
git add .

# 6. Check status
git status

# 7. Commit
git commit -m "Initial commit: HumanizeAI v1.0"

# 8. Add remote
git remote add origin https://github.com/YOUR_USERNAME/humanizeai.git

# 9. Push
git push -u origin main
```

### 8. What SHOULD Be Uploaded

✅ **Include these:**
- [ ] All source code (`src/` directories)
- [ ] Configuration files (not containing secrets)
- [ ] Documentation (README.md, TECHNICAL_DOCUMENTATION.md, SECURITY.md)
- [ ] `.gitignore` files
- [ ] `.env.example` files (templates only)
- [ ] SQL migration files
- [ ] Package.json files

### 9. Repository Structure After Upload

```
humanizeai/ (GitHub repo)
├── .gitignore ✅
├── README.md ✅
├── SECURITY.md ✅
├── TECHNICAL_DOCUMENTATION.md ✅
├── backend/
│   ├── .env.example ✅ (safe template)
│   ├── .gitignore ✅
│   ├── package.json ✅
│   └── src/ ✅ (all source code)
│       ├── adapters/
│       ├── db/migrations/
│       ├── jobs/
│       ├── lib/
│       ├── middleware/
│       ├── routes/
│       └── services/
└── frontend/
    ├── .env.example ✅ (safe template)
    ├── .gitignore ✅
    ├── package.json ✅
    └── src/ ✅ (all source code)
        ├── api/
        ├── components/
        ├── lib/
        ├── pages/
        └── store/

❌ NOT uploaded:
- node_modules/ (excluded by .gitignore)
- .env files (excluded by .gitignore)
- dist/ build/ (excluded by .gitignore)
```

### 10. Post-Upload Verification

After uploading to GitHub:

1. **Check repo size**:
   ```bash
   git count-objects -vH
   ```
   - Should show size-pack < 1MB

2. **Verify no secrets leaked**:
   - Go to GitHub repo → Security → Secret scanning
   - Or use: https://github.com/YOUR_USERNAME/humanizeai/security

3. **Check for node_modules**:
   - Browse files on GitHub
   - Ensure no `node_modules` folder appears

### 11. If Upload Fails

**Error: "file exceeds 100MB"**
```bash
# Find and remove large files
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(restpath)' | awk '$1 == "blob" && $3 > 100000000'

# Or use BFG Repo-Cleaner
java -jar bfg.jar --strip-blobs-bigger-than 100M
```

**Error: "remote rejected (pre-receive hook declined)"**
```bash
# Likely node_modules was already committed
# Remove from history
git filter-branch --force --index-filter 'git rm -rf --cached --ignore-unmatch backend/node_modules frontend/node_modules' --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

---

## ✅ Final Checklist

Before running `git push`:

- [ ] `.gitignore` files are in place
- [ ] No `.env` files will be committed
- [ ] No `node_modules/` will be committed
- [ ] No files > 100MB
- [ ] Total repo size < 100MB
- [ ] `README.md` is present
- [ ] `SECURITY.md` is present
- [ ] Repository is private (recommended until ready)

**Expected upload size: < 2MB** (source code only)

---

**Ready to upload! 🚀**
