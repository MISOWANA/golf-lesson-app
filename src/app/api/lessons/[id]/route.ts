import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import LessonSession from '@/models/LessonSession';
import Notification from '@/models/Notification';
import '@/models/User';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  await connectDB();
  const { id } = await params;

  const lesson = await LessonSession.findById(id)
    .populate('coachId', 'name')
    .populate('memberId', 'name')
    .lean();

  if (!lesson) return NextResponse.json({ error: '레슨을 찾을 수 없습니다.' }, { status: 404 });

  const lessonAny = lesson as any;
  const coachId = lessonAny.coachId?._id?.toString() ?? lessonAny.coachId?.toString();
  const memberId = lessonAny.memberId?._id?.toString() ?? lessonAny.memberId?.toString();

  if (coachId !== session.id && memberId !== session.id) {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  if (session.role === 'member' && !(lessonAny as any).isShared) {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  return NextResponse.json(lesson);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  await connectDB();
  const { id } = await params;

  const lesson = await LessonSession.findById(id);
  if (!lesson) return NextResponse.json({ error: '레슨을 찾을 수 없습니다.' }, { status: 404 });

  const body = await req.json();

  if (session.role === 'coach' && lesson.coachId.toString() === session.id) {
    const { goodPoints, improvements, coachComment, scores, missions, location, lessonDate, isShared } = body;

    if (goodPoints !== undefined) lesson.goodPoints = goodPoints;
    if (improvements !== undefined) lesson.improvements = improvements;
    if (coachComment !== undefined) lesson.coachComment = coachComment;
    if (scores !== undefined) lesson.scores = scores;
    if (missions !== undefined) lesson.missions = missions;
    if (location !== undefined) lesson.location = location;
    if (lessonDate !== undefined) lesson.lessonDate = new Date(lessonDate);

    if (isShared === true && !lesson.isShared) {
      lesson.isShared = true;
      await lesson.save();

      await Notification.create({
        toUserId: lesson.memberId,
        fromUserId: session.id,
        type: 'new_feedback',
        title: `${lesson.sessionNumber}회차 레슨 기록이 공유됐습니다`,
        body: '코치가 피드백과 이번 주 연습 방향을 등록했어요. 지금 확인하세요!',
        sessionId: lesson._id,
      });
    } else {
      await lesson.save();
    }
  } else if (session.role === 'member' && lesson.memberId.toString() === session.id) {
    if (body.memberNote !== undefined) lesson.memberNote = body.memberNote;

    if (body.missionId && body.isCompleted !== undefined) {
      const mission = lesson.missions.find((m: { id: string }) => m.id === body.missionId);
      if (mission) {
        mission.isCompleted = body.isCompleted;
        mission.completedAt = body.isCompleted ? new Date() : undefined;
      }
    }
    await lesson.save();
  } else {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  return NextResponse.json(lesson);
}
