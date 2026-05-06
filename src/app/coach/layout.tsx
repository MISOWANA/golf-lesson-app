import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { BottomNav } from '@/components/ui/BottomNav';

const navItems = [
  { href: '/coach', label: '회원', icon: '👥' },
  { href: '/coach/notifications', label: '알림', icon: '🔔' },
  { href: '/coach/profile', label: '내 정보', icon: '👤' },
];

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'coach') redirect('/member');

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 pb-20">{children}</div>
      <BottomNav items={navItems} />
    </div>
  );
}
