'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { Card } from '@/components/ui/Card';

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
  scores: { driver: number; iron: number; approach: number; putting: number };
  missions: Mission[];
  memberNote: string;
  memberId: { _id: string; name: string };
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });
}

const SCORE_LABELS = { driver: '드라이버', iron: '아이언', approach: '어프로치', putting: '퍼팅' } as const;

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [editMode, setEditMode] = useState(false);       // 피드백 전체 편집 모드
  const [missionEditMode, setMissionEditMode] = useState(false); // 미션만 편집 모드

  // 피드백 편집 상태
  const [tab, setTab] = useState<'good' | 'improve' | 'comment'>('good');
  const [goodPoints, setGoodPoints] = useState('');
  const [improvements, setImprovements] = useState('');
  const [coachComment, setCoachComment] = useState('');
  const [scores, setScores] = useState({ driver: 7, iron: 7, approach: 7, putting: 7 });

  // 미션 편집 상태 (피드백 편집 모드 & 독립 미션 편집 모드 공용)
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
    setScores(data.scores);
    setMissions(data.missions || []);
  }

  function cancelEdit() {
    if (lesson) syncFields(lesson);
    setEditMode(false);
  }

  function cancelMissionEdit() {
    if (lesson) setMissions(lesson.missions || []);
    setMissionEditMode(false);
  }

  // 미션 조작 헬퍼
  function addMission() {
    setMissions(prev => [...prev, { id: `m_${Date.now()}`, text: '', isCompleted: false }]);
  }
  function updateMission(i: number, text: string) {
    setMissions(prev => prev.map((m, idx) => idx === i ? { ...m, text } : m));
  }
  function removeMission(i: number) {
    setMissions(prev => prev.filter((_, idx) => idx !== i));
  }

  // 전체 피드백 저장 (미션 포함)
  async function save(share: boolean) {
    const fn = share ? setSharing : setSaving;
    fn(true);
    const res = await fetch(`/api/lessons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goodPoints, improvements, coachComment, scores, missions, isShared: share }),
    });
    fn(false);
    if (!res.ok) return;
    const updated = await res.json();
    setLesson(updated);
    setEditMode(false);
    if (share) router.push(`/coach/members/${lesson?.memberId?._id}`);
  }

  // 미션만 저장
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  const tabs = [
    { key: 'good', label: '✅ 잘된 점' },
    { key: 'improve', label: '🔧 고칠 점' },
    { key: 'comment', label: '💬 코멘트' },
  ] as const;

  // 미션 UI: 편집 모드(전체 or 독립)일 때 공용
  const showMissionEditor = editMode || missionEditMode;

  return (
    <div className="min-h-screen px-4 py-6">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-2xl">←</button>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                {lesson.sessionNumber}회차
              </span>
              {lesson.isShared
                ? <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">공유됨</span>
                : <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">비공개</span>
              }
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {fmtDate(lesson.lessonDate)} · {lesson.location || '장소 미입력'} · {lesson.memberId?.name}
            </p>
          </div>
        </div>
        {/* 공유된 레슨 수정 버튼 */}
        {lesson.isShared && !editMode && !missionEditMode && (
          <Button size="sm" variant="secondary" onClick={() => setEditMode(true)}>수정</Button>
        )}
      </div>

      <div className="space-y-4">

        {/* ── 읽기 모드: 피드백 ── */}
        {!editMode && (
          <Card>
            <div className="space-y-4">
              {lesson.goodPoints && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-green-600">✅ 잘된 점</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{lesson.goodPoints}</p>
                </div>
              )}
              {lesson.improvements && (
                <div className={lesson.goodPoints ? 'border-t border-gray-100 pt-4' : ''}>
                  <p className="mb-1 text-xs font-semibold text-orange-500">🔧 고칠 점</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{lesson.improvements}</p>
                </div>
              )}
              {lesson.coachComment && (
                <div className={(lesson.goodPoints || lesson.improvements) ? 'border-t border-gray-100 pt-4' : ''}>
                  <p className="mb-1 text-xs font-semibold text-gray-500">💬 코멘트</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{lesson.coachComment}</p>
                </div>
              )}
              {!lesson.goodPoints && !lesson.improvements && !lesson.coachComment && (
                <p className="text-sm text-gray-400">작성된 피드백이 없습니다.</p>
              )}
            </div>
          </Card>
        )}

        {/* ── 읽기 모드: 점수 ── */}
        {!editMode && (
          <Card>
            <h2 className="mb-3 font-semibold">항목별 평가</h2>
            {(['driver', 'iron', 'approach', 'putting'] as const).map((k) => (
              <ScoreBar key={k} label={SCORE_LABELS[k]} value={lesson.scores[k]} readOnly />
            ))}
          </Card>
        )}

        {/* ── 편집 모드: 피드백 + 점수 ── */}
        {editMode && (
          <>
            <Card>
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
                <Textarea rows={5} value={goodPoints}
                  onChange={e => setGoodPoints(e.target.value)}
                  placeholder="이번 레슨에서 잘한 점..." />
              )}
              {tab === 'improve' && (
                <Textarea rows={5} value={improvements}
                  onChange={e => setImprovements(e.target.value)}
                  placeholder="개선이 필요한 점..." />
              )}
              {tab === 'comment' && (
                <Textarea rows={5} value={coachComment}
                  onChange={e => setCoachComment(e.target.value)}
                  placeholder="추가 코치 코멘트..." />
              )}
            </Card>

            <Card>
              <h2 className="mb-3 font-semibold">항목별 평가</h2>
              {(['driver', 'iron', 'approach', 'putting'] as const).map((k) => (
                <ScoreBar
                  key={k}
                  label={SCORE_LABELS[k]}
                  value={scores[k]}
                  onChange={v => setScores({ ...scores, [k]: v })}
                />
              ))}
            </Card>
          </>
        )}

        {/* ── 이번 주 연습 방향 (항상 표시, 편집 모드 독립) ── */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">이번 주 연습 방향</h2>
            {!showMissionEditor && (
              <button
                onClick={() => setMissionEditMode(true)}
                className="text-sm font-medium text-green-600"
              >
                {missions.length > 0 ? '수정' : '+ 추가'}
              </button>
            )}
            {showMissionEditor && !editMode && (
              <button
                onClick={addMission}
                className="text-sm font-medium text-green-600"
              >
                + 추가
              </button>
            )}
          </div>

          {/* 읽기 모드 */}
          {!showMissionEditor && (
            missions.length === 0 ? (
              <p className="text-sm text-gray-400">등록된 연습 방향이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {missions.map((m) => (
                  <div key={m.id} className="flex items-start gap-3">
                    <span className={`mt-0.5 text-lg shrink-0 ${m.isCompleted ? 'opacity-50' : ''}`}>
                      {m.isCompleted ? '✅' : '🎯'}
                    </span>
                    <p className={`text-sm ${m.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {m.text}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}

          {/* 편집 모드 */}
          {showMissionEditor && (
            <>
              <div className="space-y-2">
                {missions.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 shrink-0">{i + 1}.</span>
                    <input
                      type="text"
                      value={m.text}
                      onChange={e => updateMission(i, e.target.value)}
                      placeholder={`미션 ${i + 1}`}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white"
                    />
                    <button
                      onClick={() => removeMission(i)}
                      className="shrink-0 text-gray-300 hover:text-red-400 text-lg leading-none"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {missions.length === 0 && (
                  <p className="text-sm text-gray-400">+ 추가 버튼으로 미션을 등록하세요.</p>
                )}
              </div>

              {/* 독립 미션 편집일 때만 저장/취소 버튼 */}
              {missionEditMode && !editMode && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={cancelMissionEdit} className="flex-1">취소</Button>
                  <Button size="sm" onClick={saveMissions} loading={savingMissions} className="flex-1">저장</Button>
                </div>
              )}
            </>
          )}
        </Card>

        {/* ── 피드백 편집 모드 버튼 ── */}
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

        {/* 회원 메모 */}
        {lesson.memberNote && (
          <Card className="border-l-4 border-blue-300">
            <p className="mb-1 text-xs font-medium text-blue-500">회원 메모</p>
            <p className="text-sm text-gray-700">{lesson.memberNote}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
