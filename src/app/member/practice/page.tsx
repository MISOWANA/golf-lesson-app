'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface Mission { id: string; text: string; isCompleted: boolean; }

interface Lesson {
  _id: string;
  sessionNumber: number;
  lessonDate: string;
  missions: Mission[];
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function daysUntil(date: string) {
  const nextLesson = new Date(date);
  nextLesson.setDate(nextLesson.getDate() + 7);
  const diff = Math.ceil((nextLesson.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export default function PracticePage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lessons')
      .then(r => r.json())
      .then((data: Lesson[]) => {
        setLessons(data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleMission(lessonId: string, missionId: string, current: boolean) {
    const next = !current;
    setLessons(prev => prev.map(l =>
      l._id === lessonId
        ? { ...l, missions: l.missions.map(m => m.id === missionId ? { ...m, isCompleted: next } : m) }
        : l
    ));
    await fetch(`/api/lessons/${lessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId, isCompleted: next }),
    });
  }

  const allMissions = lessons.flatMap(l => l.missions);
  const totalCount = allMissions.length;
  const completedCount = allMissions.filter(m => m.isCompleted).length;
  const latest = lessons[0] ?? null;
  const dday = latest ? daysUntil(latest.lessonDate) : 0;
  const lessonsWithMissions = lessons.filter(l => l.missions.length > 0);

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">이번 주 연습 방향</h1>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
      ) : lessonsWithMissions.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">🎯</p>
          <p className="mt-3 font-medium text-gray-500">연습 미션이 없습니다</p>
          <p className="mt-1 text-sm text-gray-400">코치에게 레슨 기록을 받으면 미션이 표시됩니다</p>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-2xl bg-green-700 p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">전체 미션</p>
                <p className="mt-0.5 text-2xl font-bold">{completedCount} / {totalCount} 완료</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">D-{dday}</p>
                <p className="text-xs opacity-70">다음 레슨까지</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-green-600">
              <div
                className="h-2 rounded-full bg-white transition-all"
                style={{ width: totalCount ? `${(completedCount / totalCount) * 100}%` : '0%' }}
              />
            </div>
            {totalCount > 0 && completedCount === totalCount && (
              <p className="mt-2 text-center text-xs font-medium opacity-90">🎉 모든 미션 완료! 훌륭해요</p>
            )}
          </div>

          <div className="space-y-6">
            {lessonsWithMissions.map(lesson => {
              const done = lesson.missions.filter(m => m.isCompleted).length;
              return (
                <div key={lesson._id}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        {lesson.sessionNumber}회차
                      </span>
                      <span className="text-xs text-gray-400">{fmtDate(lesson.lessonDate)}</span>
                    </div>
                    <span className="text-xs text-gray-400">{done}/{lesson.missions.length} 완료</span>
                  </div>

                  <div className="space-y-2">
                    {lesson.missions.map(m => (
                      <button
                        key={m.id}
                        onClick={() => toggleMission(lesson._id, m.id, m.isCompleted)}
                        className="w-full"
                      >
                        <Card className={`flex items-start gap-4 text-left transition-all ${m.isCompleted ? 'opacity-60' : ''}`}>
                          <span className="mt-0.5 text-2xl shrink-0">
                            {m.isCompleted ? '✅' : '⬜'}
                          </span>
                          <p className={`text-sm font-medium ${m.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {m.text}
                          </p>
                        </Card>
                      </button>
                    ))}
                  </div>

                  <Link href={`/member/lesson/${lesson._id}`}>
                    <p className="mt-2 text-right text-xs text-green-600">
                      {lesson.sessionNumber}회차 피드백 보기 →
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
