'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || '로그인에 실패했습니다.');
      return;
    }

    const base = data.role === 'coach' ? '/coach' : '/member';
    router.push(data.mustChangePassword ? `${base}/profile` : base);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37] text-black font-bold text-xl">G</div>
            <h1 className="text-2xl font-bold tracking-tight">GolfCoach Pro</h1>
          </div>
          <p className="text-sm text-[#636366]">골프 레슨 기록 플랫폼</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="rounded-xl bg-red-900/20 border border-red-800/40 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
            로그인
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[#636366]">
          <Link href="/forgot-password" className="font-semibold text-[#D4AF37] underline-offset-2 hover:underline">
            비밀번호를 잊으셨나요?
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-[#636366]">
          계정이 없으신가요?{' '}
          <Link href="/register" className="font-semibold text-[#D4AF37] underline-offset-2 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
