'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'coach' | 'member' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    if (!role) { setError('역할을 선택해주세요.'); return; }

    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || '회원가입에 실패했습니다.');
      return;
    }

    router.push(data.role === 'coach' ? '/coach' : '/member');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37] text-black font-bold text-lg">G</div>
            <h1 className="text-2xl font-bold">회원가입</h1>
          </div>
          <div className="flex items-center justify-center gap-2">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? 'bg-[#D4AF37]' : 'bg-[#2C2C2E]'}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <Input label="이름" type="text" placeholder="실명을 입력하세요" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="이메일" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              <Input label="비밀번호" type="password" placeholder="8자 이상 입력" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
              <Button type="submit" size="lg" className="w-full">다음</Button>
            </>
          ) : (
            <>
              <p className="text-center text-sm font-medium text-[#AEAEB2]">사용할 역할을 선택해주세요</p>

              <button
                type="button"
                onClick={() => setRole('coach')}
                className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-colors ${
                  role === 'coach' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#2C2C2E] bg-[#1C1C1E] hover:border-[#D4AF37]/40'
                }`}
              >
                <span className="text-4xl">🏌️‍♂️</span>
                <div>
                  <p className="font-semibold text-white">코치</p>
                  <p className="text-sm text-[#636366]">회원 레슨을 기록하고 관리합니다</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('member')}
                className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-colors ${
                  role === 'member' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#2C2C2E] bg-[#1C1C1E] hover:border-[#D4AF37]/40'
                }`}
              >
                <span className="text-4xl">🏌️</span>
                <div>
                  <p className="font-semibold text-white">회원</p>
                  <p className="text-sm text-[#636366]">레슨 기록을 확인하고 성장을 추적합니다</p>
                </div>
              </button>

              {error && (
                <div className="rounded-xl bg-red-900/20 border border-red-800/40 px-4 py-3 text-sm text-red-400">{error}</div>
              )}

              <Button type="submit" size="lg" loading={loading} className="w-full">시작하기</Button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-[#636366] hover:text-[#AEAEB2]">
                이전으로
              </button>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-[#636366]">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-semibold text-[#D4AF37] underline-offset-2 hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
