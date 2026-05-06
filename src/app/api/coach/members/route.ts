import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import CoachMember from '@/models/CoachMember';
import LessonSession from '@/models/LessonSession';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'coach') {
    return NextResponse.json({ error: '코치 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    await connectDB();

    const relations = await CoachMember.find({ coachId: session.id, status: 'active' })
      .populate('memberId', 'name email')
      .lean();

    const lastLessons = await LessonSession.aggregate([
      { $match: { coachId: new mongoose.Types.ObjectId(session.id) } },
      { $sort: { lessonDate: -1 } },
      { $group: { _id: '$memberId', lessonDate: { $first: '$lessonDate' }, sessionNumber: { $first: '$sessionNumber' } } },
    ]);

    const lastLessonMap = new Map(lastLessons.map((l) => [l._id.toString(), l]));

    const members = relations
      .filter((rel) => rel.memberId != null)
      .map((rel) => {
        const member = rel.memberId as any;
        const last = lastLessonMap.get(member._id.toString());
        return {
          relationId: rel._id,
          memberId: member._id,
          name: member.name,
          email: member.email,
          totalLessons: rel.totalLessons,
          remainingLessons: rel.remainingLessons,
          lastLesson: last ? { date: last.lessonDate, sessionNumber: last.sessionNumber } : null,
        };
      });

    return NextResponse.json(members);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
