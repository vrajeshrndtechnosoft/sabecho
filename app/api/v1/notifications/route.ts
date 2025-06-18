/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for notifications (Note: this will reset on server reload!)
const notifications: any[] = [];

export async function GET() {
  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const notification = {
    id: Date.now(),
    message,
    seen: false,
  };

  notifications.push(notification);

  // Socket.io broadcast (if available)
  const io = (global as any).io;
  if (io) {
    io.emit('notification', notification);
  }

  return NextResponse.json(notification, { status: 201 });
}
