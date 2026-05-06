'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || '오류가 발생했습니다.');
      return;
    }

    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mb-3 text-5xl">⛳</div>
          <h1 className="text-2xl font-bold text-green-800">비밀번호 찾기</h1>
          <p className="mt-1 text-sm text-gray-500">가입한 이메일로 임시 비밀번호를 받으세요</p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="rounded-2xl bg-green-50 border border-green-200 px-6 py-8">
              <p className="text-3xl mb-3">📧</p>
              <p className="font-semibold text-green-800">이메일을 확인해주세요</p>
              <p className="mt-2 text-sm text-gray-500">
                <strong>{email}</strong>로<br />임시 비밀번호를 발송했습니다.
              </p>
              <p className="mt-3 text-xs text-gray-400">임시 비밀번호는 1시간 동안 유효합니다.</p>
            </div>
            <Link href="/login">
              <Button size="lg" className="w-full">
                로그인 하러 가기
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="가입한 이메일"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              임시 비밀번호 받기
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="font-semibold text-green-700 underline-offset-2 hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
