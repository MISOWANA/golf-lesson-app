'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/Card';
import { getCached, setCached } from '@/lib/clientCache';

interface Lesson {
  _id: string;
  sessionNumber: number;
  lessonDate: string;
  goodPoints: string;
  missions: { isCompleted: boolean }[];
  memberNote: string;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

interface Badge {
  icon: string;
  label: string;
  desc: string;
  unlocked: boolean;
  goal?: string;
}

function computeBadges(lessons: Lesson[]): Badge[] {
  const total = lessons.length;
  const allMissions = lessons.flatMap(l => l.missions);
  const completedMissions = allMissions.filter(m => m.isCompleted).length;
  const perfectSessions = lessons.filter(
    l => l.missions.length > 0 && l.missions.every(m => m.isCompleted)
  ).length;
  const hasNote = lessons.some(l => l.memberNote?.trim());

  return [
    { icon: '🌱', label: '첫 레슨', desc: '여정의 시작', unlocked: total >= 1, goal: '레슨 1회' },
    { icon: '⭐', label: '5회 달성', desc: '꾸준함의 시작', unlocked: total >= 5, goal: `레슨 ${total}/5회` },
    { icon: '🔥', label: '10회 달성', desc: '진정한 골퍼', unlocked: total >= 10, goal: `레슨 ${total}/10회` },
    { icon: '👑', label: '20회 달성', desc: '레전드', unlocked: total >= 20, goal: `레슨 ${total}/20회` },
    { icon: '🎯', label: '완벽한 날', desc: '미션 100% 완료', unlocked: perfectSessions >= 1, goal: '한 회차 미션 전부 완료' },
    { icon: '🏆', label: '집중력', desc: '3회 이상 완벽 완료', unlocked: perfectSessions >= 3, goal: `완벽 완료 ${perfectSessions}/3회` },
    { icon: '💪', label: '미션 10개', desc: '연습의 달인', unlocked: completedMissions >= 10, goal: `미션 ${completedMissions}/10개` },
    { icon: '📝', label: '자기 성찰', desc: '레슨 메모 작성', unlocked: hasNote, goal: '레슨 후 메모 남기기' },
  ];
}

export default function GrowthPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCached<Lesson[]>('/api/lessons');
    if (cached) { setLessons([...cached].reverse()); setLoading(false); }
    fetch('/api/lessons')
      .then(r => r.json())
      .then((data: Lesson[]) => { setLessons([...data].reverse()); setCached('/api/lessons', data); })
      .finally(() => setLoading(false));
  }, []);

  const totalSessions = lessons.length;
  const allMissions = lessons.flatMap(l => l.missions);
  const completedMissions = allMissions.filter(m => m.isCompleted).length;
  const totalMissions = allMissions.length;
  const missionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

  const chartData = lessons.map(l => ({
    name: `${l.sessionNumber}회`,
    rate: l.missions.length > 0
      ? Math.round((l.missions.filter(m => m.isCompleted).length / l.missions.length) * 100)
      : null,
  }));

  const badges = computeBadges(lessons);
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  const recentPraise = [...lessons]
    .reverse()
    .filter(l => l.goodPoints?.trim())
    .slice(0, 3);

  return (
    <div className="px-4 py-6">
      <h1 className="mb-2 text-xl font-bold">성장 분석</h1>
      <p className="mb-6 text-sm text-[#636366]">꾸준함이 실력을 만듭니다</p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-36 animate-pulse rounded-2xl bg-[#2A2A2A]" />)}
        </div>
      ) : totalSessions === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">🌱</p>
          <p className="mt-3 font-medium text-[#AEAEB2]">아직 레슨 기록이 없습니다</p>
          <p className="mt-1 text-sm text-[#636366]">레슨을 시작하면 성장 분석을 볼 수 있어요</p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* 요약 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: totalSessions, label: '총 레슨', unit: '회' },
              { value: completedMissions, label: '완료 미션', unit: '개' },
              { value: missionRate, label: '달성률', unit: '%' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl bg-[#1C1C1E] p-3 text-center ring-1 ring-[#2C2C2E]">
                <p className="text-2xl font-bold text-[#D4AF37]">{s.value}<span className="text-sm">{s.unit}</span></p>
                <p className="mt-0.5 text-xs text-[#636366]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 미션 달성률 추이 */}
          {totalSessions >= 2 && (
            <Card>
              <h2 className="font-semibold">회차별 미션 달성률</h2>
              <p className="mb-4 mt-0.5 text-xs text-[#636366]">연습에 얼마나 집중했는지 보여줍니다</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#636366' }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#636366' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    formatter={(v) => [v != null ? `${v}%` : '-', '달성률']}
                    contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: '12px', color: '#fff' }}
                    labelStyle={{ color: '#AEAEB2' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.rate === null ? '#2C2C2E'
                          : entry.rate === 100 ? '#D4AF37'
                          : entry.rate >= 50 ? '#7A6520'
                          : '#3A3A3A'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 flex gap-4 justify-center">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#D4AF37]" /><span className="text-xs text-[#636366]">100%</span></div>
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#7A6520]" /><span className="text-xs text-[#636366]">50%+</span></div>
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#3A3A3A]" /><span className="text-xs text-[#636366]">50% 미만</span></div>
              </div>
            </Card>
          )}

          {/* 획득 뱃지 */}
          {unlockedBadges.length > 0 && (
            <Card>
              <h2 className="font-semibold">획득한 뱃지</h2>
              <p className="mb-4 mt-0.5 text-xs text-[#636366]">노력이 만들어낸 성과들</p>
              <div className="grid grid-cols-2 gap-2">
                {unlockedBadges.map(b => (
                  <div key={b.label} className="flex items-center gap-3 rounded-xl bg-[#252525] p-3 ring-1 ring-[#D4AF37]/20">
                    <span className="text-2xl shrink-0">{b.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{b.label}</p>
                      <p className="text-xs text-[#636366]">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 도전 중인 뱃지 */}
          {lockedBadges.length > 0 && (
            <Card>
              <h2 className="font-semibold">도전 중인 뱃지</h2>
              <p className="mb-4 mt-0.5 text-xs text-[#636366]">계속하면 곧 달성할 수 있어요</p>
              <div className="grid grid-cols-2 gap-2">
                {lockedBadges.slice(0, 4).map(b => (
                  <div key={b.label} className="flex items-center gap-3 rounded-xl bg-[#1C1C1E] p-3 opacity-50">
                    <span className="text-2xl shrink-0 grayscale">{b.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#636366]">{b.label}</p>
                      <p className="text-xs text-[#4A4A4A]">{b.goal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 코치가 칭찬한 점 */}
          {recentPraise.length > 0 && (
            <Card>
              <h2 className="font-semibold">코치가 칭찬한 점</h2>
              <p className="mb-4 mt-0.5 text-xs text-[#636366]">최근 레슨에서 잘한 부분들</p>
              <div className="space-y-3">
                {recentPraise.map(l => (
                  <div key={l._id} className="rounded-xl bg-[#252525] p-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-xs font-semibold text-[#D4AF37]">
                        {l.sessionNumber}회차
                      </span>
                      <span className="text-xs text-[#636366]">{fmtDate(l.lessonDate)}</span>
                    </div>
                    <p className="text-sm text-[#AEAEB2] line-clamp-3">{l.goodPoints}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 레슨 여정 타임라인 */}
          <Card>
            <h2 className="font-semibold">레슨 여정</h2>
            <p className="mb-4 mt-0.5 text-xs text-[#636366]">꾸준히 달려온 발자취</p>
            <div className="relative pl-5">
              <div className="absolute left-2 top-1 bottom-1 w-px bg-[#2C2C2E]" />
              {[...lessons].reverse().map(l => {
                const perfect = l.missions.length > 0 && l.missions.every(m => m.isCompleted);
                return (
                  <div key={l._id} className="relative mb-4 last:mb-0">
                    <div className={`absolute -left-[13px] top-1 h-3 w-3 rounded-full border-2 ${
                      perfect ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#4A4A4A] bg-[#111]'
                    }`} />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{l.sessionNumber}회차</span>
                      <span className="text-xs text-[#636366]">{fmtDate(l.lessonDate)}</span>
                      {perfect && <span className="text-xs text-[#D4AF37]">미션 완료 🏆</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>
      )}
    </div>
  );
}
