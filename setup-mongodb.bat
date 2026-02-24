@echo off
REM Quick MongoDB Atlas Setup Script for Windows

echo.
echo ==========================================
echo   Apna PG - MongoDB Atlas Quick Setup
echo ==========================================
echo.

REM Show MongoDB Atlas URL
echo 1. Go to: https://www.mongodb.com/cloud/atlas/register
echo.
echo 2. Create FREE account and cluster (M0 tier)
echo.
echo 3. Create database user:
echo    - Username: apna_pg_admin
echo    - Password: ApnaPG123456 (or your preferred password)
echo.
echo 4. Allow network access from your IP
echo.
echo 5. Get connection string from Dashboard:
echo    - It will look like:
echo    - mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DB_NAME
echo.
echo 6. Edit server\.env and set MONGODB_URI to:
echo    - mongodb+srv://apna_pg_admin:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/apna-pg
echo.
echo 7. Run:
echo    - cd server
echo    - npm run dev
echo.
echo ==========================================
echo   Quick Testing with Browser:
echo ==========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo API:      http://localhost:5000/api/auth/register
echo.
echo ==========================================
pause
