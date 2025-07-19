// test-drive-integration.js - Test script for Google Drive functionality
require('dotenv').config({ path: '.env.local' });
const { GoogleDriveService } = require('./lib/googleDrive');
const { GoogleSheetsService } = require('./lib/googleSheets');

async function testDriveIntegration() {
  console.log('🚀 Testing Google Drive Integration...\n');

  try {
    // Test 1: Initialize services
    console.log('1️⃣ Initializing services...');
    const driveService = new GoogleDriveService();
    const sheetsService = new GoogleSheetsService();
    console.log('✅ Services initialized successfully\n');

    // Test 2: Create test student folder
    console.log('2️⃣ Testing student folder creation...');
    const testStudentId = `TEST_${Date.now()}`;
    const testStudentName = 'Test Student';
    
    const folderId = await driveService.ensureStudentFolder(testStudentId, testStudentName);
    console.log(`✅ Student folder created: ${folderId}\n`);

    // Test 3: Update student record with folder ID
    console.log('3️⃣ Updating student record...');
    await sheetsService.updateStudentFolder(testStudentId, folderId);
    console.log('✅ Student record updated with folder ID\n');

    // Test 4: Create test document
    console.log('4️⃣ Testing document upload...');
    const testDocument = Buffer.from('This is a test document for NCA enrollment system', 'utf8');
    const testFileName = `test_document_${Date.now()}.txt`;
    
    const fileUrl = await driveService.uploadFile(
      folderId,
      testFileName,
      testDocument,
      'text/plain',
      'Documents'
    );
    console.log(`✅ Test document uploaded: ${fileUrl}\n`);

    // Test 5: Update document tracking
    console.log('5️⃣ Testing document tracking...');
    await sheetsService.updateDocumentStatus(testStudentId, {
      passportBio: fileUrl
    });
    console.log('✅ Document tracking updated\n');

    // Test 6: Get folder contents
    console.log('6️⃣ Testing folder contents retrieval...');
    const folderContents = await driveService.listFolderContents(folderId);
    console.log(`✅ Found ${folderContents.length} items in folder:`);
    folderContents.forEach(item => {
      console.log(`   - ${item.name} (${item.mimeType})`);
    });
    console.log('');

    // Test 7: Get document status
    console.log('7️⃣ Testing document status retrieval...');
    const docStatus = await sheetsService.getDocumentStatus(testStudentId);
    console.log('✅ Document status retrieved:', docStatus);
    console.log('');

    // Test 8: Generate shareable link
    console.log('8️⃣ Testing shareable link generation...');
    const shareableLink = await driveService.getFolderShareableLink(folderId);
    console.log(`✅ Shareable link created: ${shareableLink}\n`);

    // Test Summary
    console.log('🎉 ALL TESTS PASSED! 🎉\n');
    console.log('📋 Test Summary:');
    console.log(`   Student ID: ${testStudentId}`);
    console.log(`   Folder ID: ${folderId}`);
    console.log(`   Test File: ${testFileName}`);
    console.log(`   File URL: ${fileUrl}`);
    console.log(`   Shareable Link: ${shareableLink}`);
    console.log('');
    console.log('✅ Your Google Drive integration is working perfectly!');
    console.log('✅ Students can now upload documents successfully');
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('   1. Deploy the enhanced upload API');
    console.log('   2. Update the frontend component');
    console.log('   3. Test with real student uploads');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('');
    console.log('🔍 Troubleshooting:');
    console.log('   1. Check your .env.local file has all required variables');
    console.log('   2. Verify Google Service Account permissions');
    console.log('   3. Ensure GOOGLE_DRIVE_FOLDER_ID exists and is accessible');
    console.log('   4. Check Google Sheets ID is correct');
    console.log('');
    console.log('📁 Required Environment Variables:');
    console.log('   - GOOGLE_SERVICE_ACCOUNT_EMAIL');
    console.log('   - GOOGLE_PRIVATE_KEY');
    console.log('   - GOOGLE_DRIVE_FOLDER_ID');
    console.log('   - GOOGLE_SHEET_ID');
  }
}

async function testQuickUpload() {
  console.log('🚀 Quick Upload Test for Existing Student...\n');
  
  try {
    const driveService = new GoogleDriveService();
    const sheetsService = new GoogleSheetsService();
    
    // Get existing students
    const students = await sheetsService.getStudentList();
    console.log(`📊 Found ${students.length} existing students`);
    
    if (students.length > 0) {
      const testStudent = students[0];
      console.log(`🧑‍🎓 Testing with student: ${testStudent.studentId}`);
      
      // Ensure they have a folder
      let folderId = testStudent.folderId;
      if (!folderId) {
        console.log('📁 Creating folder for existing student...');
        folderId = await driveService.ensureStudentFolder(
          testStudent.studentId, 
          `${testStudent.firstName}_${testStudent.lastName}`
        );
        await sheetsService.updateStudentFolder(testStudent.studentId, folderId);
        console.log(`✅ Folder created: ${folderId}`);
      } else {
        console.log(`✅ Using existing folder: ${folderId}`);
      }
      
      // Test document upload
      const testDoc = Buffer.from('Sample passport bio page content', 'utf8');
      const fileName = `passport_bio_${testStudent.studentId}_${new Date().toISOString().split('T')[0]}.txt`;
      
      const fileUrl = await driveService.uploadFile(folderId, fileName, testDoc, 'text/plain', 'Documents');
      console.log(`✅ Document uploaded: ${fileUrl}`);
      
      // Update tracking
      await sheetsService.updateDocumentStatus(testStudent.studentId, {
        passportBio: fileUrl
      });
      console.log('✅ Document tracking updated');
      
      console.log('\n🎉 Quick test completed successfully!');
    } else {
      console.log('ℹ️  No existing students found. Create a student first through the enrollment process.');
    }
    
  } catch (error) {
    console.error('❌ Quick test failed:', error);
  }
}

// Main execution
async function main() {
  console.log('=' * 60);
  console.log('📁 NCA ENROLLMENT SYSTEM - GOOGLE DRIVE TEST');
  console.log('=' * 60);
  console.log('');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--quick')) {
    await testQuickUpload();
  } else {
    await testDriveIntegration();
  }
  
  console.log('');
  console.log('=' * 60);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testDriveIntegration, testQuickUpload };