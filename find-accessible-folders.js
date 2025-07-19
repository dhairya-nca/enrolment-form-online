// find-accessible-folders.js - Find what folders/drives your service account can access
require('dotenv').config({ path: '.env.local' });

const { google } = require('googleapis');

async function findAccessibleFolders() {
  console.log('🔍 Finding accessible folders and drives...\n');
  console.log(`Service Account: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}\n`);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log('1️⃣ Checking Shared Drives...');
    try {
      const drivesResponse = await drive.drives.list({
        pageSize: 10,
      });

      if (drivesResponse.data.drives && drivesResponse.data.drives.length > 0) {
        console.log('✅ Accessible Shared Drives:');
        drivesResponse.data.drives.forEach((drive, index) => {
          console.log(`   ${index + 1}. Name: "${drive.name}"`);
          console.log(`      ID: ${drive.id}`);
          console.log(`      URL: https://drive.google.com/drive/folders/${drive.id}\n`);
        });
      } else {
        console.log('❌ No Shared Drives accessible\n');
      }
    } catch (driveError) {
      console.log('❌ Cannot access Shared Drives\n');
    }

    console.log('2️⃣ Checking regular folders shared with service account...');
    try {
      // Search for folders shared with this service account
      const foldersResponse = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
        pageSize: 20,
        fields: 'files(id, name, webViewLink, permissions)',
      });

      if (foldersResponse.data.files && foldersResponse.data.files.length > 0) {
        console.log('✅ Accessible regular folders:');
        foldersResponse.data.files.forEach((folder, index) => {
          console.log(`   ${index + 1}. Name: "${folder.name}"`);
          console.log(`      ID: ${folder.id}`);
          console.log(`      URL: ${folder.webViewLink}\n`);
        });
      } else {
        console.log('❌ No regular folders accessible\n');
      }
    } catch (folderError) {
      console.log('❌ Cannot access regular folders\n');
    }

    console.log('3️⃣ Checking root access...');
    try {
      // Check if service account has any root level access
      const rootResponse = await drive.files.list({
        q: "parents in 'root' and trashed=false",
        pageSize: 10,
        fields: 'files(id, name, mimeType)',
      });

      if (rootResponse.data.files && rootResponse.data.files.length > 0) {
        console.log('✅ Has root level access - found files/folders:');
        rootResponse.data.files.slice(0, 5).forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.name} (${file.mimeType})`);
        });
      } else {
        console.log('❌ No root level access\n');
      }
    } catch (rootError) {
      console.log('❌ Cannot access root level\n');
    }

    console.log('📋 SUMMARY:');
    console.log('If no folders were found, you need to:');
    console.log('   1. Create a new folder in your personal Google Drive');
    console.log('   2. Share it with your service account email:');
    console.log(`      ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
    console.log('   3. Give it "Editor" permissions');
    console.log('   4. Update your .env.local with the new folder ID');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.status === 403) {
      console.log('\n🔍 Authentication issue:');
      console.log('   1. Check GOOGLE_SERVICE_ACCOUNT_EMAIL is correct');
      console.log('   2. Check GOOGLE_PRIVATE_KEY is properly formatted');
      console.log('   3. Ensure service account has Google Drive API enabled');
    }
  }
}

findAccessibleFolders().catch(console.error);