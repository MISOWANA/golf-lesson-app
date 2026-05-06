import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import CoachMember from '@/models/CoachMember';
import '@/models/User';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'member') {
    return NextResponse.json({ error: '회원 권한이 필요합니다.' }, { status: 403 });
  }

  await connectDB();

  const rel = await CoachMember.findOne({ memberId: session.id, status: 'active' })
    .populate('coachId', 'name email')
    .lean();

  if (!rel) return NextResponse.json(null);

  const coach = rel.coachId as any;
  return NextResponse.json({ coachId: coach._id, name: coach.name, email: coach.email });
}
