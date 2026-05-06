'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ScoreBar } from '@/components/ui/ScoreBar';

function toKSTLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function NewLessonForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberId = searchParams.get('memberId') || '';

  const [tab, setTab] = useState<'good' | 'improve' | 'comment'>('good');
  const [lessonDate, setLessonDate] = useState(toKSTLocal(new Date()));
  const [location, setLocation] = useState('');
  const [goodPoints, setGoodPoints] = useState('');
  const [improvements, setImprovements] = useState('');
  const [coachComment, setCoachComment] = useState('');
  const [scores, setScores] = useState({ driver: 7, iron: 7, approach: 7, putting: 7 });
  const [missions, setMissions] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const scoreLabels = [
    { key: 'driver', label: '드라이버' },
    { key: 'iron', label: '아이언' },
    { key: 'approach', label: '어프로치' },
    { key: 'putting', label: '퍼팅' },
  ] as const;

  function addMission() {
    setMissions([...missions, '']);
  }

  function updateMission(i: number, val: string) {
    const next = [...missions];
    next[i] = val;
    setMissions(next);
  }

  function removeMission(i: number) {
    setMissions(missions.filter((_, idx) => idx !== i));
  }

  async function save(share: boolean) {
    const fn = share ? setSharing : setSaving;
    fn(true);

    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, location, lessonDate }),
    });

    if (!res.ok) { fn(false); alert('레슨 생성 실패'); return; }

    const lesson = await res.json();

    const missionItems = missions
      .filter(m => m.trim())
      .map((text, i) => ({ id: `mission_${i}`, text, isCompleted: false }));

    await fetch(`/api/lessons/${lesson._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goodPoints, improvements, coachComment, scores,
        missions: missionItems,
        isShared: share,
      }),
    });

    fn(false);
    router.push(`/coach/members/${memberId}`);
  }

  const tabs = [
    { key: 'good', label: '✅ 잘된 점' },
    { key: 'improve', label: '🔧 고칠 점' },
    { key: 'comment', label: '💬 코멘트' },
  ] as const;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl">←</button>
        <h1 className="text-xl font-bold">새 레슨 기록</h1>
      </div>

      <div className="space-y-5">
        <div className="flex gap-3">
          <Input
            label="레슨 날짜"
            type="datetime-local"
            value={lessonDate}
            onChange={e => setLessonDate(e.target.value)}
            className="flex-1"
          />
          <Input
            label="장소"
            type="text"
            placeholder="연습장, 필드..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-green-700 text-white' : 'text-gray-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'good' && (
            <Textarea
              rows={5}
              placeholder="이번 레슨에서 잘한 점을 입력하세요..."
              value={goodPoints}
              onChange={e => setGoodPoints(e.target.value)}
            />
          )}
          {tab === 'improve' && (
            <Textarea
              rows={5}
              placeholder="개선이 필요한 점을 입력하세요..."
              value={improvements}
              onChange={e => setImprovements(e.target.value)}
            />
          )}
          {tab === 'comment' && (
            <Textarea
              rows={5}
              placeholder="추가 코치 코멘트..."
              value={coachComment}
              onChange={e => setCoachComment(e.target.value)}
            />
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-3 font-semibold">항목별 평가</h2>
          {scoreLabels.map(({ key, label }) => (
            <ScoreBar
              key={key}
              label={label}
              value={scores[key]}
              onChange={v => setScores({ ...scores, [key]: v })}
            />
          ))}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">이번 주 연습 방향</h2>
            <button onClick={addMission} className="text-sm font-medium text-green-700">+ 추가</button>
          </div>
          <div className="space-y-2">
            {missions.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{i + 1}.</span>
                <input
                  type="text"
                  value={m}
                  onChange={e => updateMission(i, e.target.value)}
                  placeholder={`미션 ${i + 1}`}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white"
                />
                {missions.length > 1 && (
                  <button onClick={() => removeMission(i)} className="text-gray-400 hover:text-red-500">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <Button variant="secondary" onClick={() => save(false)} loading={saving} className="flex-1">
            임시 저장
          </Button>
          <Button onClick={() => save(true)} loading={sharing} className="flex-1">
            저장 및 공유 🚀
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NewLessonPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-400">로딩 중...</div>}>
      <NewLessonForm />
    </Suspense>
  );
}
