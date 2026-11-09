# Job Posting and Application System Test Guide

## Overview
This guide will help you test the complete job posting and application system, ensuring that jobs posted by recruiters appear for candidates and applications submitted by candidates appear for recruiters.

## Prerequisites
- Server running on `http://localhost:8000`
- Browser with developer tools open (F12)

## Test Steps

### 1. Login as Recruiter
1. Go to `http://localhost:8000/static/index.html`
2. Login with:
   - Username: `recruiter1`
   - Password: `DEMO_RECRUITER_PASSWORD`, or the one printed in the server log on first start with `SEED_DEMO_USERS=1`
3. Verify you're redirected to the recruiter dashboard

### 2. Post a Job
1. Navigate to `http://localhost:8000/static/recruiter/recruiter_jobs.html`
2. Fill in the job details:
   - Job Title: `Software Engineer`
   - Company: `Tech Corp`
   - Location: `New York`
   - Description: `We are looking for a skilled software engineer...`
   - Salary: `$80,000 - $120,000`
   - Job Type: `Full-time`
3. Click "🚀 Post Job"
4. Verify the job appears in the "Posted Jobs" section

### 3. Login as Candidate
1. Open a new incognito/private browser window
2. Go to `http://localhost:8000/static/index.html`
3. Login with:
   - Username: `candidate1`
   - Password: `DEMO_CANDIDATE_PASSWORD`, or the one printed in the server log on first start with `SEED_DEMO_USERS=1`
4. Verify you're redirected to the candidate dashboard

### 4. Apply for the Job
1. Navigate to `http://localhost:8000/static/candidate/candidate_apply.html`
2. Verify the job you posted appears in the job list
3. Click on the job to select it
4. Upload a resume file (PDF, DOC, or DOCX)
5. Click "Submit Application"
6. Verify you get a success message

### 5. Check Applications as Recruiter
1. Go back to the recruiter browser window
2. Navigate to `http://localhost:8000/static/recruiter/recruiter_applications.html`
3. Verify the application appears with:
   - Candidate name: `candidate1`
   - Job title: `Software Engineer`
   - Status: `Pending`
   - Timestamp of when it was submitted
   - Resume file name
4. Test the "📥 Download Resume" button
5. Test the "✏️ Update" button to change status

## Expected Results

### Job Posting
- ✅ Jobs posted by recruiters appear in candidate job list
- ✅ Job details (title, company, location, salary, type) are displayed correctly
- ✅ Jobs can be selected and applied for

### Application Submission
- ✅ Applications submitted by candidates appear in recruiter applications
- ✅ Application details include candidate name, job title, timestamp
- ✅ Resume files can be downloaded by recruiters
- ✅ Application status can be updated by recruiters

### UI/UX Features
- ✅ Modern glassmorphism design throughout
- ✅ Responsive design works on different screen sizes
- ✅ Loading states and error handling
- ✅ Success/error notifications
- ✅ Smooth animations and transitions

## Troubleshooting

### If jobs don't appear for candidates:
1. Check browser console for errors
2. Verify server is running on port 8000
3. Check if you're logged in as the correct user type
4. Try refreshing the page (Ctrl+F5)

### If applications don't appear for recruiters:
1. Check browser console for errors
2. Verify the application was submitted successfully
3. Check if you're logged in as a recruiter
4. Try refreshing the applications page

### If resume download doesn't work:
1. Check if the resume file exists in the uploads directory
2. Verify the file path is correct
3. Check browser console for download errors

## API Endpoints Used
- `POST /api/jobs` - Post new job (recruiter)
- `GET /api/jobs` - Get all jobs (candidates)
- `POST /api/applications` - Submit application (candidate)
- `GET /api/applications` - Get applications (recruiter)
- `PUT /api/applications/{id}` - Update application (recruiter)
- `GET /download/{file_path}` - Download resume files

## Database Collections
- `jobs` - Stores posted jobs
- `applications` - Stores job applications
- `users` - Stores user accounts
- `activities` - Stores system activities

This test ensures the complete flow from job posting to application review works correctly.
