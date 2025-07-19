// lib/googleDrive.ts - Enhanced with robust folder management
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

  /**
   * Ensure student folder exists - create if doesn't exist, return folder ID
   */
  async ensureStudentFolder(studentId: string, studentName: string): Promise<string> {
    try {
      // Clean student name for folder naming
      const cleanStudentName = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
      const folderName = `${studentId}_${cleanStudentName}`;
      
      // First check if folder already exists
      console.log(`Searching for existing folder: ${folderName}`);
      const searchResponse = await this.drive.files.list({
        q: `'${this.parentFolderId}' in parents and name contains '${studentId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (searchResponse.data.files && searchResponse.data.files.length > 0) {
        const existingFolder = searchResponse.data.files[0];
        console.log(`Found existing folder: ${existingFolder.name} (${existingFolder.id})`);
        
        // Ensure subfolders exist
        await this.ensureSubfolders(existingFolder.id);
        return existingFolder.id;
      }

      // Create new folder if it doesn't exist
      console.log(`Creating new folder: ${folderName}`);
      return await this.createStudentFolder(folderName);
      
    } catch (error) {
      console.error('Error ensuring student folder:', error);
      throw new Error('Failed to create or access student folder');
    }
  }

  /**
   * Create a new student folder with organized subfolders
   */
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

      const folderId = response.data.id;
      console.log(`Created main folder: ${folderName} with ID: ${folderId}`);
      
      // Create organized subfolders
      await this.ensureSubfolders(folderId);
      
      return folderId;
    } catch (error) {
      console.error('Error creating student folder:', error);
      throw new Error('Failed to create student folder');
    }
  }

  /**
   * Ensure all required subfolders exist
   */
  private async ensureSubfolders(parentFolderId: string): Promise<void> {
    const requiredSubfolders = [
      'Documents',
      'Assessments', 
      'Enrollment_Forms',
      'Communications'
    ];

    try {
      // Check which subfolders already exist
      const existingFolders = await this.drive.files.list({
        q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      const existingNames = existingFolders.data.files?.map((f: any) => f.name) || [];
      const foldersToCreate = requiredSubfolders.filter(name => !existingNames.includes(name));

      if (foldersToCreate.length > 0) {
        console.log(`Creating missing subfolders: ${foldersToCreate.join(', ')}`);
        
        const promises = foldersToCreate.map(folderName => 
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
        console.log('All required subfolders ensured');
      } else {
        console.log('All subfolders already exist');
      }
    } catch (error) {
      console.error('Error ensuring subfolders:', error);
      // Don't fail the main operation if subfolders fail
    }
  }

  /**
   * Find or create a specific subfolder
   */
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

      console.log(`Created subfolder: ${subfolderName}`);
      return createResponse.data.id;
    } catch (error) {
      console.error('Error finding/creating subfolder:', error);
      return parentFolderId; // Fallback to parent folder
    }
  }

  /**
   * Upload file to student folder with automatic organization
   */
  async uploadFile(
    folderId: string, 
    fileName: string, 
    fileBuffer: Buffer, 
    mimeType: string, 
    subfolder?: string
  ): Promise<string> {
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

      const fileUrl = response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`;
      console.log(`Successfully uploaded: ${fileName} to ${subfolder || 'main folder'}`);
      
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${fileName}`);
    }
  }

  /**
   * Upload PDF from buffer with automatic organization
   */
  async uploadPDFFromBuffer(
    folderId: string, 
    fileName: string, 
    pdfBuffer: Buffer, 
    subfolder?: string
  ): Promise<string> {
    // Determine appropriate subfolder based on file type if not specified
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

  /**
   * Upload image from base64 with automatic organization
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
    
    return this.uploadFile(folderId, fileName, imageBuffer, mimeType, subfolder || 'Documents');
  }

  /**
   * Get folder contents for admin viewing
   */
  async listFolderContents(folderId: string): Promise<any[]> {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, size, createdTime, webViewLink)',
        orderBy: 'createdTime desc'
      });

      return response.data.files || [];
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
      const response = await this.drive.files.get({
        fileId: folderId,
        fields: 'id, name, createdTime, modifiedTime'
      });

      return response.data;
    } catch (error) {
      console.error('Error getting folder info:', error);
      return null;
    }
  }

  /**
   * Generate shareable link for folder
   */
  async getFolderShareableLink(folderId: string): Promise<string> {
    try {
      // Make folder viewable by anyone with the link
      await this.drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
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
}