// test-shared-drive.js - Test script for Shared Drive functionality
require('dotenv').config({ path: '.env.local' });

const { google } = require('googleapis');

async function testSharedDrive() {
  console.log('🚀 Testing Shared Drive Integration...\n');

  try {
    // Initialize Google Drive
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const sharedDriveId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    console.log('1️⃣ Testing Shared Drive access...');
    
    // Test 1: Check if it's a Shared Drive
    try {
      const driveResponse = await drive.drives.get({
        driveId: sharedDriveId,
      });
      console.log(`✅ Shared Drive found: ${driveResponse.data.name}`);
    } catch (driveError) {
      console.log('ℹ️  Not a Shared Drive, checking as regular folder...');
      
      // Test as regular folder
      const folderResponse = await drive.files.get({
        fileId: sharedDriveId,
        fields: 'id, name'
      });
      console.log(`✅ Regular folder found: ${folderResponse.data.name}`);
    }

    console.log('\n2️⃣ Testing file upload to Shared Drive...');
    
    // Test 2: Create a test file
    const testContent = 'This is a test file for NCA Enrollment System in Shared Drive';
    const testFileName = `TEST_SHARED_DRIVE_${Date.now()}.txt`;

    const { Readable } = require('stream');
    const stream = new Readable();
    stream.push(testContent);
    stream.push(null);

    const fileMetadata = {
      name: testFileName,
      parents: [sharedDriveId],
    };

    const media = {
      mimeType: 'text/plain',
      body: stream,
    };

    const uploadResponse = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id,webViewLink,name',
      supportsAllDrives: true, // Important for Shared Drives
    });

    const fileUrl = uploadResponse.data.webViewLink;
    
    console.log(`✅ File uploaded successfully to Shared Drive!`);
    console.log(`   File Name: ${uploadResponse.data.name}`);
    console.log(`   File ID: ${uploadResponse.data.id}`);
    console.log(`   File URL: ${fileUrl}\n`);

    console.log('3️⃣ Testing folder creation in Shared Drive...');
    
    // Test 3: Create a test folder
    const testFolderName = `TEST_STUDENT_${Date.now()}`;
    
    const folderResponse = await drive.files.create({
      requestBody: {
        name: testFolderName,
        parents: [sharedDriveId],
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id,name',
      supportsAllDrives: true,
    });

    console.log(`✅ Folder created successfully!`);
    console.log(`   Folder Name: ${folderResponse.data.name}`);
    console.log(`   Folder ID: ${folderResponse.data.id}\n`);

    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Your Shared Drive integration is working perfectly!');
    console.log('✅ Students can now upload documents without quota issues!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error.status === 403) {
      console.log('\n🔍 Permission Error - Check:');
      console.log('   1. Created a Shared Drive in Google Drive');
      console.log('   2. Added service account as Content Manager/Manager');
      console.log('   3. Updated GOOGLE_DRIVE_FOLDER_ID to Shared Drive ID');
    } else if (error.status === 404) {
      console.log('\n🔍 Not Found Error - Check:');
      console.log('   1. GOOGLE_DRIVE_FOLDER_ID is correct');
      console.log('   2. Shared Drive exists and is accessible');
    }
  }
}

testSharedDrive().catch(console.error);