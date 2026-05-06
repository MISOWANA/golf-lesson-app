import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  await connectDB();

  const notifs = await Notification.find({ toUserId: session.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(notifs);
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  await connectDB();
  await Notification.updateMany({ toUserId: session.id, isRead: false }, { isRead: true });

  return NextResponse.json({ ok: true });
}
