# Job Posting Troubleshooting Guide

## 🔍 **Issue: GET http://localhost:3000/api/jobs net::ERR_CONNECTION_REFUSED**

### **Root Cause:**
The error shows the browser is trying to connect to `localhost:3000` instead of `localhost:8000`. This suggests either:
1. Browser cache issue
2. Not logged in as recruiter
3. Old cached JavaScript file

### **Solutions:**

#### **1. Clear Browser Cache**
1. Open browser developer tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or press Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

#### **2. Verify Login Status**
1. Go to `http://localhost:8000/static/index.html`
2. Login with:
   - Username: `recruiter1`
   - Password: `DEMO_RECRUITER_PASSWORD`, or the one printed in the server log on first start with `SEED_DEMO_USERS=1`
3. Make sure you're redirected to recruiter dashboard

#### **3. Check Browser Console**
1. Open `http://localhost:8000/static/recruiter/recruiter_jobs.html`
2. Open browser console (F12)
3. Look for these messages:
   - ✅ "Recruiter Jobs JS loaded - API URL will be: http://localhost:8000/api/jobs"
   - ✅ "Making request to: http://localhost:8000/api/jobs"
   - ❌ Any errors about localhost:3000

#### **4. Test API Connection**
1. Click the "🔧 Test API Connection" button
2. Should show: "✅ API connection successful! Found X jobs."

#### **5. Manual API Test**
Open browser console and run:
```javascript
fetch('http://localhost:8000/api/jobs', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }
}).then(r => r.json()).then(console.log)
```

### **Expected Behavior:**

#### **If Working Correctly:**
- ✅ Console shows "Making request to: http://localhost:8000/api/jobs"
- ✅ API test button shows success
- ✅ Jobs load without errors
- ✅ Can post new jobs

#### **If Still Having Issues:**
- ❌ Console shows localhost:3000 anywhere
- ❌ "ERR_CONNECTION_REFUSED" errors
- ❌ Authentication errors

### **Quick Fix Steps:**

1. **Hard Refresh:** Ctrl+Shift+R
2. **Clear Cache:** Browser settings → Clear browsing data
3. **Re-login:** Logout and login again as recruiter
4. **Check URL:** Make sure you're on `localhost:8000`
5. **Test API:** Use the test button

### **Debug Information:**

The updated code includes:
- ✅ Cache-busting parameter: `recruiter_jobs.js?v=2.0`
- ✅ Debug logs showing exact API URL
- ✅ Better error handling
- ✅ Authentication checks

### **Server Status:**
- ✅ Server running on port 8000
- ✅ Health check: `{"status":"healthy","database":"connected"}`
- ✅ API endpoints available

If you're still seeing the localhost:3000 error, it's definitely a browser cache issue. Try a hard refresh or clear the browser cache completely.
