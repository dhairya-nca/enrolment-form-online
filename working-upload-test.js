// working-upload-test.js - Test upload using the method that actually works
require('dotenv').config({ path: '.env.local' });

const { google } = require('googleapis');

async function testWorkingUpload() {
  console.log('🚀 Testing Upload with Working Method...\n');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log('1️⃣ Finding accessible folders...');
    
    // Use the same method that worked in debug script
    const sharedFolders = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and sharedWithMe=true and trashed=false",
      fields: 'files(id, name, webViewLink)',
      pageSize: 10,
    });

    if (!sharedFolders.data.files || sharedFolders.data.files.length === 0) {
      throw new Error('No accessible folders found');
    }

    // Find the Enrollment Data folder
    const enrollmentFolder = sharedFolders.data.files.find(f => 
      f.name === 'Enrollment Data'
    );

    if (!enrollmentFolder) {
      console.log('Available folders:');
      sharedFolders.data.files.forEach(f => console.log(`  - ${f.name} (${f.id})`));
      throw new Error('Enrollment Data folder not found');
    }

    console.log(`✅ Found Enrollment Data folder: ${enrollmentFolder.id}`);

    console.log('\n2️⃣ Testing file upload...');

    // Create test file content
    const testContent = 'This is a test document for NCA Enrollment System - Upload Test';
    const testFileName = `TEST_UPLOAD_${Date.now()}.txt`;

    // Convert to stream
    const { Readable } = require('stream');
    const stream = new Readable();
    stream.push(testContent);
    stream.push(null);

    // Upload file
    const uploadResponse = await drive.files.create({
      requestBody: {
        name: testFileName,
        parents: [enrollmentFolder.id],
      },
      media: {
        mimeType: 'text/plain',
        body: stream,
      },
      fields: 'id,webViewLink,name',
    });

    console.log(`✅ File uploaded successfully!`);
    console.log(`   File Name: ${uploadResponse.data.name}`);
    console.log(`   File ID: ${uploadResponse.data.id}`);
    console.log(`   File URL: ${uploadResponse.data.webViewLink}`);

    console.log('\n3️⃣ Testing folder creation...');

    // Test creating a student folder
    const testStudentFolder = `TEST_STUDENT_${Date.now()}`;
    
    const folderResponse = await drive.files.create({
      requestBody: {
        name: testStudentFolder,
        parents: [enrollmentFolder.id],
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id,name,webViewLink',
    });

    console.log(`✅ Student folder created successfully!`);
    console.log(`   Folder Name: ${folderResponse.data.name}`);
    console.log(`   Folder ID: ${folderResponse.data.id}`);
    console.log(`   Folder URL: ${folderResponse.data.webViewLink}`);

    console.log('\n4️⃣ Testing file upload to student folder...');

    // Upload a file to the student folder
    const studentTestContent = 'This is a test document in student folder';
    const studentTestFileName = `STUDENT_TEST_${Date.now()}.txt`;

    const studentStream = new Readable();
    studentStream.push(studentTestContent);
    studentStream.push(null);

    const studentUploadResponse = await drive.files.create({
      requestBody: {
        name: studentTestFileName,
        parents: [folderResponse.data.id],
      },
      media: {
        mimeType: 'text/plain',
        body: studentStream,
      },
      fields: 'id,webViewLink,name',
    });

    console.log(`✅ File uploaded to student folder!`);
    console.log(`   File Name: ${studentUploadResponse.data.name}`);
    console.log(`   File URL: ${studentUploadResponse.data.webViewLink}`);

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Your Google Drive integration is working perfectly!');
    console.log('✅ Both folder creation and file uploads work!');
    
    console.log('\n📝 Update your .env.local with:');
    console.log(`GOOGLE_DRIVE_FOLDER_ID=${enrollmentFolder.id}`);

    // Clean up test files
    console.log('\n🧹 Cleaning up test files...');
    try {
      await drive.files.delete({ fileId: uploadResponse.data.id });
      await drive.files.delete({ fileId: studentUploadResponse.data.id });
      await drive.files.delete({ fileId: folderResponse.data.id });
      console.log('✅ Test files cleaned up');
    } catch (cleanupError) {
      console.log('⚠️  Could not clean up test files (this is okay)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.status === 403) {
      console.log('\n🔍 Permission Error Solutions:');
      console.log('   1. Check folder is shared with service account');
      console.log('   2. Ensure service account has "Editor" or "Content manager" role');
      console.log('   3. Wait 5-10 minutes for permission changes to propagate');
    }
  }
}

testWorkingUpload().catch(console.error);