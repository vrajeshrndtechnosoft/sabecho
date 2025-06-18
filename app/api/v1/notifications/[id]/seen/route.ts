import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const notifications: any[] = [];

export async function POST(
  req: NextRequest,
  { params }: {params: Promise<{ id: string }>}
) {
  const { id } = await params;
  const nId = parseInt(id);
  const notification = notifications.find((n) => n.id === nId);

  if (notification) {
    notification.seen = true;
    return NextResponse.json(notification);
  }

  return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
}
