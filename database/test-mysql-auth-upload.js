/**
 * test-mysql-auth-upload.js
 * Comprehensive end-to-end test against the running Express + MySQL server
 */
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting End-to-End Tests with MySQL Backend...\n');

  // ── TEST 1: Public Endpoints ──
  console.log('1️⃣ Testing Public API Endpoints...');
  const newsRes = await fetch(`${BASE_URL}/api/public/news`);
  const newsData = await newsRes.json();
  console.log(`   Public news retrieved: ${newsData.news?.length} items. (Success: ${newsData.success})`);

  const journalsRes = await fetch(`${BASE_URL}/api/public/journals`);
  const journalsData = await journalsRes.json();
  console.log(`   Public journals retrieved: ${journalsData.journals?.length} issues. (Success: ${journalsData.success})`);

  // ── TEST 2: Admin Login ──
  console.log('\n2️⃣ Testing Admin Authentication...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ndu.edu.ng',
      password: 'Admin@123',
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginData.success) {
    throw new Error(`Admin login failed: ${adminLoginData.message}`);
  }
  console.log(`   Admin Login: SUCCESS! Logged in as "${adminLoginData.user.full_name}" (${adminLoginData.user.role})`);
  const adminToken = adminLoginData.token;

  // ── TEST 3: New User Registration ──
  const testEmail = `researcher_${Date.now()}@ndu.edu.ng`;
  console.log(`\n3️⃣ Testing User Registration with email "${testEmail}"...`);
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Prof. Amadi Okoro',
      email: testEmail,
      password: 'SecurePassword123!',
    }),
  });
  const regData = await regRes.json();
  if (!regData.success) {
    throw new Error(`Registration failed: ${regData.message}`);
  }
  console.log(`   Registration: SUCCESS! Created user ID: ${regData.user.id}`);
  const userToken = regData.token;

  // ── TEST 4: Login with the Newly Registered User ──
  console.log('\n4️⃣ Testing Login with Newly Created User...');
  const userLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'SecurePassword123!',
    }),
  });
  const userLoginData = await userLoginRes.json();
  if (!userLoginData.success) {
    throw new Error(`New user login failed: ${userLoginData.message}`);
  }
  console.log(`   User Login: SUCCESS! Logged in as "${userLoginData.user.full_name}"`);

  // ── TEST 5: Manuscript Submission with File Upload ──
  console.log('\n5️⃣ Testing Manuscript File Upload & Submission into MySQL...');
  // Create a temporary sample PDF/text document
  const tempDocPath = path.join(process.cwd(), 'temp_test_manuscript.pdf');
  fs.writeFileSync(tempDocPath, '%PDF-1.4 Mock manuscript content for testing automated pipeline.');

  const form = new FormData();
  form.append('title', 'Novel Deepwater Reservoir Characterization in Niger Delta Basin');
  form.append('area', 'Petroleum Engineering');
  form.append('abstract', 'An empirical analysis of porosity and permeability modeling in offshore Bayelsa deepwater wells.');
  form.append('author_name', 'Prof. Amadi Okoro');
  form.append('author_email', testEmail);
  form.append('author_institute', 'Niger Delta University');
  form.append('manuscriptFile', new Blob([fs.readFileSync(tempDocPath)], { type: 'application/pdf' }), 'deepwater_reservoir.pdf');

  const uploadRes = await fetch(`${BASE_URL}/api/submissions/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    body: form,
  });
  const uploadData = await uploadRes.json();
  fs.unlinkSync(tempDocPath); // cleanup

  if (!uploadData.success) {
    throw new Error(`Manuscript upload failed: ${uploadData.message}`);
  }
  console.log(`   Manuscript Upload: SUCCESS!`);
  console.log(`   Submission ID: ${uploadData.submission.id}`);
  console.log(`   Saved File: ${uploadData.submission.file_path}`);
  console.log(`   Status: ${uploadData.submission.status}`);

  // ── TEST 6: Admin Dashboard Stats from MySQL ──
  console.log('\n6️⃣ Testing Admin Stats Retrieval from MySQL...');
  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const statsData = await statsRes.json();
  console.log(`   Total Researchers: ${statsData.stats.totalResearchers}`);
  console.log(`   Total Submissions: ${statsData.stats.totalSubmissions}`);
  console.log(`   Published Articles: ${statsData.stats.publishedArticles}`);
  console.log(`   Active Links: ${statsData.stats.activeLinks}`);

  // ── TEST 7: Admin News Publishing with PDF Attachment ──
  console.log('\n7️⃣ Testing News Publishing with PDF in MySQL...');
  const newsPostRes = await fetch(`${BASE_URL}/api/admin/news`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: 'Call for Papers: 2026 Bayelsa Petroleum Summit',
      category: 'Seminars & Workshops',
      date: 'December 2026',
      venue: 'NDU Faculty of Engineering Auditorium',
      summary: 'Special volume dedicated to petroleum and offshore engineering advancements.',
      content: 'Faculty and postgraduate researchers are invited to submit papers for Volume 14 Issue 2.',
      file_path: uploadData.submission.file_path,
    }),
  });
  const newsPostData = await newsPostRes.json();
  if (!newsPostData.success) {
    throw new Error(`Publishing news failed: ${newsPostData.message}`);
  }
  console.log(`   News Publishing: SUCCESS! Published announcement ID: ${newsPostData.news.id}`);

  console.log('\n🎉 ALL TESTS PASSED! User authentication, registration, file uploads, and admin operations are 100% active and running on your local MySQL database (XAMPP)!');
}

runTests().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
