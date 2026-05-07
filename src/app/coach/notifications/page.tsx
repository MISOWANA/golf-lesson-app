'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface Notif {
  _id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function CoachNotifications() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(setNotifs)
      .finally(() => setLoading(false));
    fetch('/api/notifications', { method: 'PATCH' });
  }, []);

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">알림</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#2A2A2A]" />)}
        </div>
      ) : notifs.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">🔔</p>
          <p className="mt-3 text-[#AEAEB2]">알림이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <Card key={n._id} className={`${!n.isRead ? 'border-l-4 border-[#D4AF37]' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm text-white">{n.title}</p>
                  <p className="text-xs text-[#AEAEB2] mt-0.5">{n.body}</p>
                </div>
                <span className="shrink-0 text-xs text-[#636366]">{fmtDate(n.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
