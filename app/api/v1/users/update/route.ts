// app/api/update-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import User from '@/models/User';
import { connectDb } from '@/lib/db';

interface UpdateUserWithImageRequest {
  userId: string;
  name?: string;
  email?: string;
  companyName?: string;
  mobileNo?: string;
  gstNo?: string;
  userType?: string;
  pincode?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export async function PUT(request: NextRequest) {
  try {
    await connectDb();
    
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const profileImage = formData.get('profileImage') as File;

    // Validate required userId
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Handle file upload if present
    if (profileImage && profileImage.size > 0) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(profileImage.type)) {
        return NextResponse.json(
          { message: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.' },
          { status: 400 }
        );
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (profileImage.size > maxSize) {
        return NextResponse.json(
          { message: 'File size too large. Maximum 5MB allowed.' },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = path.extname(profileImage.name);
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const filename = `profile_${timestamp}_${randomString}${fileExtension}`;
      
      // Save file to uploads directory
      const filePath = path.join(uploadsDir, filename);
      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);
      
      // Update user with new profile image filename
      user.profileImage = filename;
    }

    // Update other fields from formData
    const updateFields: Partial<UpdateUserWithImageRequest> = {};
    
    // Extract other form fields
    for (const [key, value] of formData.entries()) {
      if (key !== 'userId' && key !== 'profileImage' && value) {
        updateFields[key] = value as string;
      }
    }

    // Apply updates to user
    Object.assign(user, updateFields);
    await user.save();

    return NextResponse.json(
      { 
        message: 'User updated successfully', 
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage,
          companyName: user.companyName,
          mobileNo: user.mobileNo,
          userType: user.userType
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
