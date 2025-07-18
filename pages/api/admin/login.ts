// pages/api/admin/login.ts - Debug Version with Better Error Handling
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { generateToken, isAuthorizedUser } from '../../../middleware/auth';

// STEP 1: Update these with your actual credentials
// Run the password generator script to get the correct hashes
const ADMIN_PASSWORDS: Record<string, string> = {
  'dhairya@nca.edu.au': '$2b$10$V2tNzvpbOYqWExF1LLxJsOzTQHOpivdlPmRuaJanofc4SjX4eZrg2',
  'admin@nca.edu.au': '$2b$10$4whsGtbKa7HqXoceq4fOiO2uz6BVJQTD8LR9moDwDkHXoLJVYyzM2',
};

interface LoginRequest {
  email: string;
  password: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password }: LoginRequest = req.body;

    // Debug logging (remove in production)
    console.log('🔍 Login attempt for:', email);
    console.log('🔍 Available admin emails:', Object.keys(ADMIN_PASSWORDS));

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user is authorized
    const user = isAuthorizedUser(email);
    if (!user) {
      console.log('❌ User not found in ADMIN_USERS:', email);
      console.log('📋 Available users:', Object.keys(ADMIN_PASSWORDS));
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ 
        message: 'Invalid credentials',
        debug: `User ${email} not found in authorized users list`
      });
    }

    console.log('✅ User found in ADMIN_USERS:', user.email, user.role);

    // Verify password
    const hashedPassword = ADMIN_PASSWORDS[email.toLowerCase()];
    if (!hashedPassword) {
      console.log('❌ No password hash found for:', email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ 
        message: 'Invalid credentials',
        debug: `No password hash configured for ${email}`
      });
    }

    console.log('🔍 Found password hash for user');
    console.log('🔍 Hash starts with:', hashedPassword.substring(0, 10) + '...');

    // Check if hash looks valid
    if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
      console.log('❌ Invalid hash format for:', email);
      return res.status(500).json({ 
        message: 'Server configuration error',
        debug: 'Invalid password hash format'
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, hashedPassword);
    console.log('🔍 Password verification result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password verification failed for:', email);
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ 
        message: 'Invalid credentials',
        debug: 'Password verification failed'
      });
    }

    // Generate JWT token
    const token = generateToken(user);
    console.log('✅ Login successful for:', email);

    // Log successful login
    console.log(`✅ Admin login successful: ${email} at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      debug: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}