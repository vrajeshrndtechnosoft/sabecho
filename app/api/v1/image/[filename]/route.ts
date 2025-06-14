
// app/api/image/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import path from 'path';
import { constants } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Validate filename (basic security check)
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { message: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    try {
      // Check if file exists
      await access(filePath, constants.F_OK);
      
      // Read the file
      const fileBuffer = await readFile(filePath);
      
      // Determine content type based on file extension
      const extension = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (extension) {
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
        case '.svg':
          contentType = 'image/svg+xml';
          break;
      }

      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    } catch (fileError) {
      console.error('File not found or error accessing file:', fileError);
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
