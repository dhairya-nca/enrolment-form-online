// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface UserRole {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
  permissions: string[];
}

// Define user roles and permissions
const ADMIN_USERS: Record<string, UserRole> = {
  'dhairya@nca.edu.au': {
    id: 'admin-1',
    email: 'dhairya@nca.edu.au',
    role: 'super_admin',
    permissions: [
      'view_all',
      'edit_all', 
      'delete_all',
      'reset_attempts',
      'view_folders',
      'manage_users',
      'view_analytics',
      'export_data'
    ]
  },
  'admin@nca.edu.au': {
    id: 'admin-2',
    email: 'admin@nca.edu.au',
    role: 'viewer',
    permissions: [
      'view_all',
      'view_analytics'
    ]
  }
  // Add more team members as needed
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export function generateToken(user: UserRole): string {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): UserRole | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserRole;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function hasPermission(user: UserRole, permission: string): boolean {
  return user.permissions.includes(permission);
}

export function isAuthorizedUser(email: string): UserRole | null {
  return ADMIN_USERS[email.toLowerCase()] || null;
}

// Middleware function for API routes
export function withAuth(handler: any) {
  return async (req: NextRequest, res: NextResponse) => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                  req.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Add user to request object
    (req as any).user = user;
    return handler(req, res);
  };
}

// Permission-based authorization
export function requirePermission(permission: string) {
  return (handler: any) => {
    return withAuth(async (req: NextRequest, res: NextResponse) => {
      const user = (req as any).user;
      
      if (!hasPermission(user, permission)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      return handler(req, res);
    });
  };
}