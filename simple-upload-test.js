// simple-upload-test.js - Simple test for direct parent folder uploads
require('dotenv').config({ path: '.env.local' });

const { google } = require('googleapis');

async function testDirectUpload() {
  console.log('🚀 Testing Direct Upload to Parent Folder...\n');

  try {
    // Initialize Google Drive directly
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    console.log('1️⃣ Testing folder access...');
    const folderInfo = await drive.files.get({
      fileId: parentFolderId,
      fields: 'id, name, permissions'
    });
    console.log(`✅ Can access folder: ${folderInfo.data.name} (${folderInfo.data.id})\n`);

    console.log('2️⃣ Testing file upload...');
    const testContent = Buffer.from('This is a test document for direct upload to parent folder', 'utf8');
    const testFileName = `TEST_UPLOAD_${Date.now()}.txt`;

    // Create readable stream
    const { Readable } = require('stream');
    const stream = new Readable();
    stream.push(testContent);
    stream.push(null);

    const fileMetadata = {
      name: testFileName,
      parents: [parentFolderId],
    };

    const media = {
      mimeType: 'text/plain',
      body: stream,
    };

    const uploadResponse = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id,webViewLink,name',
    });

    const fileUrl = uploadResponse.data.webViewLink || `https://drive.google.com/file/d/${uploadResponse.data.id}/view`;
    
    console.log(`✅ File uploaded successfully!`);
    console.log(`   File Name: ${uploadResponse.data.name}`);
    console.log(`   File ID: ${uploadResponse.data.id}`);
    console.log(`   File URL: ${fileUrl}\n`);

    console.log('🎉 SUCCESS! Direct upload to parent folder works!');
    console.log('✅ Your Google Drive integration is now ready for production use.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error.status === 403) {
      console.log('\n🔍 Permission Error - Check:');
      console.log('   1. Service account has Editor access to the folder');
      console.log('   2. Folder is shared with the service account email');
      console.log('   3. GOOGLE_DRIVE_FOLDER_ID is correct');
    }
  }
}

testDirectUpload().catch(console.error);