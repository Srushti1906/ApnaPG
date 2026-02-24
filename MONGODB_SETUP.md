# MongoDB Atlas Setup Guide (FREE)

## Why MongoDB Atlas?
- **FREE forever** (M0 cluster)
- No installation required
- Cloud-hosted, always available
- Perfect for development and learning

## Step-by-Step Setup

### 1. Visit MongoDB Atlas
Go to: https://www.mongodb.com/cloud/atlas/register

### 2. Create a Free Account
- Sign up with email
- Verify your email
- Click "Build a Database"

### 3. Select Free Tier
- Choose **M0** (Free forever)
- Select your region (e.g., `Asia Pacific (Mumbai)` or closer to you)
- Click **Create**

### 4. Create a Database User
1. On the "Security Quickstart" page:
   - **Username**: `apna_pg_admin`
   - **Password**: `ApnaPG123456` (choose your own secure password)
2. Click **Create User**

### 5. Configure Network Access
1. Click **Add My Current IP Address**
   - This allows your computer to connect to MongoDB
2. Click **Allow Access from Anywhere** (for development only!) or add your IP

### 6. Get Connection String
1. Click **Databases** in the left menu
2. Find your cluster and click **Connect**
3. Choose **Drivers** > **Node.js** > **Version 5.0 or later**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://apna_pg_admin:ApnaPG123456@apna-pg-cluster.mongodb.net/apna-pg?retryWrites=true&w=majority
   ```

### 7. Replace Password in Connection String
In the connection string, replace `<password>` with your actual password:
```
mongodb+srv://apna_pg_admin:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/apna-pg?retryWrites=true&w=majority
```

### 8. Update Server .env File
Edit `server/.env`:
```dotenv
MONGODB_URI=mongodb+srv://apna_pg_admin:ApnaPG123456@YOUR_CLUSTER_URL.mongodb.net/apna-pg?retryWrites=true&w=majority
```

### 9. Test Connection
Run the server:
```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

## Troubleshooting

### Connection Refused?
- Check your IP is whitelisted in MongoDB Atlas > Network Access
- Verify password is correct in connection string
- Wait 1-2 minutes after creating user/network rules

### "Authentication failed"?
- Ensure username and password are correct
- Check for special characters (they need URL encoding)
- Verify user exists in MongoDB Atlas dashboard

### Still having issues?
- Check MongoDB Atlas cluster status (should be "Active")
- Verify MONGODB_URI format in .env
- Test from Network Access tab: Run a test connection

## That's it! 🎉
Your app is now connected to MongoDB Atlas and ready to go!

