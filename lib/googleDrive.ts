// lib/googleDrive.ts
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
      return response.data.id;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error('Failed to create student folder');
    }
  }

  async uploadFile(folderId: string, fileName: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };

      const media = {
        mimeType,
        body: Buffer.from(fileBuffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id,webViewLink',
      });

      console.log(`Uploaded file: ${fileName} with ID: ${response.data.id}`);
      return response.data.webViewLink;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async uploadPDFFromBuffer(folderId: string, fileName: string, pdfBuffer: Buffer): Promise<string> {
    return this.uploadFile(folderId, fileName, pdfBuffer, 'application/pdf');
  }

  async uploadPDFFromBase64(folderId: string, fileName: string, base64Data: string): Promise<string> {
    const buffer = Buffer.from(base64Data, 'base64');
    return this.uploadPDFFromBuffer(folderId, fileName, buffer);
  }

  async uploadImageFromBase64(folderId: string, fileName: string, base64Data: string, imageType: string = 'jpeg'): Promise<string> {
    const buffer = Buffer.from(base64Data, 'base64');
    const mimeType = `image/${imageType}`;
    return this.uploadFile(folderId, fileName, buffer, mimeType);
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
}