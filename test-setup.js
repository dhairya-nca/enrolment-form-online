// test-setup.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { google } = require('googleapis');

async function testGoogleSheets() {
  console.log('🧪 Testing Google Sheets connection...');
  
  try {
    // Create JWT auth for the newer version of google-spreadsheet
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    
    await doc.loadInfo();
    console.log('✅ Google Sheets connected successfully!');
    console.log(`   Sheet title: ${doc.title}`);
    console.log(`   Number of sheets: ${doc.sheetCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Google Sheets connection failed:', error.message);
    
    // Try the older authentication method as fallback
    try {
      console.log('🔄 Trying alternative authentication method...');
      
      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
      
      // Try the older auth method
      await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      
      await doc.loadInfo();
      console.log('✅ Google Sheets connected successfully (fallback method)!');
      console.log(`   Sheet title: ${doc.title}`);
      console.log(`   Number of sheets: ${doc.sheetCount}`);
      
      return true;
    } catch (fallbackError) {
      console.error('❌ Fallback method also failed:', fallbackError.message);
      return false;
    }
  }
}

async function testGoogleDrive() {
  console.log('🧪 Testing Google Drive connection...');
  
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    // Test by getting folder info
    const response = await drive.files.get({
      fileId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      fields: 'id, name'
    });
    
    console.log('✅ Google Drive connected successfully!');
    console.log(`   Folder name: ${response.data.name}`);
    console.log(`   Folder ID: ${response.data.id}`);
    
    return true;
  } catch (error) {
    console.error('❌ Google Drive connection failed:', error.message);
    return false;
  }
}

async function testCreateSheet() {
  console.log('🧪 Testing sheet creation...');
  
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    // Check if Student_Tracking sheet exists, if not create it
    let trackingSheet = doc.sheetsByTitle['Student_Tracking'];
    
    if (!trackingSheet) {
      console.log('📝 Creating Student_Tracking sheet...');
      trackingSheet = await doc.addSheet({
        title: 'Student_Tracking',
        headerValues: [
          'student_id', 'first_name', 'last_name', 'email', 'date_of_birth',
          'folder_id', 'attempt_count', 'is_blocked', 'registered_at',
          'last_attempt_at', 'status', 'reset_at'
        ]
      });
      console.log('✅ Student_Tracking sheet created successfully!');
    } else {
      console.log('✅ Student_Tracking sheet already exists!');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Sheet creation test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting environment setup test...\n');
  
  // Check if environment variables are set
  const requiredEnvVars = [
    'GOOGLE_SHEET_ID',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL', 
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_DRIVE_FOLDER_ID'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease check your .env.local file.\n');
    return;
  }
  
  console.log('✅ All environment variables found\n');
  
  const sheetsOk = await testGoogleSheets();
  console.log('');
  const driveOk = await testGoogleDrive();
  console.log('');
  const sheetCreationOk = await testCreateSheet();
  
  console.log('\n' + '='.repeat(50));
  if (sheetsOk && driveOk && sheetCreationOk) {
    console.log('🎉 All tests passed! Your environment is ready.');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ Google Sheets API - Connected');
    console.log('   ✅ Google Drive API - Connected');
    console.log('   ✅ Sheet structure - Ready');
    console.log('');
    console.log('You can now start your development server:');
    console.log('   npm run dev');
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
    
    if (!sheetsOk) {
      console.log('');
      console.log('💡 Google Sheets troubleshooting:');
      console.log('   1. Check that your service account has access to the sheet');
      console.log('   2. Verify the GOOGLE_SHEET_ID is correct');
      console.log('   3. Make sure the private key format is correct');
    }
  }
  console.log('='.repeat(50));
}

// Make sure to load environment variables
require('dotenv').config({ path: '.env.local' });

runTests().catch(console.error);