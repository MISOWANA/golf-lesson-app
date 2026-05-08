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
  missions: { id: string; text: string; isCompleted: boolean }[];
  coachId: { name: string };
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
          <p className="text-sm text-[#636366]">안녕하세요</p>
          <h1 className="text-xl font-bold">{userName || '회원'}님 👋</h1>
          {coach && <p className="text-xs text-[#636366] mt-0.5">코치: {coach.name}</p>}
        </div>
        {!coach && (
          <Button size="sm" onClick={() => setShowJoin(true)}>코치 연결</Button>
        )}
      </div>

      {!coach && !showJoin && (
        <Card className="mb-6 border border-[#2C2C2E]">
          <p className="text-sm text-[#AEAEB2]">아직 코치와 연결되지 않았습니다.</p>
          <button onClick={() => setShowJoin(true)} className="mt-2 text-sm font-medium text-[#D4AF37]">
            초대 코드 입력하기 →
          </button>
        </Card>
      )}

      {showJoin && (
        <Card className="mb-6 border border-[#D4AF37]/40 bg-[#D4AF37]/10">
          <p className="mb-3 text-sm font-medium text-white">코치에게 받은 초대 코드를 입력하세요</p>
          <Input
            placeholder="예: A3B2C1D4"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            className="mb-3"
          />
          {joinError && <p className="mb-2 text-xs text-red-400">{joinError}</p>}
          <div className="flex gap-2">
            <Button onClick={joinCoach} loading={joining} size="sm" className="flex-1">연결하기</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowJoin(false)}>취소</Button>
          </div>
        </Card>
      )}

      <h2 className="mb-3 font-semibold text-white">레슨 기록</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#2A2A2A]" />)}
        </div>
      ) : lessons.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">📋</p>
          <p className="mt-3 font-medium text-[#AEAEB2]">아직 레슨 기록이 없습니다</p>
          {!coach && <p className="mt-1 text-sm text-[#636366]">코치와 연결하면 레슨 기록을 확인할 수 있어요</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map(l => (
            <Link key={l._id} href={`/member/lesson/${l._id}`}>
              <Card className="transition-transform active:scale-98">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-0.5 text-xs font-semibold text-[#D4AF37]">
                        {l.sessionNumber}회차
                      </span>
                      <span className="text-xs text-[#636366]">{fmtDate(l.lessonDate)}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#636366]">
                      {l.location || '장소 미입력'} · 코치: {(l.coachId as any)?.name}
                    </p>
                  </div>
                </div>

                {l.missions && l.missions.length > 0 && (() => {
                  const done = l.missions.filter(m => m.isCompleted).length;
                  const total = l.missions.length;
                  const pct = Math.round((done / total) * 100);
                  return (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-[#636366]">미션 달성</span>
                        <span className={`text-xs font-semibold ${pct === 100 ? 'text-[#D4AF37]' : 'text-[#AEAEB2]'}`}>
                          {pct === 100 ? '🏆 ' : ''}{done}/{total} 완료
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#2C2C2E]">
                        <div
                          className="h-1.5 rounded-full bg-[#D4AF37] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {l.goodPoints && (
                  <p className="mt-2 line-clamp-1 text-xs text-[#AEAEB2]">✅ {l.goodPoints}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
