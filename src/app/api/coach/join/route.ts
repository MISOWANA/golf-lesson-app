import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import CoachMember from '@/models/CoachMember';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'member') {
    return NextResponse.json({ error: '회원 권한이 필요합니다.' }, { status: 403 });
  }

  const { inviteCode } = await req.json();
  if (!inviteCode) return NextResponse.json({ error: '초대 코드를 입력해주세요.' }, { status: 400 });

  await connectDB();

  const rel = await CoachMember.findOne({ inviteCode: inviteCode.toUpperCase() });
  if (!rel) return NextResponse.json({ error: '유효하지 않은 초대 코드입니다.' }, { status: 404 });

  if (rel.status === 'active') {
    return NextResponse.json({ error: '이미 사용된 초대 코드입니다.' }, { status: 400 });
  }

  const alreadyJoined = await CoachMember.findOne({
    coachId: rel.coachId,
    memberId: session.id,
    status: 'active',
  });
  if (alreadyJoined) return NextResponse.json({ error: '이미 연결된 코치입니다.' }, { status: 400 });

  rel.memberId = session.id as any;
  rel.status = 'active';
  await rel.save();

  const coach = await User.findById(rel.coachId, 'name').lean() as any;
  return NextResponse.json({ coachName: coach?.name, message: '코치와 연결되었습니다!' });
}
