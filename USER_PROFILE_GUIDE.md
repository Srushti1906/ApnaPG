# 👤 User Profiles & Owner Dashboard - User Guide

Your ApnaPG application now has **enhanced authentication features** with separate login options for users and owners!

---

## 🆕 What's New

### 1. **Profile Dropdown in Navbar**
After logging in, you'll see your profile icon (with your initials) in the top-right corner of the navbar.

#### Profile Icon Features:
- **Click the icon** to open your profile dropdown
- Shows your **Full Name**, **Email**, **Phone**, **Gender**, and **Role** (User/Owner)
- Quick links to:
  - ⚙️ **Settings** - Manage your profile
  - 🚪 **Logout** - Sign out of your account

---

## 🔐 How to Login (Updated)

### New Login Page with Role Selection

#### Step 1: Go to Login Page
Click **🔑 Login** in the navbar

#### Step 2: Choose Your Role
You'll see two options:
- **👤 Tenant/User** - If you're looking for a PG to rent
- **🏢 Owner/Manager** - If you manage a PG

#### Step 3: Enter Credentials
- Email
- Password

#### Step 4: Click Login
The button changes based on your role: "Login as Tenant" or "Login as owner"

---

## 📊 Owner Dashboard

### Access the Dashboard
After logging in as an **Owner**, click **📊 Dashboard** in the navbar

### Dashboard Features

#### 📈 Overview Tab (Default)
Shows key statistics:
- **Total PGs** - Number of properties you own
- **Verified** - How many are verified by ApnaPG
- **Total Rooms** - All rooms across all your PGs
- **Avg Rating** - Customer rating average

Your profile information:
- Email, Phone, Role, Member Since

#### 🏢 My PGs Tab
Lists all your properties with:
- ✓ Verification status (Verified or Pending)
- 📍 Location (Street, City)
- 💰 Price range
- 👥 Gender policy
- 🛏️ Number of rooms
- ⭐ Customer rating

**Actions:**
- ✏️ **Edit** - Modify PG details
- 📊 **View Details** - See more information

#### 📅 Bookings Tab
(Coming soon) View all bookings from customers for your PGs

#### ⭐ Reviews Tab
(Coming soon) See customer reviews and ratings

---

## 👤 User Profile & Settings

### After Login as Regular User

In the **Profile Dropdown:**
1. Click your profile icon in navbar
2. View your information
3. Click **⚙️ Settings** to manage your profile

### What You Can Do:
- ✅ Track your bookings
- ✅ View bookings in "My Bookings" page
- ✅ Rate and review PGs
- ✅ Manage your profile information

---

## 🎯 Step-by-Step Examples

### Example 1: Login as Tenant/User

1. Click **🔑 Login**
2. Click **👤 Tenant/User** button
3. Enter email: `user@example.com`
4. Enter password: `yourpassword`
5. Click **Login as Tenant**
6. You're redirected to home page
7. In navbar, click your profile icon to see your info
8. Click **My Bookings** to see your reservations

### Example 2: Login as Owner

1. Click **🔑 Login**
2. Click **🏢 Owner/Manager** button
3. Enter email: `owner@example.com`
4. Enter password: `ownerspassword`
5. Click **Login as Owner**
6. In navbar, see your profile icon
7. Click **📊 Dashboard** to manage your PGs
8. View your properties, bookings, and reviews

### Example 3: View Your Profile

(Any role)
1. Login to your account
2. Look for your **profile icon** (circle with initials) in top-right navbar
3. Click it to open the dropdown
4. See your full details:
   - Your name
   - Your email
   - Your phone
   - Your gender
   - Your role (User or Owner)
5. Click **⚙️ Settings** to edit profile
6. Click **🚪 Logout** to sign out

---

## 🔒 Security Notes

- ✅ **Passwords** are encrypted and never shown
- ✅ **Tokens** are stored securely in localStorage
- ✅ **Logout** removes all session data
- ✅ **Protected routes** require authentication

---

## 📱 Profile Icon Features

### When Logged In:
- **Circle with initials** (e.g., "JD" for John Doe)
- **Blue background**
- **Clickable** to open profile menu

### Profile Dropdown Shows:
```
┌─────────────────────────────┐
│ [Icon] John Doe             │
│        Owner                │
├─────────────────────────────┤
│ Email: john@example.com     │
│ Phone: 9876543210          │
│ Gender: Male               │
├─────────────────────────────┤
│ ⚙️ Settings                 │
│ 🚪 Logout                  │
└─────────────────────────────┘
```

---

## 🆚 Difference: User vs Owner Login

| Feature | User | Owner |
|---------|------|-------|
| Browse PGs | ✅ Yes | ✅ Yes |
| Search & Filter | ✅ Yes | ✅ Yes |
| Book Rooms | ✅ Yes | ❌ No |
| My Bookings | ✅ Yes | ❌ No |
| Rate & Review | ✅ Yes | ❌ No |
| View Dashboard | ❌ No | ✅ Yes |
| Manage PGs | ❌ No | ✅ Yes |
| View Customer Bookings | ❌ No | ✅ Yes (owner's) |

---

## 🆘 Troubleshooting

### Issue: "Profile icon not appearing"
**Solution:**
- Make sure you're logged in
- Refresh the page (Ctrl+R)
- Check browser console (F12) for errors

### Issue: "Can't see dashboard"
**Solution:**
- Make sure you're logged in as **Owner** (not User)
- The Dashboard button only appears for owners
- If you see "My Bookings" instead, you're logged as User

### Issue: "Logout not working"
**Solution:**
- Click logout and wait 2 seconds
- Clear browser cache if needed (Ctrl+Shift+Delete)
- Try again

### Issue: "Can't switch between User and Owner"
**Solution:**
- You can only be logged in as one role at a time
- To switch roles:
  1. Click profile icon
  2. Click **🚪 Logout**
  3. Click **🔑 Login** again
  4. Choose different role
  5. Login with that role's credentials

---

## 🎓 Tips & Tricks

### Tip 1: Profile Information
- Your profile icon shows your **first two initials**
- Hover over it to see full name

### Tip 2: Quick Logout
- Click profile icon → Click **🚪 Logout**
- Fastest way to sign out

### Tip 3: Check Your Role
- Look at the dropdown - it shows your **role** (User or Owner)
- Use this to confirm which account you're on

### Tip 4: Settings
- Click **⚙️ Settings** from profile dropdown
- Update your contact information
- Change password
- Manage preferences

---

## 🚀 Next Steps

1. **Try logging in** with both User and Owner roles
2. **Explore the Dashboard** as an Owner
3. **Browse PGs** as a User
4. **Check your profile** information

---

**Happy using ApnaPG! 🏠**

Need more help? Contact support or check other guides.
