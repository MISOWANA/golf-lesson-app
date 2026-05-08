'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';

interface FocusArea { area: string; note: string; }

interface Lesson {
  _id: string;
  sessionNumber: number;
  lessonDate: string;
  location: string;
  goodPoints: string;
  improvements: string;
  coachComment: string;
  focusAreas: FocusArea[];
  missions: { id: string; text: string; isCompleted: boolean }[];
  memberNote: string;
  coachId: { name: string };
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });
}

export default function MemberLessonDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [memberNote, setMemberNote] = useState('');
  const [editNote, setEditNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [missions, setMissions] = useState<{ id: string; text: string; isCompleted: boolean }[]>([]);

  useEffect(() => {
    fetch(`/api/lessons/${id}`).then(r => r.json()).then(data => {
      setLesson(data);
      setMemberNote(data.memberNote || '');
      setMissions(data.missions || []);
    });
  }, [id]);

  async function toggleMission(missionId: string, current: boolean) {
    const next = !current;
    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, isCompleted: next } : m));
    await fetch(`/api/lessons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId, isCompleted: next }),
    });
  }

  async function saveNote() {
    setSavingNote(true);
    await fetch(`/api/lessons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberNote }),
    });
    setSavingNote(false);
    setEditNote(false);
  }

  if (!lesson) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
    </div>
  );

  const completedCount = missions.filter(m => m.isCompleted).length;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl text-[#AEAEB2]">←</button>
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-0.5 text-xs font-semibold text-[#D4AF37]">
              {lesson.sessionNumber}회차
            </span>
          </div>
          <p className="mt-1 text-sm text-[#636366]">
            {fmtDate(lesson.lessonDate)} · {lesson.location || '장소 미입력'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {(lesson.focusAreas ?? []).length > 0 && (
          <Card>
            <h2 className="mb-3 font-semibold text-white">이번 레슨 집중 영역</h2>
            <div className="flex flex-wrap gap-2">
              {(lesson.focusAreas ?? []).map(f => (
                <div key={f.area} className="rounded-xl bg-[#252525] px-3 py-2">
                  <p className="text-sm font-semibold text-[#D4AF37]">{f.area}</p>
                  {f.note && <p className="mt-0.5 text-xs text-[#AEAEB2]">{f.note}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[#D4AF37]">✅ 잘된 점</p>
              <p className="text-sm text-[#AEAEB2] whitespace-pre-wrap">
                {lesson.goodPoints || <span className="text-[#636366]">내용 없음</span>}
              </p>
            </div>
            <div className="border-t border-[#2C2C2E] pt-4">
              <p className="mb-1.5 text-xs font-semibold text-[#D4AF37]">🔧 고칠 점</p>
              <p className="text-sm text-[#AEAEB2] whitespace-pre-wrap">
                {lesson.improvements || <span className="text-[#636366]">내용 없음</span>}
              </p>
            </div>
            <div className="border-t border-[#2C2C2E] pt-4">
              <p className="mb-1.5 text-xs font-semibold text-[#D4AF37]">💬 코멘트</p>
              <p className="text-sm text-[#AEAEB2] whitespace-pre-wrap">
                {lesson.coachComment || <span className="text-[#636366]">내용 없음</span>}
              </p>
            </div>
          </div>
        </Card>

        {missions.length > 0 && (
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">이번 주 연습 방향</h2>
              <span className="text-sm font-medium text-[#D4AF37]">{completedCount}/{missions.length} 완료</span>
            </div>
            <div className="mb-3 h-2 rounded-full bg-[#2C2C2E]">
              <div
                className="h-2 rounded-full bg-[#D4AF37] transition-all"
                style={{ width: missions.length ? `${(completedCount / missions.length) * 100}%` : '0%' }}
              />
            </div>
            <div className="space-y-3">
              {missions.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleMission(m.id, m.isCompleted)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span className={`mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                    m.isCompleted ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#4A4A4A]'
                  }`}>
                    {m.isCompleted && (
                      <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <p className={`text-sm ${m.isCompleted ? 'text-[#636366] line-through' : 'text-[#AEAEB2]'}`}>
                    {m.text}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-white">내 메모</h2>
            {!editNote && (
              <button onClick={() => setEditNote(true)} className="text-sm text-[#D4AF37]">
                {memberNote ? '수정' : '+ 추가'}
              </button>
            )}
          </div>
          {editNote ? (
            <>
              <Textarea
                rows={4}
                value={memberNote}
                onChange={e => setMemberNote(e.target.value)}
                placeholder="레슨 후 느낀 점이나 메모를 남겨보세요..."
                autoFocus
              />
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={saveNote} loading={savingNote} className="flex-1">저장</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditNote(false)}>취소</Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#AEAEB2] whitespace-pre-wrap">
              {memberNote || <span className="text-[#636366]">아직 메모가 없습니다</span>}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
