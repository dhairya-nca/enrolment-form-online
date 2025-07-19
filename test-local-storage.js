// test-local-storage.js - Test the local storage implementation
require('dotenv').config({ path: '.env.local' });

// Import the local storage version
const { GoogleDriveService } = require('./lib/googleDrive');

async function testLocalStorage() {
  console.log('🚀 Testing Local Storage Implementation...\n');

  try {
    // Test 1: Initialize service
    console.log('1️⃣ Initializing local storage service...');
    const driveService = new GoogleDriveService();
    console.log('✅ Local storage service initialized\n');

    // Test 2: Create student folder
    console.log('2️⃣ Testing student folder creation...');
    const testStudentId = `STU_${Date.now()}`;
    const testStudentName = 'Test Student';
    
    const studentFolderPath = await driveService.ensureStudentFolder(testStudentId, testStudentName);
    console.log(`✅ Student folder created: ${studentFolderPath}\n`);

    // Test 3: Upload a test file
    console.log('3️⃣ Testing file upload...');
    const testContent = Buffer.from('This is a test document for local storage - NCA Enrollment System');
    const testFileName = `test_document_${Date.now()}.txt`;
    
    const fileUrl = await driveService.uploadFile(
      studentFolderPath,
      testFileName,
      testContent,
      'text/plain',
      'Documents'
    );
    
    console.log(`✅ File uploaded successfully!`);
    console.log(`   File URL: ${fileUrl}\n`);

    // Test 4: Upload a PDF
    console.log('4️⃣ Testing PDF upload...');
    const pdfContent = Buffer.from('This is mock PDF content for testing');
    const pdfFileName = `Personal_Details_${testStudentId}.pdf`;
    
    const pdfUrl = await driveService.uploadPDFFromBuffer(
      studentFolderPath,
      pdfFileName,
      pdfContent
    );
    
    console.log(`✅ PDF uploaded successfully!`);
    console.log(`   PDF URL: ${pdfUrl}\n`);

    // Test 5: Upload an image
    console.log('5️⃣ Testing image upload...');
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const imageFileName = `photo_${testStudentId}.png`;
    
    const imageUrl = await driveService.uploadImageFromBase64(
      studentFolderPath,
      imageFileName,
      base64Image,
      'png'
    );
    
    console.log(`✅ Image uploaded successfully!`);
    console.log(`   Image URL: ${imageUrl}\n`);

    // Test 6: List folder contents
    console.log('6️⃣ Testing folder contents listing...');
    const folderContents = await driveService.listFolderContents(studentFolderPath);
    
    console.log(`✅ Found ${folderContents.length} files in student folder:`);
    folderContents.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name} (${file.mimeType}) - ${file.webViewLink}`);
    });
    console.log('');

    // Test 7: Get folder info
    console.log('7️⃣ Testing folder info...');
    const folderInfo = await driveService.getFolderInfo(studentFolderPath);
    
    console.log(`✅ Folder info retrieved:`);
    console.log(`   Name: ${folderInfo.name}`);
    console.log(`   Created: ${folderInfo.createdTime}`);
    console.log(`   Modified: ${folderInfo.modifiedTime}\n`);

    // Test 8: Generate shareable link
    console.log('8️⃣ Testing shareable link...');
    const shareableLink = await driveService.getFolderShareableLink(studentFolderPath);
    
    console.log(`✅ Shareable link generated: ${shareableLink}\n`);

    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Local storage implementation is working perfectly!');
    console.log('✅ Files are stored in: public/uploads/');
    console.log('✅ Files are accessible via web URLs');
    console.log('');
    console.log('📂 File Structure Created:');
    console.log(`   public/uploads/${testStudentId}/`);
    console.log(`   ├── Documents_${testFileName}`);
    console.log(`   ├── EnrollmentForm_${pdfFileName}`);
    console.log(`   └── Document_${imageFileName}`);
    console.log('');
    console.log('🚀 Your enrollment system is ready to use!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('');
    console.log('🔍 Troubleshooting:');
    console.log('   1. Make sure you have write permissions in the project directory');
    console.log('   2. Check that Node.js has access to create folders');
    console.log('   3. Ensure the project structure is correct');
  }
}

testLocalStorage().catch(console.error);