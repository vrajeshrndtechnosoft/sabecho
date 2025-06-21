import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename} = await params;
    const filePath = path.join(process.cwd(), 'public', filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');

    return new NextResponse(fileContents, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error reading sitemap:', error);
    return NextResponse.json({ error: 'Sitemap not found' }, { status: 404 });
  }
}
