'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Lesson {
  _id: string;
  sessionNumber: number;
  lessonDate: string;
  location: string;
  isShared: boolean;
  focusAreas: { area: string; note: string }[];
  goodPoints: string;
}

interface MemberDetail {
  relationId: string;
  memberId: string;
  name: string;
  email: string;
  connectedAt: string;
  totalLessons: number;
  remainingLessons: number;
  lessons: Lesson[];
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: memberId } = use(params);
  const router = useRouter();

  const [data, setData] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalLessons, setTotalLessons] = useState(0);
  const [remainingLessons, setRemainingLessons] = useState(0);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch(`/api/coach/members/${memberId}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setTotalLessons(d.totalLessons);
        setRemainingLessons(d.remainingLessons);
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  function clamp(val: number) { return Math.max(0, val); }

  async function saveLessons() {
    setSaveMsg(''); setSaveLoading(true);
    const res = await fetch(`/api/coach/members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalLessons, remainingLessons }),
    });
    const result = await res.json();
    setSaveLoading(false);
    if (!res.ok) {
      setSaveMsg(result.error);
    } else {
      setSaveMsg('저장되었습니다.');
      setData(prev => prev ? { ...prev, totalLessons, remainingLessons } : prev);
      setTimeout(() => setSaveMsg(''), 2000);
    }
  }

  async function disconnect() {
    setDisconnecting(true);
    const res = await fetch(`/api/coach/members/${memberId}`, { method: 'DELETE' });
    setDisconnecting(false);
    if (res.ok) { router.push('/coach'); router.refresh(); }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#2A2A2A]" />)}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#636366]">회원을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const usedLessons = data.totalLessons - data.remainingLessons;
  const lessonRate = data.totalLessons > 0 ? Math.round((usedLessons / data.totalLessons) * 100) : 0;

  return (
    <div className="px-4 py-6">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-[#636366] hover:text-[#AEAEB2]">
        ← 뒤로
      </button>

      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/15 text-3xl font-bold text-[#D4AF37]">
            {data.name[0]}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-white">{data.name}</p>
            <p className="text-sm text-[#AEAEB2]">{data.email}</p>
            <p className="mt-1 text-xs text-[#636366]">연결일 {fmtDate(data.connectedAt)}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-[#636366]">
            <span>레슨 진행률</span>
            <span>{usedLessons} / {data.totalLessons}회 완료</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#2C2C2E]">
            <div className="h-2.5 rounded-full bg-[#D4AF37] transition-all duration-500" style={{ width: `${lessonRate}%` }} />
          </div>
          <p className="mt-1 text-right text-xs font-medium text-[#D4AF37]">잔여 {data.remainingLessons}회</p>
        </div>
      </Card>

      <Card className="mb-4">
        <p className="mb-4 font-semibold text-white">레슨권 관리</p>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-[#636366]">총 레슨 수</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setTotalLessons(v => clamp(v - 1))} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2A2A] text-xl font-bold text-[#AEAEB2] hover:bg-[#333333] active:scale-95">−</button>
              <span className="flex-1 text-center text-2xl font-bold text-white">{totalLessons}<span className="ml-1 text-sm font-normal text-[#636366]">회</span></span>
              <button onClick={() => setTotalLessons(v => v + 1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/15 text-xl font-bold text-[#D4AF37] hover:bg-[#D4AF37]/25 active:scale-95">+</button>
            </div>
          </div>

          <div className="border-t border-[#2C2C2E] pt-4">
            <p className="mb-2 text-xs font-medium text-[#636366]">잔여 레슨 수</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setRemainingLessons(v => clamp(v - 1))} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2A2A] text-xl font-bold text-[#AEAEB2] hover:bg-[#333333] active:scale-95">−</button>
              <span className="flex-1 text-center text-2xl font-bold text-[#D4AF37]">{remainingLessons}<span className="ml-1 text-sm font-normal text-[#636366]">회</span></span>
              <button onClick={() => setRemainingLessons(v => v + 1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/15 text-xl font-bold text-[#D4AF37] hover:bg-[#D4AF37]/25 active:scale-95">+</button>
            </div>
          </div>
        </div>

        {saveMsg && (
          <p className={`mt-3 text-center text-sm ${saveMsg === '저장되었습니다.' ? 'text-[#D4AF37]' : 'text-red-400'}`}>
            {saveMsg}
          </p>
        )}

        <Button
          onClick={saveLessons}
          loading={saveLoading}
          size="sm"
          className="mt-4 w-full"
          disabled={totalLessons === data.totalLessons && remainingLessons === data.remainingLessons}
        >
          저장하기
        </Button>
      </Card>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold text-white">레슨 기록 <span className="text-sm font-normal text-[#636366]">({data.lessons.length}회)</span></p>
          <Link href={`/coach/lesson/new?memberId=${memberId}`}>
            <Button size="sm">+ 레슨 등록</Button>
          </Link>
        </div>

        {data.lessons.length === 0 ? (
          <Card>
            <div className="py-8 text-center">
              <p className="text-3xl">📋</p>
              <p className="mt-2 text-sm text-[#AEAEB2]">아직 레슨 기록이 없습니다.</p>
              <p className="mt-1 text-xs text-[#636366]">위 버튼으로 첫 레슨을 등록해보세요.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.lessons.map(lesson => (
              <Link key={lesson._id} href={`/coach/lesson/${lesson._id}`}>
                <Card className="transition-transform active:scale-98">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-0.5 text-xs font-semibold text-[#D4AF37]">
                        {lesson.sessionNumber}회차
                      </span>
                      <span className="text-xs text-[#636366]">{fmtDate(lesson.lessonDate)}</span>
                      {!lesson.isShared && (
                        <span className="rounded-full bg-[#2A2A2A] px-2 py-0.5 text-xs text-[#636366]">비공개</span>
                      )}
                    </div>
                  </div>
                  {lesson.location && (
                    <p className="mt-1.5 text-xs text-[#636366]">📍 {lesson.location}</p>
                  )}
                  {(lesson.focusAreas ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(lesson.focusAreas ?? []).map(f => (
                        <span key={f.area} className="rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-xs font-medium text-[#D4AF37]">
                          {f.area}
                        </span>
                      ))}
                    </div>
                  )}
                  {lesson.goodPoints && (
                    <p className="mt-1.5 line-clamp-1 text-xs text-[#AEAEB2]">✅ {lesson.goodPoints}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full rounded-xl border border-red-900/50 py-3 text-sm font-medium text-red-500 hover:bg-red-900/20 active:bg-red-900/30"
        >
          회원 연결 해제
        </button>
      ) : (
        <Card className="border border-red-900/50 bg-red-900/10">
          <p className="mb-3 text-center text-sm font-medium text-red-400">
            {data.name} 회원과의 연결을 해제할까요?
          </p>
          <p className="mb-4 text-center text-xs text-red-500/70">레슨 기록은 삭제되지 않습니다.</p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" className="flex-1" onClick={disconnect} loading={disconnecting}>연결 해제</Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowConfirm(false)}>취소</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
