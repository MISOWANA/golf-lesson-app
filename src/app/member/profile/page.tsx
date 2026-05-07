'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface User { name: string; email: string; role: string; mustChangePassword?: boolean; }
interface Coach { name: string; email: string; }

export default function MemberProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(setUser);
    fetch('/api/member/coach').then(r => r.json()).then(setCoach);
  }, []);

  async function logout() {
    setLogoutLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (newPassword !== confirmPassword) { setPwError('새 비밀번호가 일치하지 않습니다.'); return; }

    setPwLoading(true);
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setPwLoading(false);

    if (!res.ok) { setPwError(data.error || '오류가 발생했습니다.'); return; }

    setPwSuccess('비밀번호가 변경되었습니다.');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setUser(prev => prev ? { ...prev, mustChangePassword: false } : prev);
  }

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">내 정보</h1>

      {user?.mustChangePassword && (
        <div className="mb-4 rounded-xl bg-amber-900/20 border border-amber-700/40 px-4 py-3 text-sm text-amber-400">
          임시 비밀번호로 로그인했습니다. 아래에서 비밀번호를 변경해주세요.
        </div>
      )}

      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-2xl font-bold text-[#D4AF37]">
            {user?.name?.[0] || '?'}
          </div>
          <div>
            <p className="font-semibold text-lg text-white">{user?.name}</p>
            <p className="text-sm text-[#AEAEB2]">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-400">
              회원
            </span>
          </div>
        </div>
      </Card>

      {coach && (
        <Card className="mb-4">
          <p className="mb-2 text-xs font-medium text-[#636366] uppercase tracking-wide">연결된 코치</p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-black font-bold">
              {coach.name[0]}
            </div>
            <div>
              <p className="font-semibold text-white">{coach.name}</p>
              <p className="text-xs text-[#636366]">{coach.email}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <p className="mb-4 font-semibold text-white">비밀번호 변경</p>
        <form onSubmit={changePassword} className="space-y-3">
          <Input label="현재 비밀번호 (또는 임시 비밀번호)" type="password" placeholder="현재 비밀번호" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input label="새 비밀번호" type="password" placeholder="6자 이상" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label="새 비밀번호 확인" type="password" placeholder="새 비밀번호 재입력" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          {pwError && <p className="text-sm text-red-400">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-[#D4AF37]">{pwSuccess}</p>}
          <Button type="submit" size="sm" loading={pwLoading} className="w-full">비밀번호 변경</Button>
        </form>
      </Card>

      <Button variant="danger" onClick={logout} loading={logoutLoading} className="w-full">
        로그아웃
      </Button>
    </div>
  );
}
