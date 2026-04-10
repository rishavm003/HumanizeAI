# Security Checklist for HumanizeAI

## 🔐 Critical Security Files (NEVER commit to git)

### Backend (`backend/.env`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Full database access
- [ ] `DATABASE_URL` - Direct PostgreSQL connection with password
- [ ] `GROQ_API_KEY` - LLM API access
- [ ] `STRIPE_SECRET_KEY` - Payment processing
- [ ] `STRIPE_WEBHOOK_SECRET` - Payment webhooks
- [ ] `COOKIE_SECRET` - Session signing
- [ ] `REDIS_TOKEN` - Cache authentication

### Frontend (`frontend/.env`)
- [ ] `VITE_SUPABASE_ANON_KEY` - Client-side auth (limited but still sensitive)
- [ ] Any API keys prefixed with `VITE_`

## ✅ GitIgnore Verification

All `.gitignore` files have been configured to exclude:
- All `.env` files (all variations)
- `node_modules/`
- Build outputs (`dist/`, `build/`)
- Log files
- Database files (`*.sqlite`, `dump.rdb`)
- SSL certificates

## 🚀 Pre-Commit Checklist

Before pushing to GitHub, verify:

1. **No .env files committed**
   ```bash
   git status
   # Ensure no .env files appear
   ```

2. **Only .env.example files are tracked**
   ```bash
   git ls-files | grep env
   # Should only show .env.example files
   ```

3. **No secrets in code**
   ```bash
   grep -r "gsk_" . --include="*.js" --include="*.jsx"
   grep -r "sk_test" . --include="*.js" --include="*.jsx"
   grep -r "eyJhbG" . --include="*.js" --include="*.jsx"
   ```

4. **Check for accidental uploads**
   ```bash
   find . -name "*.key" -o -name "*.pem" -o -name "*.p12"
   ```

## 🔄 If Secrets Were Committed

### Immediate Actions:

1. **Rotate all exposed keys immediately:**
   - Generate new Supabase service role key
   - Generate new Groq API key
   - Generate new Stripe keys
   - Update all `.env` files locally

2. **Remove from git history:**
   ```bash
   # Remove file from entire history
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch backend/.env' \
   --prune-empty --tag-name-filter cat -- --all
   
   # Force push (dangerous - coordinate with team)
   git push origin --force --all
   ```

3. **Use BFG Repo-Cleaner (easier alternative):**
   ```bash
   bfg --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

## 🛡️ Production Security Checklist

### Backend:
- [ ] HTTPS enforced
- [ ] CORS restricted to production domain only
- [ ] Rate limiting enabled
- [ ] Helmet security headers configured
- [ ] Database RLS policies active
- [ ] Credit operations use atomic PostgreSQL functions
- [ ] No debug logs in production
- [ ] Error messages don't leak stack traces

### Frontend:
- [ ] No console.log statements with sensitive data
- [ ] API calls use HTTPS
- [ ] XSS protection (React automatically escapes, but verify)
- [ ] Content Security Policy headers

### Database:
- [ ] RLS enabled on all tables
- [ ] Credit transactions use atomic operations
- [ ] No direct SQL from frontend
- [ ] Backups scheduled

### Infrastructure:
- [ ] Redis not exposed to internet (if used)
- [ ] Database firewall rules configured
- [ ] Environment variables in secure vault (not plain text)
- [ ] Webhook endpoints verify signatures

## 📋 Regular Security Audits

### Monthly:
- [ ] Review git history for accidental commits
- [ ] Check for new dependencies with vulnerabilities
- [ ] Rotate API keys (quarterly recommended)

### Quarterly:
- [ ] Penetration test on API endpoints
- [ ] Review RLS policies
- [ ] Audit credit transaction logs for anomalies

## 🚨 Incident Response

If you suspect a breach:

1. **Immediately:**
   - Revoke all API keys
   - Disable production webhooks
   - Enable maintenance mode

2. **Within 1 hour:**
   - Audit all credit transactions
   - Check for unauthorized access patterns
   - Review database logs

3. **Within 24 hours:**
   - Generate new keys
   - Deploy with rotated secrets
   - Notify affected users (if PII exposed)

## 📞 Security Contacts

- Supabase Security: security@supabase.com
- Stripe Security: security@stripe.com
- Groq Support: support@groq.com

---

**Last Updated:** April 9, 2026
**Next Review:** May 9, 2026
