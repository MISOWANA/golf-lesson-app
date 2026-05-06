'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Lesson {
  _id: string;
  sessionNumber: number;
  lessonDate: string;
  location: string;
  goodPoints: string;
  improvements: string;
  coachComment: string;
  scores: { driver: number; iron: number; approach: number; putting: number };
  missions: { id: string; text: string; isCompleted: boolean }[];
  coachId: { name: string };
}

function avg(s: Lesson['scores']) {
  return ((s.driver + s.iron + s.approach + s.putting) / 4).toFixed(1);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function MemberHome() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [coach, setCoach] = useState<{ name: string } | null>(null);
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUserName(d.name || ''));
    fetch('/api/member/coach').then(r => r.json()).then(setCoach);
    fetch('/api/lessons')
      .then(r => r.json())
      .then(setLessons)
      .finally(() => setLoading(false));
  }, []);

  async function joinCoach() {
    if (!code.trim()) return;
    setJoining(true);
    setJoinError('');
    const res = await fetch('/api/coach/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: code }),
    });
    const data = await res.json();
    setJoining(false);
    if (!res.ok) { setJoinError(data.error); return; }
    setCoach({ name: data.coachName });
    setShowJoin(false);
    setCode('');
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">안녕하세요, {userName || '회원'}님 👋</h1>
          <p className="text-sm text-gray-500">
            {coach ? `코치: ${coach.name}` : '코치와 연결해보세요'}
          </p>
        </div>
        {!coach && (
          <Button size="sm" onClick={() => setShowJoin(true)}>코치 연결</Button>
        )}
      </div>

      {showJoin && (
        <Card className="mb-6 border-2 border-green-200 bg-green-50">
          <p className="mb-3 text-sm font-medium text-green-800">코치에게 받은 초대 코드를 입력하세요</p>
          <Input
            placeholder="예: A3B2C1D4"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            className="mb-3"
          />
          {joinError && <p className="mb-2 text-xs text-red-500">{joinError}</p>}
          <div className="flex gap-2">
            <Button onClick={joinCoach} loading={joining} size="sm" className="flex-1">연결하기</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowJoin(false)}>취소</Button>
          </div>
        </Card>
      )}

      <h2 className="mb-3 font-semibold">레슨 기록</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200" />)}
        </div>
      ) : lessons.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">📋</p>
          <p className="mt-3 font-medium text-gray-500">아직 레슨 기록이 없습니다</p>
          {!coach && <p className="mt-1 text-sm text-gray-400">코치와 연결하면 레슨 기록을 확인할 수 있어요</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map(l => (
            <Link key={l._id} href={`/member/lesson/${l._id}`}>
              <Card className="transition-transform active:scale-98">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        {l.sessionNumber}회차
                      </span>
                      <span className="text-xs text-gray-400">{fmtDate(l.lessonDate)}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {l.location || '장소 미입력'} · 코치: {(l.coachId as any)?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-700">{avg(l.scores)}</p>
                    <p className="text-xs text-gray-400">종합</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-1 text-center">
                  {[
                    { label: '드라이버', val: l.scores.driver },
                    { label: '아이언', val: l.scores.iron },
                    { label: '어프로치', val: l.scores.approach },
                    { label: '퍼팅', val: l.scores.putting },
                  ].map(({ label, val }) => (
                    <div key={label} className="rounded-lg bg-gray-50 py-1.5">
                      <p className="text-xs font-bold text-green-600">{val}</p>
                      <p className="text-[10px] text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>

                {l.goodPoints && (
                  <p className="mt-2 line-clamp-1 text-xs text-gray-500">✅ {l.goodPoints}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
