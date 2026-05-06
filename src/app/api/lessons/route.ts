import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import LessonSession from '@/models/LessonSession';
import CoachMember from '@/models/CoachMember';
import '@/models/User';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');

  let query: Record<string, unknown> = {};

  if (session.role === 'coach') {
    query.coachId = session.id;
    if (memberId) {
      const rel = await CoachMember.findOne({ coachId: session.id, memberId, status: 'active' });
      if (!rel) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
      query.memberId = memberId;
    }
  } else {
    query.memberId = session.id;
    query.isShared = true;
  }

  const lessons = await LessonSession.find(query)
    .populate('coachId', 'name')
    .populate('memberId', 'name')
    .sort({ lessonDate: -1 })
    .lean();

  return NextResponse.json(lessons);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'coach') {
    return NextResponse.json({ error: '코치 권한이 필요합니다.' }, { status: 403 });
  }

  await connectDB();

  const body = await req.json();
  const { memberId, location, lessonDate } = body;

  if (!memberId) return NextResponse.json({ error: '회원 정보가 필요합니다.' }, { status: 400 });

  const rel = await CoachMember.findOne({ coachId: session.id, memberId, status: 'active' });
  if (!rel) return NextResponse.json({ error: '소속 회원이 아닙니다.' }, { status: 403 });

  const count = await LessonSession.countDocuments({ coachId: session.id, memberId });
  const sessionNumber = count + 1;

  const lesson = await LessonSession.create({
    coachId: session.id,
    memberId,
    sessionNumber,
    location: location ? String(location).slice(0, 200) : '',
    lessonDate: lessonDate ? new Date(lessonDate) : new Date(),
  });

  return NextResponse.json(lesson, { status: 201 });
}
