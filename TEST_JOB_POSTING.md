# Job Posting Test Guide

## 🧪 **Testing the Job Posting System**

### **Step 1: Login as Recruiter**
1. Go to `http://localhost:8000/static/index.html`
2. Login with:
   - Username: `recruiter1`
   - Password: `DEMO_RECRUITER_PASSWORD`, or the one printed in the server log on first start with `SEED_DEMO_USERS=1`
3. You should be redirected to the recruiter dashboard

### **Step 2: Post a Job**
1. Go to `http://localhost:8000/static/recruiter/recruiter_jobs.html`
2. Fill out the job form:
   - **Job Title:** "Senior Software Engineer"
   - **Company:** "TechCorp"
   - **Location:** "San Francisco"
   - **Job Description:** "We are looking for a talented software engineer..."
   - **Salary Range:** "$80,000 - $120,000"
   - **Job Type:** "Full-time"
3. Click "🚀 Post Job"
4. You should see a success notification

### **Step 3: Verify Job Appears**
1. The job should appear in the "Posted Jobs" section
2. Click "🔄 Refresh Jobs" if needed
3. The job should show with all details including type badge

### **Step 4: Test as Candidate**
1. Open a new browser tab
2. Go to `http://localhost:8000/static/index.html`
3. Login with:
   - Username: `candidate1`
   - Password: `DEMO_CANDIDATE_PASSWORD`, or the one printed in the server log on first start with `SEED_DEMO_USERS=1`
4. Go to `http://localhost:8000/static/candidate/candidate_apply.html`
5. The job should appear in the "Available Jobs" list
6. Click on the job to select it
7. Upload a resume and apply

### **Step 5: Verify Application**
1. Go back to recruiter dashboard
2. Go to `http://localhost:8000/static/recruiter/recruiter_applications.html`
3. You should see the application from the candidate

## 🔧 **Debugging Tips**

### **If Job Posting Fails:**
1. Check browser console for errors
2. Click "🔧 Test API Connection" button
3. Verify you're logged in as a recruiter
4. Check server logs for any errors

### **If Jobs Don't Appear:**
1. Click "🔄 Refresh Jobs" button
2. Check browser console for API errors
3. Verify the server is running
4. Check authentication token

### **Common Issues:**
- **401 Unauthorized:** Need to login as recruiter
- **403 Forbidden:** Not a recruiter account
- **500 Server Error:** Check server logs
- **Network Error:** Check if server is running

## ✅ **Expected Behavior**

### **Recruiter Side:**
- ✅ Can post jobs with all fields
- ✅ Jobs appear in posted jobs list
- ✅ Can edit and delete jobs
- ✅ Success notifications appear

### **Candidate Side:**
- ✅ Can see all posted jobs
- ✅ Jobs show with type badges
- ✅ Can select and apply for jobs
- ✅ Applications are submitted successfully

### **Integration:**
- ✅ Jobs posted by recruiters appear to candidates
- ✅ Applications submitted by candidates appear to recruiters
- ✅ Real-time updates work
- ✅ Modern UI/UX throughout

The system should now work end-to-end! 🎉
