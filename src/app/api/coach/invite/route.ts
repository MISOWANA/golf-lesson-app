import { NextRequest, NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import CoachMember from '@/models/CoachMember';

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'coach') {
    return NextResponse.json({ error: '코치 권한이 필요합니다.' }, { status: 403 });
  }

  await connectDB();

  let code = nanoid();
  let tries = 0;
  while (tries < 5) {
    const exists = await CoachMember.findOne({ inviteCode: code });
    if (!exists) break;
    code = nanoid();
    tries++;
  }

  const rel = await CoachMember.create({
    coachId: session.id,
    inviteCode: code,
    status: 'inactive',
  });

  return NextResponse.json({ inviteCode: rel.inviteCode });
}
