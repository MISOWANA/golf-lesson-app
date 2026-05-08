'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

const PRESET_AREAS = ['드라이버', '아이언', '어프로치', '퍼팅', '자세', '리듬', '코스 전략', '멘탈'];

interface FocusArea { area: string; note: string; }

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

  const [lessonDate, setLessonDate] = useState(toKSTLocal(new Date()));
  const [location, setLocation] = useState('');
  const [goodPoints, setGoodPoints] = useState('');
  const [improvements, setImprovements] = useState('');
  const [coachComment, setCoachComment] = useState('');
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [missions, setMissions] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  function toggleArea(area: string) {
    setFocusAreas(prev =>
      prev.some(f => f.area === area)
        ? prev.filter(f => f.area !== area)
        : [...prev, { area, note: '' }]
    );
  }

  function updateNote(area: string, note: string) {
    setFocusAreas(prev => prev.map(f => f.area === area ? { ...f, note } : f));
  }

  function addMission() { setMissions([...missions, '']); }
  function updateMission(i: number, val: string) {
    const next = [...missions]; next[i] = val; setMissions(next);
  }
  function removeMission(i: number) { setMissions(missions.filter((_, idx) => idx !== i)); }

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
      body: JSON.stringify({ goodPoints, improvements, coachComment, focusAreas, missions: missionItems, isShared: share }),
    });

    fn(false);
    router.push(`/coach/members/${memberId}`);
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl text-[#AEAEB2]">←</button>
        <h1 className="text-xl font-bold">새 레슨 기록</h1>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <Input label="레슨 날짜" type="datetime-local" value={lessonDate} onChange={e => setLessonDate(e.target.value)} className="flex-1" />
          <Input label="장소" type="text" placeholder="연습장, 필드..." value={location} onChange={e => setLocation(e.target.value)} className="flex-1" />
        </div>

        {/* 집중 영역 */}
        <div className="rounded-2xl bg-[#1C1C1E] p-4 ring-1 ring-[#2C2C2E]">
          <h2 className="mb-1 font-semibold text-white">이번 레슨 집중 영역</h2>
          <p className="mb-3 text-xs text-[#636366]">이번 레슨에서 집중한 영역을 선택하세요</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {PRESET_AREAS.map(area => {
              const selected = focusAreas.some(f => f.area === area);
              return (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    selected ? 'bg-[#D4AF37] text-black' : 'border border-[#2C2C2E] bg-[#252525] text-[#AEAEB2]'
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>
          {focusAreas.length > 0 && (
            <div className="space-y-2">
              {focusAreas.map(f => (
                <div key={f.area} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-sm font-semibold text-[#D4AF37]">{f.area}</span>
                  <input
                    type="text"
                    value={f.note}
                    onChange={e => updateNote(f.area, e.target.value)}
                    placeholder="코멘트 (선택)"
                    className="flex-1 rounded-xl border border-[#2C2C2E] bg-[#252525] px-3 py-1.5 text-sm text-white outline-none placeholder:text-[#4A4A4A] focus:border-[#D4AF37]"
                  />
                  <button onClick={() => toggleArea(f.area)} className="shrink-0 text-[#636366] hover:text-red-400">✕</button>
                </div>
              ))}
            </div>
          )}
          {focusAreas.length === 0 && (
            <p className="text-xs text-[#4A4A4A]">선택한 영역이 없습니다</p>
          )}
        </div>

        {/* 피드백 */}
        <div className="rounded-2xl bg-[#1C1C1E] p-4 ring-1 ring-[#2C2C2E] space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#D4AF37]">✅ 잘된 점</p>
            <Textarea rows={3} placeholder="이번 레슨에서 잘한 점을 입력하세요..." value={goodPoints} onChange={e => setGoodPoints(e.target.value)} />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#D4AF37]">🔧 고칠 점</p>
            <Textarea rows={3} placeholder="개선이 필요한 점을 입력하세요..." value={improvements} onChange={e => setImprovements(e.target.value)} />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#D4AF37]">💬 코멘트</p>
            <Textarea rows={3} placeholder="추가 코치 코멘트..." value={coachComment} onChange={e => setCoachComment(e.target.value)} />
          </div>
        </div>

        {/* 미션 */}
        <div className="rounded-2xl bg-[#1C1C1E] p-4 ring-1 ring-[#2C2C2E]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-white">이번 주 연습 방향</h2>
            <button onClick={addMission} className="text-sm font-medium text-[#D4AF37]">+ 추가</button>
          </div>
          <div className="space-y-2">
            {missions.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-[#636366]">{i + 1}.</span>
                <input
                  type="text"
                  value={m}
                  onChange={e => updateMission(i, e.target.value)}
                  placeholder={`미션 ${i + 1}`}
                  className="flex-1 rounded-xl border border-[#2C2C2E] bg-[#252525] px-3 py-2 text-sm text-white outline-none placeholder:text-[#636366] focus:border-[#D4AF37] focus:bg-[#2A2A2A]"
                />
                {missions.length > 1 && (
                  <button onClick={() => removeMission(i)} className="text-[#636366] hover:text-red-400">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <Button variant="secondary" onClick={() => save(false)} loading={saving} className="flex-1">임시 저장</Button>
          <Button onClick={() => save(true)} loading={sharing} className="flex-1">저장 및 공유 🚀</Button>
        </div>
      </div>
    </div>
  );
}

export default function NewLessonPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-[#636366]">로딩 중...</div>}>
      <NewLessonForm />
    </Suspense>
  );
}
