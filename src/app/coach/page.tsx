'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Member {
  relationId: string;
  memberId: string;
  name: string;
  email: string;
  totalLessons: number;
  remainingLessons: number;
  lastLesson: { date: string; sessionNumber: number } | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function CoachHome() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUserName(d.name || ''));
    fetch('/api/coach/members')
      .then(r => r.json())
      .then(setMembers)
      .finally(() => setLoading(false));
  }, []);

  async function generateInvite() {
    setGenLoading(true);
    const res = await fetch('/api/coach/invite', { method: 'POST' });
    const data = await res.json();
    setGenLoading(false);
    setInviteCode(data.inviteCode);
    setShowInvite(true);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(inviteCode);
    alert('초대 코드가 복사되었습니다!');
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#636366]">안녕하세요</p>
          <h1 className="text-xl font-bold">{userName || '코치'}님 👋</h1>
          <p className="text-xs text-[#636366] mt-0.5">총 {members.length}명의 회원</p>
        </div>
        <Button size="sm" onClick={generateInvite} loading={genLoading}>
          + 회원 초대
        </Button>
      </div>

      {showInvite && (
        <Card className="mb-6 border border-[#D4AF37]/40 bg-[#D4AF37]/10">
          <p className="mb-1 text-xs font-medium text-[#D4AF37]">회원 초대 코드</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold tracking-widest text-white">{inviteCode}</span>
            <Button size="sm" variant="secondary" onClick={copyCode}>복사</Button>
          </div>
          <p className="mt-2 text-xs text-[#AEAEB2]">
            회원에게 이 코드를 공유하면 연결됩니다. 코드는 1회만 사용 가능합니다.
          </p>
          <button onClick={() => setShowInvite(false)} className="mt-2 text-xs text-[#636366] hover:text-[#AEAEB2]">
            닫기
          </button>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#2A2A2A]" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">👥</p>
          <p className="mt-3 font-medium text-[#AEAEB2]">연결된 회원이 없습니다</p>
          <p className="mt-1 text-sm text-[#636366]">회원 초대 버튼으로 초대 코드를 생성해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(m => (
            <Link key={m.memberId} href={`/coach/members/${m.memberId}`}>
              <Card className="active:scale-98 flex items-center gap-4 transition-transform">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/15 text-xl font-bold text-[#D4AF37]">
                  {m.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{m.name}</p>
                  <p className="text-xs text-[#636366]">
                    {m.lastLesson
                      ? `마지막 레슨: ${m.lastLesson.sessionNumber}회차 · ${formatDate(m.lastLesson.date)}`
                      : '레슨 기록 없음'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#D4AF37]">{m.totalLessons}회</p>
                  <p className="text-xs text-[#636366]">잔여 {m.remainingLessons}회</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
