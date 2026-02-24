# 🚀 Deployment Guide for Apna PG

This guide covers deploying Apna PG to production using popular platforms.

---

## 📋 Prerequisites

- GitHub account
- Netlify account (for frontend)
- Render account (for backend)
- MongoDB Atlas account (for database)

---

## 🗄️ Step 1: Database Setup (MongoDB Atlas)

### Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create an organization and project

### Create Cluster
1. Click "Create a Deployment"
2. Select "Shared" (Free tier)
3. Choose region closest to your users
4. Create cluster (takes 1-3 minutes)

### Configure Security
1. Go to "Security" > "Database Access"
2. Add new database user:
   - Username: `apna_pg_user`
   - Password: Generate strong password (save it!)
3. Go to "Network Access"
4. Add IP Address: `0.0.0.0/0` (allow all for now)

### Get Connection String
1. Click "Connect" on cluster
2. Select "Connect to your application"
3. Copy connection string:
   ```
   mongodb+srv://apna_pg_user:<password>@cluster.mongodb.net/apna-pg?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your database password

---

## 🖥️ Step 2: Backend Deployment (Render)

### Push to GitHub
1. Initialize git in server folder:
   ```bash
   cd server
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Push to GitHub (create repo first)

### Deploy on Render
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Create new "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `apna-pg-api`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Branch**: main

### Add Environment Variables
In Render dashboard, go to "Environment":
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://apna_pg_user:<password>@cluster.mongodb.net/apna-pg?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRE=7d
```

### Deploy
- Click "Deploy"
- Wait for build to complete
- Your backend URL: `https://apna-pg-api.onrender.com`

---

## 🎨 Step 3: Frontend Deployment (Netlify)

### Build Frontend
```bash
cd client
npm run build
```

### Push to GitHub
1. Initialize git in client folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Push to GitHub

### Deploy on Netlify
1. Go to [Netlify](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" > "Import an existing project"
4. Connect your GitHub repo
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Add Environment Variables
In Netlify, go to "Site settings" > "Build & deploy" > "Environment":
```
VITE_API_URL=https://apna-pg-api.onrender.com/api
```

### Deploy
- Click "Deploy"
- Your frontend URL: `https://apna-pg.netlify.app`

---

## ✅ Verify Deployment

### Test Backend
```bash
curl https://apna-pg-api.onrender.com/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-03-01T10:00:00.000Z"
}
```

### Test Frontend
Visit: `https://apna-pg.netlify.app`
- Check if pages load
- Test login (use test account from README)
- Check API communication

---

## 🔒 Production Checklist

### Backend Security
- [ ] Change `JWT_SECRET` to a strong random key
- [ ] Verify MongoDB IP whitelist (use specific IPs if possible)
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set `NODE_ENV=production`
- [ ] Add CORS allowed origins:
  ```javascript
  app.use(cors({
    origin: 'https://apna-pg.netlify.app',
    credentials: true
  }));
  ```

### Frontend Configuration
- [ ] Update `VITE_API_URL` to production backend
- [ ] Enable analytics (optional)
- [ ] Test all user flows
- [ ] Check mobile responsiveness
- [ ] Verify error handling

### Database Security
- [ ] Use strong database password
- [ ] Set specific IP whitelist instead of 0.0.0.0/0
- [ ] Enable encryption at rest
- [ ] Regular backups enabled
- [ ] Monitor queries for performance

---

## 🔄 Continuous Deployment

Both Render and Netlify support automatic deployment on git push:

1. **Backend**: Any push to `main` branch auto-deploys
2. **Frontend**: Any push to `main` branch auto-builds and deploys

### Manual Redeployment
- **Render**: Click "Manual Deploy" > "Deploy latest commit"
- **Netlify**: Push to GitHub or use "Trigger deploy" button

---

## 📊 Monitoring

### Render Monitoring
- Go to "Logs" tab to see server logs
- Check "Metrics" for CPU/Memory usage
- Set up error notifications

### Netlify Monitoring
- Check "Deploys" tab for build logs
- Use "Analytics" for site stats
- Enable error tracking

### MongoDB Atlas Monitoring
- Go to "Monitoring" tab
- Check collection statistics
- Monitor query performance

---

## 🚨 Troubleshooting Deployment

### Backend won't start
1. Check `Build logs` in Render
2. Verify all environment variables set
3. Check package.json has `start` script
4. Ensure MongoDB URI is correct

### Frontend build fails
1. Check `Build logs` in Netlify
2. Verify `npm run build` works locally
3. Check `.env` file in client folder
4. Clear npm cache: `npm cache clean --force`

### API calls fail
1. Check CORS settings in backend
2. Verify `VITE_API_URL` in frontend
3. Test API endpoint directly: `curl <API_URL>/api/health`
4. Check browser console for errors

### Database connection error
1. Verify MongoDB URI format
2. Check IP whitelist in MongoDB Atlas
3. Test URI locally
4. Check username/password in connection string

---

## 💡 Cost Optimization

### Free Tier Limits
- **Render**: 750 hours/month (1 app = ~24/7 free)
- **Netlify**: 300 build minutes/month
- **MongoDB Atlas**: 5GB storage free

### Upgrade When Needed
- **Paid Render**: $7-25/month for guaranteed uptime
- **Paid Netlify**: $19-99/month for more builds
- **Paid MongoDB**: $0.57/GB/month

---

## 🔐 SSL/HTTPS

- **Render**: Automatic SSL certificate
- **Netlify**: Automatic SSL certificate + WWW redirect
- **MongoDB Atlas**: Encrypted connections by default

---

## 📈 Scaling Strategy

### When Traffic Increases
1. **Backend**: Upgrade Render plan to dedicated instance
2. **Frontend**: Switch to Netlify Pro for better performance
3. **Database**: Upgrade MongoDB cluster, add caching layer (Redis)
4. **CDN**: Enable Netlify CDN or use Cloudflare

### Performance Optimization
1. Enable gzip compression
2. Add Redis caching for frequently accessed data
3. Optimize images
4. Lazy load React components
5. Database query optimization with proper indexes

---

## 📝 Maintenance

### Regular Tasks
- Monitor error logs weekly
- Review database size monthly
- Update dependencies quarterly
- Backup database regularly
- Test deployment process
- Review user feedback

### Rollback Plan
If deployment breaks:
1. **Render**: Click previous deployment
2. **Netlify**: Choose previous deploy to publish
3. Verify production is stable

---

## 🎯 Production URLs

After deployment, use these URLs:
- **Frontend**: `https://apna-pg.netlify.app`
- **Backend**: `https://apna-pg-api.onrender.com/api`
- **Database**: MongoDB Atlas (internal connection)

Update frontend `.env` and client-side API calls accordingly.

---

## 📞 Support

For deployment issues:
- Render docs: https://render.com/docs
- Netlify docs: https://docs.netlify.com
- MongoDB docs: https://docs.mongodb.com
- Express docs: https://expressjs.com

---

**Your Apna PG application is now live! 🎉**
