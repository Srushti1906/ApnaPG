# Deployment & Production Checklist for Apna PG

## Pre-Deployment Verification ✅

### Firebase Configuration
- [ ] Firebase project created at https://console.firebase.google.com
- [ ] Project name: `apna-pg`
- [ ] Email/Password authentication enabled
- [ ] Firestore Database created (asia-south1 region preferred)
- [ ] Web app registered and API keys copied
- [ ] `.env.local` file created in `client/` with all 6 credentials

### Code Setup
- [ ] All dependencies installed (`npm install`)
- [ ] No console errors on `npm run dev`
- [ ] No IDE warnings or errors
- [ ] Auth context properly initialized
- [ ] All pages load without 404s
- [ ] Protected routes working

### Firestore Ready
- [ ] Security rules deployed and published
- [ ] Composite indexes created (Firebase will prompt on first query)
- [ ] Database in production mode
- [ ] No pending indexes

### Testing
- [ ] ✅ Signup creates new user
- [ ] ✅ User profile saved in Firestore
- [ ] ✅ Login works with correct credentials
- [ ] ✅ Login fails with wrong credentials
- [ ] ✅ Cannot login without signup
- [ ] ✅ Logout clears session
- [ ] ✅ Protected routes redirect to login
- [ ] ✅ Role-based redirection works
- [ ] ✅ Browse page shows PGs
- [ ] ✅ Real-time updates work
- [ ] ✅ Navbar shows/hides based on auth

### Edge Cases
- [ ] ✅ Refresh page - session persists
- [ ] ✅ Multiple browser tabs - auth syncs
- [ ] ✅ Slow network - loading states show
- [ ] ✅ Wrong Firebase credentials - error shown
- [ ] ✅ User deleted from Firestore - logged out

---

## Build & Test

```bash
# Build production bundle
npm run build

# Output in client/dist/

# Test with preview server
npm run preview
# Visit http://localhost:4173
```

### Build Verification
- [ ] `dist/` folder created
- [ ] HTML files exist
- [ ] JavaScript files bundled/minified
- [ ] CSS files included
- [ ] No console errors in preview
- [ ] App fully functional in preview

---

## Environment Variables

### Development (`.env.local`)
```
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=apna-pg-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=apna-pg-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=apna-pg-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
```

### Production (`.env.production.local`)
Use same credentials OR separate Firebase project for staging

---

## Deployment Options

### Option 1: Firebase Hosting (Recommended) ⭐

**Pros:** Fast, integrated with Firebase, free HTTPS, CDN
**Setup:**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init hosting
# Select your project
# Answer prompts:
#   - Public directory: dist
#   - Single-page app: Yes
#   - Overwrite dist/index.html: No

# Build and deploy
npm run build
firebase deploy

# Your app at: https://apna-pg-xxxxx.web.app
```

**Post-Deploy:**
- [ ] Test login works
- [ ] Test signup works  
- [ ] Test real-time updates
- [ ] Check console for errors
- [ ] Monitor Firebase quota

### Option 2: Vercel (Quick & Easy)

**Pros:** Automatic deployments, preview links, fast
**Setup:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel

# Follow prompts (select project, configure)
# Your app at: https://apna-pg.vercel.app
```

**Configure:**
- Go to Vercel Dashboard → Project → Settings
- Environment Variables → Add `.env.local` values

### Option 3: Netlify

**Pros:** Automatic deployments from Git, form handling, edge functions
**Setup:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd client
netlify deploy --prod --dir=dist

# Your app at: https://apna-pg.netlify.app
```

**Or:** Connect GitHub repo → automatic deploys on push

### Option 4: AWS S3 + CloudFront

**Pros:** Cheap, scalable, enterprise-grade
**Setup:**

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://apna-pg-bucket/ --delete

# CloudFront handles HTTPS + CDN
```

---

## Post-Deployment Checklist

### Functionality
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Signup creates account
- [ ] Login works
- [ ] Browse page displays PGs
- [ ] PG details page loads
- [ ] Filtering works
- [ ] Logout works
- [ ] Protected routes work
- [ ] Mobile responsive

### Performance
- [ ] Page loads < 3 seconds
- [ ] No console errors
- [ ] No console warnings
- [ ] Images optimized
- [ ] No 404s for resources

### Security
- [ ] HTTPS enforced
- [ ] No sensitive data in frontend
- [ ] CORS properly configured
- [ ] Firebase rules published
- [ ] No hardcoded credentials

### Monitoring
- [ ] Set up Firebase Analytics (optional)
- [ ] Monitor error logs
- [ ] Check quota usage
- [ ] Set up billing alerts

---

## Domain Setup (Optional)

### Custom Domain on Firebase Hosting

```bash
firebase hosting:sites:create apna-pg
# Get Firebase-provided domain first:
# apna-pg-xxxxx.web.app

# Then connect custom domain:
# Firebase Console → Hosting → Connect custom domain
# Add DNS records as shown
# Wait 24 hours for propagation
```

### DNS Configuration (for yourdomain.com)

```
Type: CNAME
Name: @
Value: apna-pg-xxxxx.web.app

OR (if using root domain):

Type: A
Name: @
Value: [Firebase-provided IP, if available]
```

---

## Monitoring & Maintenance

### Firebase Quota Monitoring
```
Firebase Console → Project Settings → Quotas

Free tier limits:
- 50,000 authentication tokens
- 1GB Firestore storage
- 1,000 concurrent connections
```

### Error Tracking
```
Browser Console errors
→ Google Analytics (optional)
→ Sentry (for production)
→ Firebase Crashlytics (Firebase+ plan)
```

### Performance Monitoring
```
Firebase Console → Crashlytics → Performance
Monitor:
- Page load time
- Database query time
- Authentication time
```

---

## Scaling to Production

### Phase 1: Alpha (Current)
- ✅ Auth working
- ✅ Real-time data
- ✅ Security rules

### Phase 2: Beta
- Update PGDetails page
- Update MyBookings page
- Add Owner Dashboard
- Payment integration (Razorpay/Stripe)

### Phase 3: Production
- Load testing (Firebase auto-scales)
- Backup strategy
- Admin dashboard
- Analytics setup

---

## Rollback Plan

If issues occur:

```bash
# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:channels:deploy [CHANNEL_NAME]

# Or delete and redeploy
firebase hosting:delete
npm run build
firebase deploy
```

---

## Troubleshooting Deployment

### White screen on load
**Fix:** Check console → Verify .env.local values

### "Cannot find module firebase"
**Fix:** `npm install` on server

### Static files 404
**Fix:** Check `dist/` folder exists with all files

### Real-time not working
**Fix:** Check Firestore Rules are published

### Users can't login
**Fix:** Verify Email/Password auth enabled in Firebase

---

## Cost Estimation

### Firebase Free Tier (Adequate for Launch)
- **Authentication:** 50K users/month ✓
- **Firestore:** 1GB storage, 50K read/write daily ✓
- **Hosting:** 1GB/month bandwidth ✓
- **Cost:** $0/month

### Upgrade to Blaze (Pay-as-you-go)
- Triggers when you exceed free tier
- **Typical cost for 1000 active users:** $5-15/month
- Only pay for what you use

### Estimate Calculator
```
Firestore reads: 0.06 per 100K
Firestore writes: 0.18 per 100K
Auth: $0.005 per successful signup
Hosting: $0.15 per GB
```

---

## Success Criteria

✅ User can signup
✅ User can login
✅ PGs visible in real-time
✅ No console errors
✅ HTTPS working
✅ Mobile responsive
✅ Page loads <3 seconds
✅ No failed API calls
✅ Firestore rules secure

---

## Support Resources

- **Firebase Support:** https://firebase.google.com/support
- **Status Page:** https://status.firebase.google.com/
- **Community:** Stack Overflow tag `firebase`
- **Documentation:** https://firebase.google.com/docs

---

## Final Checklist Before Going Live

- [ ] All tests passing locally
- [ ] Build successful (`npm run build`)
- [ ] Preview works (`npm run preview`)
- [ ] .env.local correct and secure (.gitignore it!)
- [ ] Firestore rules published
- [ ] All pages tested on production URL
- [ ] Mobile tested on 2+ devices
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Database backup configured
- [ ] Analytics enabled (optional)
- [ ] Custom domain configured (if applicable)
- [ ] Team trained on admin procedures
- [ ] Error monitoring setup
- [ ] Monitoring alerts configured

**Status:** Ready to deploy! 🚀

See deployment option above to go live.
