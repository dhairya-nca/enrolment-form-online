// debug-folder-access.js - Debug what your service account can actually see
require('dotenv').config({ path: '.env.local' });

const { google } = require('googleapis');

async function debugAccess() {
  console.log('🔍 Debugging Service Account Access...\n');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    console.log(`Service Account: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}\n`);

    // Step 1: Check all Shared Drives
    console.log('1️⃣ Checking accessible Shared Drives...');
    try {
      const sharedDrives = await drive.drives.list({
        pageSize: 20,
      });

      if (sharedDrives.data.drives && sharedDrives.data.drives.length > 0) {
        console.log('✅ Found Shared Drives:');
        sharedDrives.data.drives.forEach((drv, i) => {
          console.log(`   ${i + 1}. "${drv.name}" - ID: ${drv.id}`);
        });
        
        // Look for "Product Development" drive
        const productDrive = sharedDrives.data.drives.find(d => 
          d.name.toLowerCase().includes('product') || 
          d.name.toLowerCase().includes('development')
        );
        
        if (productDrive) {
          console.log(`\n🎯 Found Product Development Drive: ${productDrive.id}`);
          
          // List contents of this drive
          console.log('\n2️⃣ Listing contents of Product Development Drive...');
          const contents = await drive.files.list({
            q: `'${productDrive.id}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
          });
          
          if (contents.data.files && contents.data.files.length > 0) {
            console.log('✅ Contents:');
            contents.data.files.forEach((file, i) => {
              console.log(`   ${i + 1}. "${file.name}" - ID: ${file.id} (${file.mimeType})`);
              
              // Look for NCA folder
              if (file.name.toLowerCase().includes('nca') && 
                  file.mimeType === 'application/vnd.google-apps.folder') {
                console.log(`      👆 This looks like your NCA folder!`);
                console.log(`      Use this ID in your .env.local: ${file.id}`);
              }
            });
          }
        }
      } else {
        console.log('❌ No Shared Drives found');
      }
    } catch (driveError) {
      console.log('❌ Cannot access Shared Drives:', driveError.message);
    }

    // Step 2: Check regular folders shared with the service account
    console.log('\n3️⃣ Checking regular folders shared directly...');
    try {
      const sharedFolders = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and sharedWithMe=true and trashed=false",
        fields: 'files(id, name, webViewLink, owners)',
        pageSize: 20,
      });

      if (sharedFolders.data.files && sharedFolders.data.files.length > 0) {
        console.log('✅ Regular folders shared with service account:');
        sharedFolders.data.files.forEach((folder, i) => {
          console.log(`   ${i + 1}. "${folder.name}" - ID: ${folder.id}`);
          console.log(`      URL: ${folder.webViewLink}`);
        });
      } else {
        console.log('❌ No regular shared folders found');
      }
    } catch (folderError) {
      console.log('❌ Cannot access shared folders:', folderError.message);
    }

    // Step 3: Try to search for NCA folders specifically
    console.log('\n4️⃣ Searching for NCA folders...');
    try {
      const ncaSearch = await drive.files.list({
        q: "name contains 'NCA' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name, parents, webViewLink)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        pageSize: 10,
      });

      if (ncaSearch.data.files && ncaSearch.data.files.length > 0) {
        console.log('✅ Found NCA-related folders:');
        ncaSearch.data.files.forEach((folder, i) => {
          console.log(`   ${i + 1}. "${folder.name}" - ID: ${folder.id}`);
          console.log(`      URL: ${folder.webViewLink}`);
          console.log(`      Parents: ${folder.parents ? folder.parents.join(', ') : 'None'}`);
        });
      } else {
        console.log('❌ No NCA folders found');
      }
    } catch (searchError) {
      console.log('❌ Cannot search for NCA folders:', searchError.message);
    }

    console.log('\n📋 TROUBLESHOOTING STEPS:');
    console.log('1. If you see your NCA folder above, copy its ID to your .env.local');
    console.log('2. If not found, wait 5-10 minutes for permissions to propagate');
    console.log('3. Double-check the folder is shared with your service account');
    console.log('4. Try sharing the folder again with "Content manager" permissions');

  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    
    if (error.status === 401) {
      console.log('\n🔍 Authentication failed - check:');
      console.log('   1. GOOGLE_SERVICE_ACCOUNT_EMAIL is correct');
      console.log('   2. GOOGLE_PRIVATE_KEY is properly formatted');
      console.log('   3. Service account exists and has Drive API enabled');
    }
  }
}

debugAccess().catch(console.error);