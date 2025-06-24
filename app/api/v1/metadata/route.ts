import { NextRequest, NextResponse } from 'next/server';
import MetadataModel from '@/models/Metadata';
import { connectDb } from '@/lib/db'; // Your MongoDB connection helper

export async function GET(req: NextRequest) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const page = searchParams.get('page');

  try {
    const query = slug ? { slug } : page ? { page } : {};
    const data = await MetadataModel.find(query);

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    const body = await req.json();

    const {
      title,
      description,
      slug,
      page,
      image,
      keywords,
      canonicalUrl,
    } = body;

    if (!title || !description || !slug || !page) {
      return NextResponse.json(
        { error: 'title, description, slug, and page are required.' },
        { status: 400 }
      );
    }

    const existing = await MetadataModel.findOne({ page });
    if (existing) {
      return NextResponse.json(
        { error: 'Metadata for this page already exists.' },
        { status: 409 }
      );
    }

    const newMeta = await MetadataModel.create({
      title,
      description,
      slug,
      page,
      image,
      keywords,
      canonicalUrl,
    });

    return NextResponse.json(newMeta, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create metadata' }, { status: 500 });
  }
}
