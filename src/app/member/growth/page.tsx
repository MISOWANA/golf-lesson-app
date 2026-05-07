'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { Card } from '@/components/ui/Card';

interface Lesson {
  _id: string;
  sessionNumber: number;
  lessonDate: string;
  scores: { driver: number; iron: number; approach: number; putting: number };
  missions: { isCompleted: boolean }[];
}

function avg(s: Lesson['scores']) {
  return parseFloat(((s.driver + s.iron + s.approach + s.putting) / 4).toFixed(1));
}

const tooltipStyle = {
  contentStyle: { backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: '12px', color: '#fff' },
  labelStyle: { color: '#AEAEB2' },
  itemStyle: { color: '#fff' },
};

export default function GrowthPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lessons')
      .then(r => r.json())
      .then((data: Lesson[]) => setLessons([...data].reverse()))
      .finally(() => setLoading(false));
  }, []);

  const lineData = lessons.map(l => ({
    name: `${l.sessionNumber}회`,
    종합: avg(l.scores),
    드라이버: l.scores.driver,
    아이언: l.scores.iron,
    어프로치: l.scores.approach,
    퍼팅: l.scores.putting,
  }));

  const latest = lessons[lessons.length - 1];
  const radarData = latest
    ? [
        { category: '드라이버', value: latest.scores.driver },
        { category: '아이언', value: latest.scores.iron },
        { category: '어프로치', value: latest.scores.approach },
        { category: '퍼팅', value: latest.scores.putting },
      ]
    : [];

  const totalMissions = lessons.reduce((s, l) => s + l.missions.length, 0);
  const doneMissions = lessons.reduce((s, l) => s + l.missions.filter(m => m.isCompleted).length, 0);
  const missionRate = totalMissions > 0 ? Math.round((doneMissions / totalMissions) * 100) : 0;

  const tickStyle = { fontSize: 11, fill: '#636366' };

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">성장 분석</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-36 animate-pulse rounded-2xl bg-[#2A2A2A]" />)}
        </div>
      ) : lessons.length < 2 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">📈</p>
          <p className="mt-3 font-medium text-[#AEAEB2]">데이터가 부족합니다</p>
          <p className="mt-1 text-sm text-[#636366]">2회차 이상 레슨이 있으면 차트를 볼 수 있어요</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 font-semibold">회차별 종합 점수</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
                <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="종합" stroke="#D4AF37" strokeWidth={2.5} dot={{ r: 4, fill: '#D4AF37' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold">항목별 점수 추이</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
                <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="드라이버" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="아이언" stroke="#34D399" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="어프로치" stroke="#FBBF24" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="퍼팅" stroke="#A78BFA" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-3 justify-center">
              {[['드라이버', '#60A5FA'], ['아이언', '#34D399'], ['어프로치', '#FBBF24'], ['퍼팅', '#A78BFA']].map(
                ([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-[#AEAEB2]">{label}</span>
                  </div>
                )
              )}
            </div>
          </Card>

          {radarData.length > 0 && (
            <Card>
              <h2 className="mb-4 font-semibold">최근 회차 레이더</h2>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2C2C2E" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: '#AEAEB2' }} />
                  <Radar name="점수" dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}

          <Card>
            <h2 className="mb-3 font-semibold">연습 미션 완료율</h2>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#D4AF37] shrink-0">
                <span className="text-xl font-bold text-[#D4AF37]">{missionRate}%</span>
              </div>
              <div>
                <p className="text-sm text-[#AEAEB2]">
                  전체 미션 <span className="font-bold text-white">{totalMissions}개</span> 중
                </p>
                <p className="text-sm text-[#AEAEB2]">
                  <span className="font-bold text-[#D4AF37]">{doneMissions}개</span> 완료
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">총 레슨 통계</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-[#252525] py-3">
                <p className="text-2xl font-bold text-[#D4AF37]">{lessons.length}</p>
                <p className="text-xs text-[#636366]">총 회차</p>
              </div>
              <div className="rounded-xl bg-[#252525] py-3">
                <p className="text-2xl font-bold text-[#D4AF37]">
                  {lessons.length > 0 ? avg(latest.scores) : '-'}
                </p>
                <p className="text-xs text-[#636366]">최근 종합</p>
              </div>
              <div className="rounded-xl bg-[#252525] py-3">
                <p className="text-2xl font-bold text-[#D4AF37]">{missionRate}%</p>
                <p className="text-xs text-[#636366]">미션 완료율</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
