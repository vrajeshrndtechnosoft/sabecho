/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

const notifications: any[] = [];

export async function DELETE(
  req: NextRequest,
  { params }:{params: Promise<{ id: string }>}
) {
  const { id } = await params;
  const nid =  parseInt(id);
  const index = notifications.findIndex((n) => n.id === nid);

  if (index !== -1) {
    const deletedNotification = notifications.splice(index, 1)[0];

    const io = (global as any).io;
    if (io) {
      io.emit('notification_deleted', deletedNotification);
    }

    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
}
