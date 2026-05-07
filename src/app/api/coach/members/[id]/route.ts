import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import CoachMember from '@/models/CoachMember';
import LessonSession from '@/models/LessonSession';
import '@/models/User';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'coach') {
    return NextResponse.json({ error: '코치 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const { id: memberId } = await params;
    await connectDB();

    const rel = await CoachMember.findOne({ coachId: session.id, memberId, status: 'active' })
      .populate('memberId', 'name email')
      .lean();

    if (!rel) {
      return NextResponse.json({ error: '회원을 찾을 수 없습니다.' }, { status: 404 });
    }

    const member = rel.memberId as any;

    const lessons = await LessonSession.find({ coachId: session.id, memberId })
      .sort({ lessonDate: -1 })
      .lean();

    return NextResponse.json({
      relationId: rel._id,
      memberId: member._id,
      name: member.name,
      email: member.email,
      connectedAt: rel.connectedAt,
      totalLessons: rel.totalLessons,
      remainingLessons: rel.remainingLessons,
      lessons,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'coach') {
    return NextResponse.json({ error: '코치 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const { id: memberId } = await params;
    const { totalLessons, remainingLessons } = await req.json();

    if (typeof totalLessons !== 'number' || typeof remainingLessons !== 'number') {
      return NextResponse.json({ error: '올바른 값을 입력해주세요.' }, { status: 400 });
    }
    if (totalLessons < 0 || remainingLessons < 0) {
      return NextResponse.json({ error: '0 이상의 값을 입력해주세요.' }, { status: 400 });
    }
    if (remainingLessons > totalLessons) {
      return NextResponse.json({ error: '잔여 레슨은 총 레슨보다 많을 수 없습니다.' }, { status: 400 });
    }

    await connectDB();

    const rel = await CoachMember.findOneAndUpdate(
      { coachId: session.id, memberId, status: 'active' },
      { totalLessons, remainingLessons },
      { new: true }
    );

    if (!rel) {
      return NextResponse.json({ error: '회원을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ totalLessons: rel.totalLessons, remainingLessons: rel.remainingLessons });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'coach') {
    return NextResponse.json({ error: '코치 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const { id: memberId } = await params;
    await connectDB();

    const rel = await CoachMember.findOneAndUpdate(
      { coachId: session.id, memberId, status: 'active' },
      { status: 'inactive' },
      { new: true }
    );

    if (!rel) {
      return NextResponse.json({ error: '회원을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '연결이 해제되었습니다.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
