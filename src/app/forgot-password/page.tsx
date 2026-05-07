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
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37] text-black font-bold text-lg">G</div>
            <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
          </div>
          <p className="text-sm text-[#636366]">가입한 이메일로 임시 비밀번호를 받으세요</p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="rounded-2xl bg-[#1C1C1E] ring-1 ring-[#2C2C2E] px-6 py-8">
              <p className="text-3xl mb-3">📧</p>
              <p className="font-semibold text-white">이메일을 확인해주세요</p>
              <p className="mt-2 text-sm text-[#AEAEB2]">
                <strong className="text-white">{email}</strong>로<br />임시 비밀번호를 발송했습니다.
              </p>
              <p className="mt-3 text-xs text-[#636366]">임시 비밀번호는 1시간 동안 유효합니다.</p>
            </div>
            <Link href="/login">
              <Button size="lg" className="w-full">로그인 하러 가기</Button>
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
              <div className="rounded-xl bg-red-900/20 border border-red-800/40 px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              임시 비밀번호 받기
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#636366]">
          <Link href="/login" className="font-semibold text-[#D4AF37] underline-offset-2 hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
