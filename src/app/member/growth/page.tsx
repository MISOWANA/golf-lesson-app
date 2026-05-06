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

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">성장 분석</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-200" />)}
        </div>
      ) : lessons.length < 2 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">📈</p>
          <p className="mt-3 font-medium text-gray-500">데이터가 부족합니다</p>
          <p className="mt-1 text-sm text-gray-400">2회차 이상 레슨이 있으면 차트를 볼 수 있어요</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 font-semibold">회차별 종합 점수</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="종합" stroke="#1B5E20" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold">항목별 점수 추이</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="드라이버" stroke="#2196F3" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="아이언" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="어프로치" stroke="#FF9800" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="퍼팅" stroke="#9C27B0" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-3 justify-center">
              {[['드라이버', '#2196F3'], ['아이언', '#4CAF50'], ['어프로치', '#FF9800'], ['퍼팅', '#9C27B0']].map(
                ([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-500">{label}</span>
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
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <Radar name="점수" dataKey="value" stroke="#1B5E20" fill="#1B5E20" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}

          <Card>
            <h2 className="mb-3 font-semibold">연습 미션 완료율</h2>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-green-500 shrink-0">
                <span className="text-xl font-bold text-green-700">{missionRate}%</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  전체 미션 <span className="font-bold text-gray-900">{totalMissions}개</span> 중
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-green-700">{doneMissions}개</span> 완료
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">총 레슨 통계</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-green-50 py-3">
                <p className="text-2xl font-bold text-green-700">{lessons.length}</p>
                <p className="text-xs text-gray-500">총 회차</p>
              </div>
              <div className="rounded-xl bg-green-50 py-3">
                <p className="text-2xl font-bold text-green-700">
                  {lessons.length > 0 ? avg(latest.scores) : '-'}
                </p>
                <p className="text-xs text-gray-500">최근 종합</p>
              </div>
              <div className="rounded-xl bg-green-50 py-3">
                <p className="text-2xl font-bold text-green-700">{missionRate}%</p>
                <p className="text-xs text-gray-500">미션 완료율</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
