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
      .then((data: Lesson[]) => { setLessons(data); })
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
        <div className="h-40 animate-pulse rounded-2xl bg-[#2A2A2A]" />
      ) : lessonsWithMissions.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">🎯</p>
          <p className="mt-3 font-medium text-[#AEAEB2]">연습 미션이 없습니다</p>
          <p className="mt-1 text-sm text-[#636366]">코치에게 레슨 기록을 받으면 미션이 표시됩니다</p>
        </div>
      ) : (
        <>
          {/* 요약 카드 */}
          <div className="mb-6 rounded-2xl bg-[#1C1C1E] p-4 ring-1 ring-[#2C2C2E]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#636366]">전체 미션</p>
                <p className="mt-0.5 text-2xl font-bold text-white">{completedCount} / {totalCount} 완료</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#D4AF37]">D-{dday}</p>
                <p className="text-xs text-[#636366]">다음 레슨까지</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#2C2C2E]">
              <div
                className="h-2 rounded-full bg-[#D4AF37] transition-all"
                style={{ width: totalCount ? `${(completedCount / totalCount) * 100}%` : '0%' }}
              />
            </div>
            {totalCount > 0 && completedCount === totalCount && (
              <p className="mt-2 text-center text-xs font-medium text-[#D4AF37]">🎉 모든 미션 완료! 훌륭해요</p>
            )}
          </div>

          <div className="space-y-6">
            {lessonsWithMissions.map(lesson => {
              const done = lesson.missions.filter(m => m.isCompleted).length;
              return (
                <div key={lesson._id}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-0.5 text-xs font-semibold text-[#D4AF37]">
                        {lesson.sessionNumber}회차
                      </span>
                      <span className="text-xs text-[#636366]">{fmtDate(lesson.lessonDate)}</span>
                    </div>
                    <span className="text-xs text-[#636366]">{done}/{lesson.missions.length} 완료</span>
                  </div>

                  <div className="space-y-2">
                    {lesson.missions.map(m => (
                      <button
                        key={m.id}
                        onClick={() => toggleMission(lesson._id, m.id, m.isCompleted)}
                        className="w-full"
                      >
                        <Card className={`flex items-start gap-4 text-left transition-all ${m.isCompleted ? 'opacity-60' : ''}`}>
                          <span className={`mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                            m.isCompleted ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#4A4A4A]'
                          }`}>
                            {m.isCompleted && (
                              <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <p className={`text-sm font-medium ${m.isCompleted ? 'line-through text-[#636366]' : 'text-white'}`}>
                            {m.text}
                          </p>
                        </Card>
                      </button>
                    ))}
                  </div>

                  <Link href={`/member/lesson/${lesson._id}`}>
                    <p className="mt-2 text-right text-xs text-[#D4AF37]">
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
