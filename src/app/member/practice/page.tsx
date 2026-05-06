'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface Lesson {
  _id: string;
  sessionNumber: number;
  lessonDate: string;
  missions: { id: string; text: string; isCompleted: boolean }[];
}

function daysUntil(date: string) {
  const now = new Date();
  const lessonDate = new Date(date);
  const nextLesson = new Date(lessonDate);
  nextLesson.setDate(nextLesson.getDate() + 7);
  const diff = Math.ceil((nextLesson.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export default function PracticePage() {
  const [latest, setLatest] = useState<Lesson | null>(null);
  const [missions, setMissions] = useState<{ id: string; text: string; isCompleted: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lessons')
      .then(r => r.json())
      .then((data: Lesson[]) => {
        const l = data[0] || null;
        setLatest(l);
        if (l) setMissions(l.missions || []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleMission(missionId: string, current: boolean) {
    if (!latest) return;
    const next = !current;
    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, isCompleted: next } : m));
    await fetch(`/api/lessons/${latest._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId, isCompleted: next }),
    });
  }

  const completedCount = missions.filter(m => m.isCompleted).length;
  const total = missions.length;
  const dday = latest ? daysUntil(latest.lessonDate) : 0;

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">이번 주 연습 방향</h1>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
      ) : !latest ? (
        <div className="py-16 text-center">
          <p className="text-4xl">🎯</p>
          <p className="mt-3 font-medium text-gray-500">연습 미션이 없습니다</p>
          <p className="mt-1 text-sm text-gray-400">코치에게 레슨 기록을 받으면 미션이 표시됩니다</p>
        </div>
      ) : (
        <>
          <Card className="mb-4 bg-green-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">{latest.sessionNumber}회차 레슨</p>
                <p className="mt-0.5 text-2xl font-bold">{completedCount} / {total} 완료</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">D-{dday}</p>
                <p className="text-xs opacity-70">다음 레슨</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-green-600">
              <div
                className="h-2 rounded-full bg-white transition-all"
                style={{ width: total ? `${(completedCount / total) * 100}%` : '0%' }}
              />
            </div>
          </Card>

          {missions.length === 0 ? (
            <Card>
              <p className="text-center text-sm text-gray-400 py-8">이번 회차 미션이 없습니다</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {missions.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleMission(m.id, m.isCompleted)}
                  className="w-full"
                >
                  <Card className={`flex items-start gap-4 text-left transition-all ${
                    m.isCompleted ? 'opacity-60' : ''
                  }`}>
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
          )}

          <Link href={`/member/lesson/${latest._id}`}>
            <p className="mt-4 text-center text-sm text-green-600 underline-offset-2 hover:underline">
              전체 레슨 피드백 보기 →
            </p>
          </Link>
        </>
      )}
    </div>
  );
}
