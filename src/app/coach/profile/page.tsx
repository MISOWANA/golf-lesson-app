'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface User { name: string; email: string; role: string; mustChangePassword?: boolean; }

export default function CoachProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(setUser);
  }, []);

  async function logout() {
    setLogoutLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword !== confirmPassword) {
      setPwError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setPwLoading(true);
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    setPwLoading(false);

    if (!res.ok) {
      setPwError(data.error || '오류가 발생했습니다.');
      return;
    }

    setPwSuccess('비밀번호가 변경되었습니다.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setUser(prev => prev ? { ...prev, mustChangePassword: false } : prev);
  }

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">내 정보</h1>

      {user?.mustChangePassword && (
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          임시 비밀번호로 로그인했습니다. 아래에서 비밀번호를 변경해주세요.
        </div>
      )}

      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
            {user?.name?.[0] || '?'}
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              코치
            </span>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <p className="mb-4 font-semibold">비밀번호 변경</p>
        <form onSubmit={changePassword} className="space-y-3">
          <Input
            label="현재 비밀번호 (또는 임시 비밀번호)"
            type="password"
            placeholder="현재 비밀번호"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="새 비밀번호"
            type="password"
            placeholder="6자 이상"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="새 비밀번호 확인"
            type="password"
            placeholder="새 비밀번호 재입력"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-green-600">{pwSuccess}</p>}
          <Button type="submit" size="sm" loading={pwLoading} className="w-full">
            비밀번호 변경
          </Button>
        </form>
      </Card>

      <Button variant="danger" onClick={logout} loading={logoutLoading} className="w-full">
        로그아웃
      </Button>
    </div>
  );
}
