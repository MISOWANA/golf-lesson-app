import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { BottomNav } from '@/components/ui/BottomNav';

const navItems = [
  { href: '/member', label: '레슨 기록', icon: '📋' },
  { href: '/member/practice', label: '연습', icon: '🎯' },
  { href: '/member/growth', label: '성장 분석', icon: '📈' },
  { href: '/member/profile', label: '내 정보', icon: '👤' },
];

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'member') redirect('/coach');

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 pb-20">{children}</div>
      <BottomNav items={navItems} />
    </div>
  );
}
