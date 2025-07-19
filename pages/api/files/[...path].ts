// pages/api/files/[...path].ts - Serve uploaded files
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path: filePath } = req.query;
    
    if (!filePath || !Array.isArray(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // Construct the full file path
    const fullPath = path.join(process.cwd(), 'public', 'uploads', ...filePath);
    
    // Security check - ensure the path is within uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const normalizedPath = path.resolve(fullPath);
    const normalizedUploadsDir = path.resolve(uploadsDir);
    
    if (!normalizedPath.startsWith(normalizedUploadsDir)) {
      console.log('Access denied - path outside uploads directory');
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log('File not found:', fullPath);
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file stats
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return res.status(400).json({ error: 'Not a file' });
    }

    // Determine content type
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    const fileName = path.basename(fullPath);

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // For better file handling, set Content-Disposition
    if (contentType === 'application/pdf') {
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    } else if (contentType.startsWith('image/')) {
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    }

    console.log(`Serving file: ${fileName} (${contentType})`);

    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file' });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('Error serving file:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const config = {
  api: {
    responseLimit: '10mb', // Adjust based on your file size needs
  },
};