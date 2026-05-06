'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ScoreBar } from '@/components/ui/ScoreBar';

interface Lesson {
  _id: string;
  sessionNumber: number;
  lessonDate: string;
  location: string;
  isShared: boolean;
  goodPoints: string;
  improvements: string;
  coachComment: string;
  scores: { driver: number; iron: number; approach: number; putting: number };
  missions: { id: string; text: string; isCompleted: boolean }[];
  memberId: { name: string };
}

function avg(s: Lesson['scores']) {
  return ((s.driver + s.iron + s.approach + s.putting) / 4).toFixed(1);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberName, setMemberName] = useState('');

  useEffect(() => {
    fetch(`/api/lessons?memberId=${id}`)
      .then(r => r.json())
      .then(data => {
        setLessons(data);
        if (data[0]) setMemberName((data[0].memberId as any)?.name || '');
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/coach" className="text-2xl">←</Link>
        <div>
          <h1 className="text-xl font-bold">{memberName || '회원'} 레슨 기록</h1>
          <p className="text-sm text-gray-500">총 {lessons.length}회차</p>
        </div>
        <Link href={`/coach/lesson/new?memberId=${id}`} className="ml-auto">
          <Button size="sm">+ 새 레슨</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200" />)}
        </div>
      ) : lessons.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">📋</p>
          <p className="mt-3 font-medium text-gray-500">레슨 기록이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map(l => (
            <Link key={l._id} href={`/coach/lesson/${l._id}`}>
              <Card className="transition-transform active:scale-98">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      {l.sessionNumber}회차
                    </span>
                    <p className="mt-1 text-sm text-gray-500">{fmtDate(l.lessonDate)} · {l.location || '장소 미입력'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-700">{avg(l.scores)}</p>
                    <p className="text-xs text-gray-400">종합</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <ScoreBar label="드라이버" value={l.scores.driver} readOnly />
                  <ScoreBar label="아이언" value={l.scores.iron} readOnly />
                  <ScoreBar label="어프로치" value={l.scores.approach} readOnly />
                  <ScoreBar label="퍼팅" value={l.scores.putting} readOnly />
                </div>

                {l.goodPoints && (
                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">✅ {l.goodPoints}</p>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs ${l.isShared ? 'text-green-600' : 'text-gray-400'}`}>
                    {l.isShared ? '✓ 공유됨' : '미공유'}
                  </span>
                  <span className="text-xs text-gray-400">
                    미션 {l.missions.filter(m => m.isCompleted).length}/{l.missions.length} 완료
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
