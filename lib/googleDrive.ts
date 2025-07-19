// lib/googleDrive.ts - Enhanced with better error handling and document organization
import { google } from 'googleapis';

export class GoogleDriveService {
  private drive: any;
  private parentFolderId: string;

  constructor() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Google Drive service account credentials are required');
    }

    this.parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
    if (!this.parentFolderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID environment variable is required');
    }

    this.authenticate();
  }

  private authenticate() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
      ],
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async createStudentFolder(folderName: string): Promise<string> {
    try {
      const folderMetadata = {
        name: folderName,
        parents: [this.parentFolderId],
        mimeType: 'application/vnd.google-apps.folder',
      };

      const response = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });

      console.log(`Created folder: ${folderName} with ID: ${response.data.id}`);
      
      // Create subfolders for better organization
      await this.createSubfolders(response.data.id);
      
      return response.data.id;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error('Failed to create student folder');
    }
  }

  private async createSubfolders(parentFolderId: string): Promise<void> {
    const subfolders = [
      'Documents',
      'Assessments',
      'Enrollment_Forms',
      'Communications'
    ];

    try {
      const promises = subfolders.map(folderName => 
        this.drive.files.create({
          requestBody: {
            name: folderName,
            parents: [parentFolderId],
            mimeType: 'application/vnd.google-apps.folder',
          },
          fields: 'id',
        })
      );

      await Promise.all(promises);
      console.log('Created subfolders for student organization');
    } catch (error) {
      console.error('Error creating subfolders:', error);
      // Don't fail the main folder creation if subfolders fail
    }
  }

  async uploadFile(folderId: string, fileName: string, fileBuffer: Buffer, mimeType: string, subfolder?: string): Promise<string> {
    try {
      let targetFolderId = folderId;

      // If subfolder is specified, find or create it
      if (subfolder) {
        targetFolderId = await this.findOrCreateSubfolder(folderId, subfolder);
      }

      const fileMetadata = {
        name: fileName,
        parents: [targetFolderId],
      };

      // Convert Buffer to Readable stream for Google Drive API
      const { Readable } = require('stream');
      const stream = new Readable();
      stream.push(fileBuffer);
      stream.push(null); // End the stream

      const media = {
        mimeType,
        body: stream,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id,webViewLink',
      });

      console.log(`Uploaded file: ${fileName} with ID: ${response.data.id}`);
      return response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${fileName}`);
    }
  }

  private async findOrCreateSubfolder(parentFolderId: string, subfolderName: string): Promise<string> {
    try {
      // First, try to find existing subfolder
      const response = await this.drive.files.list({
        q: `'${parentFolderId}' in parents and name='${subfolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create subfolder if it doesn't exist
      const createResponse = await this.drive.files.create({
        requestBody: {
          name: subfolderName,
          parents: [parentFolderId],
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });

      return createResponse.data.id;
    } catch (error) {
      console.error('Error finding/creating subfolder:', error);
      return parentFolderId; // Fallback to parent folder
    }
  }

  async uploadPDFFromBuffer(folderId: string, fileName: string, pdfBuffer: Buffer, subfolder?: string): Promise<string> {
    // Determine appropriate subfolder based on file type
    let targetSubfolder = subfolder;
    if (!targetSubfolder) {
      if (fileName.includes('LLN_Assessment')) {
        targetSubfolder = 'Assessments';
      } else if (fileName.includes('Personal_Details') || fileName.includes('Declaration') || fileName.includes('Enrollment_Summary')) {
        targetSubfolder = 'Enrollment_Forms';
      } else {
        targetSubfolder = 'Documents';
      }
    }

    return this.uploadFile(folderId, fileName, pdfBuffer, 'application/pdf', targetSubfolder);
  }

  async uploadPDFFromBase64(folderId: string, fileName: string, base64Data: string, subfolder?: string): Promise<string> {
    const buffer = Buffer.from(base64Data, 'base64');
    return this.uploadPDFFromBuffer(folderId, fileName, buffer, subfolder);
  }

  async uploadImageFromBase64(folderId: string, fileName: string, base64Data: string, imageType: string = 'jpeg', subfolder?: string): Promise<string> {
    const buffer = Buffer.from(base64Data, 'base64');
    const mimeType = `image/${imageType}`;
    
    // Default to Documents subfolder for uploaded images
    const targetSubfolder = subfolder || 'Documents';
    
    return this.uploadFile(folderId, fileName, buffer, mimeType, targetSubfolder);
  }

  async listFolderContents(folderId: string): Promise<any[]> {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, createdTime, size, webViewLink)',
        orderBy: 'createdTime desc',
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error listing folder contents:', error);
      throw new Error('Failed to list folder contents');
    }
  }

  async shareFolder(folderId: string, emailAddress: string, role: 'reader' | 'writer' = 'reader'): Promise<void> {
    try {
      await this.drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role,
          type: 'user',
          emailAddress,
        },
      });

      console.log(`Shared folder ${folderId} with ${emailAddress} as ${role}`);
    } catch (error) {
      console.error('Error sharing folder:', error);
      throw new Error('Failed to share folder');
    }
  }

  async getFolderInfo(folderId: string): Promise<any> {
    try {
      const response = await this.drive.files.get({
        fileId: folderId,
        fields: 'id, name, createdTime, modifiedTime, webViewLink, parents',
      });

      return response.data;
    } catch (error) {
      console.error('Error getting folder info:', error);
      throw new Error('Failed to get folder information');
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId,
      });

      console.log(`Deleted file with ID: ${fileId}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Generate shareable link for a folder
  async getFolderShareableLink(folderId: string): Promise<string> {
    try {
      // Make sure the folder is shared with anyone with the link
      await this.drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const response = await this.drive.files.get({
        fileId: folderId,
        fields: 'webViewLink',
      });

      return response.data.webViewLink;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      throw new Error('Failed to generate shareable link');
    }
  }

  // Get or create student folder and ensure proper structure
  async ensureStudentFolder(studentId: string, studentName: string): Promise<string> {
    try {
      // First check if folder already exists
      const searchResponse = await this.drive.files.list({
        q: `'${this.parentFolderId}' in parents and name contains '${studentId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (searchResponse.data.files && searchResponse.data.files.length > 0) {
        console.log(`Found existing folder for student ${studentId}`);
        return searchResponse.data.files[0].id;
      }

      // Create new folder if it doesn't exist
      const folderName = `${studentId}_${studentName.replace(/\s+/g, '_')}`;
      return await this.createStudentFolder(folderName);
    } catch (error) {
      console.error('Error ensuring student folder:', error);
      throw new Error('Failed to ensure student folder exists');
    }
  }
}