'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const PRESET_AREAS = ['드라이버', '아이언', '어프로치', '퍼팅', '자세', '리듬', '코스 전략', '멘탈'];

interface FocusArea { area: string; note: string; }
interface Mission { id: string; text: string; isCompleted: boolean; }

interface Lesson {
  _id: string;
  sessionNumber: number;
  lessonDate: string;
  location: string;
  isShared: boolean;
  goodPoints: string;
  improvements: string;
  coachComment: string;
  focusAreas: FocusArea[];
  missions: Mission[];
  memberNote: string;
  memberId: { _id: string; name: string };
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });
}

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [missionEditMode, setMissionEditMode] = useState(false);

  const [goodPoints, setGoodPoints] = useState('');
  const [improvements, setImprovements] = useState('');
  const [coachComment, setCoachComment] = useState('');
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);

  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [savingMissions, setSavingMissions] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${id}`).then(r => r.json()).then((data: Lesson) => {
      setLesson(data);
      syncFields(data);
      if (!data.isShared) setEditMode(true);
    });
  }, [id]);

  function syncFields(data: Lesson) {
    setGoodPoints(data.goodPoints || '');
    setImprovements(data.improvements || '');
    setCoachComment(data.coachComment || '');
    setFocusAreas(data.focusAreas || []);
    setMissions(data.missions || []);
  }

  function cancelEdit() { if (lesson) syncFields(lesson); setEditMode(false); }
  function cancelMissionEdit() { if (lesson) setMissions(lesson.missions || []); setMissionEditMode(false); }

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

  function addMission() { setMissions(prev => [...prev, { id: `m_${Date.now()}`, text: '', isCompleted: false }]); }
  function updateMission(i: number, text: string) { setMissions(prev => prev.map((m, idx) => idx === i ? { ...m, text } : m)); }
  function removeMission(i: number) { setMissions(prev => prev.filter((_, idx) => idx !== i)); }

  async function save(share: boolean) {
    const fn = share ? setSharing : setSaving;
    fn(true);
    const res = await fetch(`/api/lessons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goodPoints, improvements, coachComment, focusAreas, missions, isShared: share }),
    });
    fn(false);
    if (!res.ok) return;
    const updated = await res.json();
    setLesson(updated);
    setEditMode(false);
    if (share) router.push(`/coach/members/${lesson?.memberId?._id}`);
  }

  async function saveMissions() {
    setSavingMissions(true);
    const res = await fetch(`/api/lessons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missions }),
    });
    setSavingMissions(false);
    if (!res.ok) return;
    const updated = await res.json();
    setLesson(updated);
    setMissions(updated.missions || []);
    setMissionEditMode(false);
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
      </div>
    );
  }

  const showMissionEditor = editMode || missionEditMode;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-2xl text-[#AEAEB2]">←</button>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-0.5 text-xs font-semibold text-[#D4AF37]">
                {lesson.sessionNumber}회차
              </span>
              {lesson.isShared
                ? <span className="rounded-full bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-400">공유됨</span>
                : <span className="rounded-full bg-[#2A2A2A] px-2.5 py-0.5 text-xs font-medium text-[#636366]">비공개</span>
              }
            </div>
            <p className="mt-1 text-xs text-[#636366]">
              {fmtDate(lesson.lessonDate)} · {lesson.location || '장소 미입력'} · {lesson.memberId?.name}
            </p>
          </div>
        </div>
        {lesson.isShared && !editMode && !missionEditMode && (
          <Button size="sm" variant="secondary" onClick={() => setEditMode(true)}>수정</Button>
        )}
      </div>

      <div className="space-y-4">

        {/* 보기 모드 */}
        {!editMode && (
          <>
            {/* 집중 영역 */}
            <Card>
              <h2 className="mb-3 font-semibold text-white">이번 레슨 집중 영역</h2>
              {(lesson.focusAreas ?? []).length === 0 ? (
                <p className="text-sm text-[#636366]">등록된 집중 영역이 없습니다.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(lesson.focusAreas ?? []).map(f => (
                    <div key={f.area} className="rounded-xl bg-[#252525] px-3 py-2">
                      <p className="text-sm font-semibold text-[#D4AF37]">{f.area}</p>
                      {f.note && <p className="mt-0.5 text-xs text-[#AEAEB2]">{f.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 피드백 */}
            <Card>
              <div className="space-y-4">
                {lesson.goodPoints && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-[#D4AF37]">✅ 잘된 점</p>
                    <p className="text-sm text-[#AEAEB2] whitespace-pre-wrap">{lesson.goodPoints}</p>
                  </div>
                )}
                {lesson.improvements && (
                  <div className={lesson.goodPoints ? 'border-t border-[#2C2C2E] pt-4' : ''}>
                    <p className="mb-1 text-xs font-semibold text-orange-400">🔧 고칠 점</p>
                    <p className="text-sm text-[#AEAEB2] whitespace-pre-wrap">{lesson.improvements}</p>
                  </div>
                )}
                {lesson.coachComment && (
                  <div className={(lesson.goodPoints || lesson.improvements) ? 'border-t border-[#2C2C2E] pt-4' : ''}>
                    <p className="mb-1 text-xs font-semibold text-[#636366]">💬 코멘트</p>
                    <p className="text-sm text-[#AEAEB2] whitespace-pre-wrap">{lesson.coachComment}</p>
                  </div>
                )}
                {!lesson.goodPoints && !lesson.improvements && !lesson.coachComment && (
                  <p className="text-sm text-[#636366]">작성된 피드백이 없습니다.</p>
                )}
              </div>
            </Card>
          </>
        )}

        {/* 수정 모드 */}
        {editMode && (
          <>
            {/* 집중 영역 편집 */}
            <Card>
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
            </Card>

            {/* 피드백 편집 */}
            <Card>
              <div className="space-y-4">
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-[#D4AF37]">✅ 잘된 점</p>
                  <Textarea rows={3} value={goodPoints} onChange={e => setGoodPoints(e.target.value)} placeholder="이번 레슨에서 잘한 점..." />
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-orange-400">🔧 고칠 점</p>
                  <Textarea rows={3} value={improvements} onChange={e => setImprovements(e.target.value)} placeholder="개선이 필요한 점..." />
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-[#636366]">💬 코멘트</p>
                  <Textarea rows={3} value={coachComment} onChange={e => setCoachComment(e.target.value)} placeholder="추가 코치 코멘트..." />
                </div>
              </div>
            </Card>
          </>
        )}

        {/* 미션 */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-white">이번 주 연습 방향</h2>
            {!showMissionEditor && (
              <button onClick={() => setMissionEditMode(true)} className="text-sm font-medium text-[#D4AF37]">
                {missions.length > 0 ? '수정' : '+ 추가'}
              </button>
            )}
            {showMissionEditor && !editMode && (
              <button onClick={addMission} className="text-sm font-medium text-[#D4AF37]">+ 추가</button>
            )}
          </div>

          {!showMissionEditor && (
            missions.length === 0 ? (
              <p className="text-sm text-[#636366]">등록된 연습 방향이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {missions.map(m => (
                  <div key={m.id} className="flex items-start gap-3">
                    <span className={`mt-0.5 text-lg shrink-0 ${m.isCompleted ? 'opacity-50' : ''}`}>
                      {m.isCompleted ? '✅' : '🎯'}
                    </span>
                    <p className={`text-sm ${m.isCompleted ? 'text-[#636366] line-through' : 'text-[#AEAEB2]'}`}>
                      {m.text}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}

          {showMissionEditor && (
            <>
              <div className="space-y-2">
                {missions.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className="text-sm text-[#636366] shrink-0">{i + 1}.</span>
                    <input
                      type="text"
                      value={m.text}
                      onChange={e => updateMission(i, e.target.value)}
                      placeholder={`미션 ${i + 1}`}
                      className="flex-1 rounded-xl border border-[#2C2C2E] bg-[#252525] px-3 py-2 text-sm text-white outline-none placeholder:text-[#636366] focus:border-[#D4AF37] focus:bg-[#2A2A2A]"
                    />
                    <button onClick={() => removeMission(i)} className="shrink-0 text-[#636366] hover:text-red-400 text-lg leading-none">✕</button>
                  </div>
                ))}
                {missions.length === 0 && (
                  <p className="text-sm text-[#636366]">+ 추가 버튼으로 미션을 등록하세요.</p>
                )}
              </div>
              {missionEditMode && !editMode && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={cancelMissionEdit} className="flex-1">취소</Button>
                  <Button size="sm" onClick={saveMissions} loading={savingMissions} className="flex-1">저장</Button>
                </div>
              )}
            </>
          )}
        </Card>

        {editMode && (
          lesson.isShared ? (
            <div className="flex gap-3 pb-8">
              <Button variant="secondary" onClick={cancelEdit} className="flex-1">취소</Button>
              <Button onClick={() => save(true)} loading={saving} className="flex-1">저장</Button>
            </div>
          ) : (
            <div className="flex gap-3 pb-8">
              <Button variant="secondary" onClick={() => save(false)} loading={saving} className="flex-1">임시 저장</Button>
              <Button onClick={() => save(true)} loading={sharing} className="flex-1">저장 및 공유 🚀</Button>
            </div>
          )
        )}

        {lesson.memberNote && (
          <Card className="border-l-4 border-blue-700/60">
            <p className="mb-1 text-xs font-medium text-blue-400">회원 메모</p>
            <p className="text-sm text-[#AEAEB2]">{lesson.memberNote}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
