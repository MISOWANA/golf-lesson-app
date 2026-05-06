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
        <div className="mb-10 text-center">
          <div className="mb-3 text-5xl">⛳</div>
          <h1 className="text-2xl font-bold text-green-800">GolfCoach Pro</h1>
          <p className="mt-1 text-sm text-gray-500">골프 레슨 기록 플랫폼</p>
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
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <Button type="submit" size="lg" loading={loading} className="w-full">
            로그인
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/forgot-password" className="font-semibold text-green-700 underline-offset-2 hover:underline">
            비밀번호를 잊으셨나요?
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <Link href="/register" className="font-semibold text-green-700 underline-offset-2 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
