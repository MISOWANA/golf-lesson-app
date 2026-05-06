import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import CoachMember from '@/models/CoachMember';
import LessonSession from '@/models/LessonSession';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'coach') {
    return NextResponse.json({ error: '코치 권한이 필요합니다.' }, { status: 403 });
  }

  await connectDB();

  const relations = await CoachMember.find({ coachId: session.id, status: 'active' })
    .populate('memberId', 'name email')
    .lean();

  const members = await Promise.all(
    relations.map(async (rel) => {
      const member = rel.memberId as any;
      const lastLesson = await LessonSession.findOne(
        { coachId: session.id, memberId: member._id },
        { lessonDate: 1, sessionNumber: 1 }
      )
        .sort({ lessonDate: -1 })
        .lean();

      return {
        relationId: rel._id,
        memberId: member._id,
        name: member.name,
        email: member.email,
        totalLessons: rel.totalLessons,
        remainingLessons: rel.remainingLessons,
        lastLesson: lastLesson ? { date: lastLesson.lessonDate, sessionNumber: lastLesson.sessionNumber } : null,
      };
    })
  );

  return NextResponse.json(members);
}
