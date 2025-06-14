import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDb } from '@/lib/db';

interface JWTPayload {
  userId: string;
  email: string;
  userType?: string;
  iat?: number;
  exp?: number;
}

// Middleware function for token verification
function verifyToken(request: NextRequest): { isValid: boolean; userId?: string; error?: string } {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return { isValid: false, error: 'Unauthorized' };
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return { isValid: false, error: 'Server configuration error' };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return { isValid: true, userId: decoded.userId };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return { isValid: false, error: 'Invalid token' };
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify token
    const tokenVerification = verifyToken(request);
    if (!tokenVerification.isValid) {
      return NextResponse.json(
        { error: tokenVerification.error },
        { status: 401 }
      );
    }

    await connectDb();
    
    const { id } = params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { authorized: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Authorization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}