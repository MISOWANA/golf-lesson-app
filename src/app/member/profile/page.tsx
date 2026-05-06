'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface User { name: string; email: string; role: string; }
interface Coach { name: string; email: string; }

export default function MemberProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(setUser);
    fetch('/api/member/coach').then(r => r.json()).then(setCoach);
  }, []);

  async function logout() {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">내 정보</h1>

      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
            {user?.name?.[0] || '?'}
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">
              회원
            </span>
          </div>
        </div>
      </Card>

      {coach && (
        <Card className="mb-4">
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">연결된 코치</p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-white font-bold">
              {coach.name[0]}
            </div>
            <div>
              <p className="font-semibold">{coach.name}</p>
              <p className="text-xs text-gray-400">{coach.email}</p>
            </div>
          </div>
        </Card>
      )}

      <Button variant="danger" onClick={logout} loading={loading} className="w-full">
        로그아웃
      </Button>
    </div>
  );
}
