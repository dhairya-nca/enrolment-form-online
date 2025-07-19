// lib/googleDrive.ts - Enhanced local file storage version
import fs from 'fs';
import path from 'path';

export class GoogleDriveService {
  private uploadsDir: string;

  constructor() {
    // Create uploads directory in your project
    this.uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      console.log(`Created uploads directory: ${this.uploadsDir}`);
    }
  }

  /**
   * Ensure student folder exists - create local folder for student
   */
  async ensureStudentFolder(studentId: string, studentName: string): Promise<string> {
    try {
      const studentFolderPath = path.join(this.uploadsDir, studentId);
      
      if (!fs.existsSync(studentFolderPath)) {
        fs.mkdirSync(studentFolderPath, { recursive: true });
        console.log(`Created student folder: ${studentFolderPath}`);
      }
      
      return studentFolderPath;
    } catch (error) {
      console.error('Error creating student folder:', error);
      throw new Error(`Failed to create folder for student: ${studentId}`);
    }
  }

  /**
   * Create a new student folder locally
   */
  async createStudentFolder(folderName: string): Promise<string> {
    const folderPath = path.join(this.uploadsDir, folderName);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`Created folder: ${folderPath}`);
    }
    
    return folderPath;
  }

  /**
   * Upload file to local storage
   */
  async uploadFile(
    folderId: string, 
    fileName: string, 
    fileBuffer: Buffer, 
    mimeType: string, 
    subfolder?: string
  ): Promise<string> {
    try {
      // Organize filename with subfolder prefix
      const organizedFileName = subfolder ? `${subfolder}_${fileName}` : fileName;
      
      // Save to the uploads directory (use studentId from folderId if it's a path)
      let targetDir = this.uploadsDir;
      if (folderId && folderId.includes(path.sep)) {
        // folderId is actually a path
        targetDir = folderId;
      }
      
      const filePath = path.join(targetDir, organizedFileName);
      
      // Write file to disk
      fs.writeFileSync(filePath, fileBuffer);
      
      // Generate web-accessible URL
      const relativePath = path.relative(this.uploadsDir, filePath);
      const urlPath = relativePath.replace(/\\/g, '/'); // Convert Windows paths to web paths
      
      // Use API endpoint for file serving in production
      const fileUrl = `/api/files/${urlPath}`;
      
      console.log(`Successfully uploaded: ${organizedFileName} to local storage`);
      console.log(`File accessible at: ${fileUrl}`);
      
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${fileName}`);
    }
  }

  /**
   * Upload PDF from buffer to local storage
   */
  async uploadPDFFromBuffer(
    folderId: string, 
    fileName: string, 
    pdfBuffer: Buffer, 
    subfolder?: string
  ): Promise<string> {
    let filePrefix = subfolder;
    if (!filePrefix) {
      if (fileName.includes('LLN_Assessment')) {
        filePrefix = 'Assessment';
      } else if (fileName.includes('Personal_Details') || fileName.includes('Declaration') || fileName.includes('Enrollment_Summary')) {
        filePrefix = 'EnrollmentForm';
      } else {
        filePrefix = 'Document';
      }
    }

    return this.uploadFile(folderId, fileName, pdfBuffer, 'application/pdf', filePrefix);
  }

  /**
   * Upload image from base64 to local storage
   */
  async uploadImageFromBase64(
    folderId: string, 
    fileName: string, 
    base64Data: string, 
    imageType: string, 
    subfolder?: string
  ): Promise<string> {
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const mimeType = `image/${imageType}`;
    
    return this.uploadFile(folderId, fileName, imageBuffer, mimeType, subfolder || 'Document');
  }

  /**
   * Get folder contents (list local files)
   */
  async listFolderContents(folderId: string): Promise<any[]> {
    try {
      let targetDir = this.uploadsDir;
      if (folderId && folderId.includes(path.sep)) {
        targetDir = folderId;
      }
      
      if (!fs.existsSync(targetDir)) {
        return [];
      }
      
      const files = fs.readdirSync(targetDir);
      
      return files.map(fileName => {
        const filePath = path.join(targetDir, fileName);
        const stats = fs.statSync(filePath);
        const relativePath = path.relative(this.uploadsDir, filePath);
        const urlPath = relativePath.replace(/\\/g, '/');
        
        return {
          id: fileName,
          name: fileName,
          mimeType: this.getMimeType(fileName),
          size: stats.size,
          createdTime: stats.birthtime.toISOString(),
          webViewLink: `/api/files/${urlPath}`
        };
      });
    } catch (error) {
      console.error('Error listing folder contents:', error);
      return [];
    }
  }

  /**
   * Get folder information
   */
  async getFolderInfo(folderId: string): Promise<any> {
    try {
      let targetDir = this.uploadsDir;
      if (folderId && folderId.includes(path.sep)) {
        targetDir = folderId;
      }
      
      if (!fs.existsSync(targetDir)) {
        return null;
      }
      
      const stats = fs.statSync(targetDir);
      
      return {
        id: path.basename(targetDir),
        name: path.basename(targetDir),
        createdTime: stats.birthtime.toISOString(),
        modifiedTime: stats.mtime.toISOString()
      };
    } catch (error) {
      console.error('Error getting folder info:', error);
      return null;
    }
  }

  /**
   * Generate shareable link for folder (local)
   */
  async getFolderShareableLink(folderId: string): Promise<string> {
    const folderName = path.basename(folderId);
    return `/api/files/${folderName}`;
  }

  /**
   * Helper method to determine MIME type from file extension
   */
  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

// // lib/googleDrive.ts - Optimized for Google Workspace Shared Drives
// import { google } from 'googleapis';
// import { Readable } from 'stream';

// export class GoogleDriveService {
//   private drive: any;
//   private parentFolderId: string;

//   constructor() {
//     if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
//       throw new Error('Google Drive service account credentials are required');
//     }

//     this.parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
//     if (!this.parentFolderId) {
//       throw new Error('GOOGLE_DRIVE_FOLDER_ID environment variable is required');
//     }

//     this.authenticate();
//   }

//   private authenticate() {
//     const auth = new google.auth.GoogleAuth({
//       credentials: {
//         client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
//         private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//       },
//       scopes: [
//         'https://www.googleapis.com/auth/drive',
//         'https://www.googleapis.com/auth/drive.file'
//       ],
//     });

//     this.drive = google.drive({ version: 'v3', auth });
//   }

//   /**
//    * Check if folder is a Shared Drive
//    */
//   private async isSharedDrive(folderId: string): Promise<boolean> {
//     try {
//       const response = await this.drive.drives.get({
//         driveId: folderId,
//       });
//       return !!response.data;
//     } catch (error) {
//       // If error, it's probably a regular folder, not a shared drive
//       return false;
//     }
//   }

//   /**
//    * Ensure student folder exists - create individual folders in Shared Drive
//    */
//   async ensureStudentFolder(studentId: string, studentName: string): Promise<string> {
//     try {
//       // Clean student name for folder naming
//       const cleanStudentName = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
//       const folderName = `${studentId}_${cleanStudentName}`;
      
//       console.log(`Creating/finding student folder in Shared Drive: ${folderName}`);
      
//       // Check if we're working with a Shared Drive
//       const isShared = await this.isSharedDrive(this.parentFolderId);
//       const supportsAllDrives = isShared;
      
//       // First check if folder already exists
//       const existingResponse = await this.drive.files.list({
//         q: `'${this.parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
//         fields: 'files(id, name)',
//         supportsAllDrives: supportsAllDrives,
//         includeItemsFromAllDrives: supportsAllDrives,
//       });

//       if (existingResponse.data.files && existingResponse.data.files.length > 0) {
//         const existingFolderId = existingResponse.data.files[0].id;
//         console.log(`Using existing student folder: ${folderName} with ID: ${existingFolderId}`);
//         return existingFolderId;
//       }

//       // Create new folder if it doesn't exist
//       console.log(`Creating new student folder: ${folderName}`);
//       return await this.createStudentFolder(folderName);
      
//     } catch (error) {
//       console.error('Error ensuring student folder:', error);
//       throw new Error(`Failed to create folder for student: ${studentId}`);
//     }
//   }

//   /**
//    * Create a new student folder in Shared Drive
//    */
//   async createStudentFolder(folderName: string): Promise<string> {
//     try {
//       const isShared = await this.isSharedDrive(this.parentFolderId);
      
//       const folderMetadata = {
//         name: folderName,
//         parents: [this.parentFolderId],
//         mimeType: 'application/vnd.google-apps.folder',
//       };

//       const response = await this.drive.files.create({
//         requestBody: folderMetadata,
//         fields: 'id',
//         supportsAllDrives: isShared,
//       });

//       const folderId = response.data.id;
//       console.log(`Created student folder: ${folderName} with ID: ${folderId}`);
      
//       return folderId;
//     } catch (error) {
//       console.error('Error creating student folder:', error);
//       throw new Error(`Failed to create folder: ${folderName}`);
//     }
//   }

//   /**
//    * Upload file to Shared Drive (supports both folders and root)
//    */
//   async uploadFile(
//     folderId: string, 
//     fileName: string, 
//     fileBuffer: Buffer, 
//     mimeType: string, 
//     subfolder?: string
//   ): Promise<string> {
//     try {
//       // Determine target folder
//       let targetFolderId = folderId;
      
//       // If subfolder is specified, create/find it
//       if (subfolder) {
//         targetFolderId = await this.ensureSubfolder(folderId, subfolder);
//       }

//       // Check if we're working with Shared Drives
//       const isShared = await this.isSharedDrive(this.parentFolderId);
      
//       const fileMetadata = {
//         name: fileName,
//         parents: [targetFolderId],
//       };

//       // Convert Buffer to Readable stream
//       const stream = new Readable();
//       stream.push(fileBuffer);
//       stream.push(null);

//       const media = {
//         mimeType,
//         body: stream,
//       };

//       const response = await this.drive.files.create({
//         requestBody: fileMetadata,
//         media,
//         fields: 'id,webViewLink',
//         supportsAllDrives: isShared,
//       });

//       const fileUrl = response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`;
//       console.log(`Successfully uploaded: ${fileName} to ${subfolder || 'main folder'}`);
      
//       return fileUrl;
//     } catch (error) {
//       console.error('Error uploading file:', error);
//       throw new Error(`Failed to upload file: ${fileName}`);
//     }
//   }

//   /**
//    * Ensure subfolder exists in student folder
//    */
//   private async ensureSubfolder(parentFolderId: string, subfolderName: string): Promise<string> {
//     try {
//       const isShared = await this.isSharedDrive(this.parentFolderId);
      
//       // Check if subfolder already exists
//       const existingResponse = await this.drive.files.list({
//         q: `'${parentFolderId}' in parents and name='${subfolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
//         fields: 'files(id, name)',
//         supportsAllDrives: isShared,
//         includeItemsFromAllDrives: isShared,
//       });

//       if (existingResponse.data.files && existingResponse.data.files.length > 0) {
//         return existingResponse.data.files[0].id;
//       }

//       // Create subfolder
//       const response = await this.drive.files.create({
//         requestBody: {
//           name: subfolderName,
//           parents: [parentFolderId],
//           mimeType: 'application/vnd.google-apps.folder',
//         },
//         fields: 'id',
//         supportsAllDrives: isShared,
//       });

//       console.log(`Created subfolder: ${subfolderName}`);
//       return response.data.id;
//     } catch (error) {
//       console.error('Error creating subfolder:', error);
//       return parentFolderId; // Fallback to parent folder
//     }
//   }

//   /**
//    * Upload PDF from buffer with automatic organization
//    */
//   async uploadPDFFromBuffer(
//     folderId: string, 
//     fileName: string, 
//     pdfBuffer: Buffer, 
//     subfolder?: string
//   ): Promise<string> {
//     // Determine appropriate subfolder based on file type if not specified
//     let targetSubfolder = subfolder;
//     if (!targetSubfolder) {
//       if (fileName.includes('LLN_Assessment')) {
//         targetSubfolder = 'Assessments';
//       } else if (fileName.includes('Personal_Details') || fileName.includes('Declaration') || fileName.includes('Enrollment_Summary')) {
//         targetSubfolder = 'Enrollment_Forms';
//       } else {
//         targetSubfolder = 'Documents';
//       }
//     }

//     return this.uploadFile(folderId, fileName, pdfBuffer, 'application/pdf', targetSubfolder);
//   }

//   /**
//    * Upload image from base64 with automatic organization
//    */
//   async uploadImageFromBase64(
//     folderId: string, 
//     fileName: string, 
//     base64Data: string, 
//     imageType: string, 
//     subfolder?: string
//   ): Promise<string> {
//     const imageBuffer = Buffer.from(base64Data, 'base64');
//     const mimeType = `image/${imageType}`;
    
//     return this.uploadFile(folderId, fileName, imageBuffer, mimeType, subfolder || 'Documents');
//   }

//   /**
//    * Get folder contents for admin viewing
//    */
//   async listFolderContents(folderId: string): Promise<any[]> {
//     try {
//       const isShared = await this.isSharedDrive(this.parentFolderId);
      
//       const response = await this.drive.files.list({
//         q: `'${folderId}' in parents and trashed=false`,
//         fields: 'files(id, name, mimeType, size, createdTime, webViewLink)',
//         orderBy: 'createdTime desc',
//         supportsAllDrives: isShared,
//         includeItemsFromAllDrives: isShared,
//       });

//       return response.data.files || [];
//     } catch (error) {
//       console.error('Error listing folder contents:', error);
//       return [];
//     }
//   }

//   /**
//    * Get folder information
//    */
//   async getFolderInfo(folderId: string): Promise<any> {
//     try {
//       const isShared = await this.isSharedDrive(this.parentFolderId);
      
//       const response = await this.drive.files.get({
//         fileId: folderId,
//         fields: 'id, name, createdTime, modifiedTime',
//         supportsAllDrives: isShared,
//       });

//       return response.data;
//     } catch (error) {
//       console.error('Error getting folder info:', error);
//       return null;
//     }
//   }

//   /**
//    * Generate shareable link for folder
//    */
//   async getFolderShareableLink(folderId: string): Promise<string> {
//     try {
//       const isShared = await this.isSharedDrive(this.parentFolderId);
      
//       // Make folder viewable by anyone with the link
//       await this.drive.permissions.create({
//         fileId: folderId,
//         requestBody: {
//           role: 'reader',
//           type: 'anyone'
//         },
//         supportsAllDrives: isShared,
//       });

//       const response = await this.drive.files.get({
//         fileId: folderId,
//         fields: 'webViewLink',
//         supportsAllDrives: isShared,
//       });

//       return response.data.webViewLink;
//     } catch (error) {
//       console.error('Error generating shareable link:', error);
//       throw new Error('Failed to generate shareable link');
//     }
//   }
// }
