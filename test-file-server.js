// test-file-server.js - Test the file server API
const fs = require('fs');
const path = require('path');

async function testFileServer() {
  console.log('🧪 Testing File Server API...\n');

  try {
    // Check if test files exist from previous test
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ No uploads directory found. Run the local storage test first.');
      return;
    }

    // Find student folders
    const studentFolders = fs.readdirSync(uploadsDir).filter(item => {
      const itemPath = path.join(uploadsDir, item);
      return fs.statSync(itemPath).isDirectory() && item.startsWith('STU_');
    });

    if (studentFolders.length === 0) {
      console.log('❌ No student folders found. Run the local storage test first.');
      return;
    }

    const testStudentFolder = studentFolders[0];
    console.log(`📁 Testing with student folder: ${testStudentFolder}`);

    // Find test files
    const studentDir = path.join(uploadsDir, testStudentFolder);
    const files = fs.readdirSync(studentDir);

    console.log(`📄 Found ${files.length} files to test:`);
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });

    console.log('\n🚀 Start your development server and test these URLs:');
    console.log('   npm run dev');
    console.log('');
    console.log('📎 Test URLs:');
    
    files.forEach((file, index) => {
      const testUrl = `http://localhost:3000/api/files/${testStudentFolder}/${file}`;
      console.log(`   ${index + 1}. ${testUrl}`);
    });

    console.log('\n✅ File server setup complete!');
    console.log('📝 Next steps:');
    console.log('   1. Start your dev server: npm run dev');
    console.log('   2. Test the URLs above in your browser');
    console.log('   3. Test the full enrollment system');

  } catch (error) {
    console.error('❌ Error testing file server:', error);
  }
}

testFileServer().catch(console.error);