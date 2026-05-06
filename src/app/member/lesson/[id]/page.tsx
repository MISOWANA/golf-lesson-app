'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { ScoreBar } from '@/components/ui/ScoreBar';

interface Lesson {
  _id: string;
  sessionNumber: number;
  lessonDate: string;
  location: string;
  goodPoints: string;
  improvements: string;
  coachComment: string;
  scores: { driver: number; iron: number; approach: number; putting: number };
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
  const [tab, setTab] = useState<'good' | 'improve' | 'comment'>('good');
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
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
    </div>
  );

  const tabs = [
    { key: 'good', label: '✅ 잘된 점' },
    { key: 'improve', label: '🔧 고칠 점' },
    { key: 'comment', label: '💬 코멘트' },
  ] as const;

  const completedCount = missions.filter(m => m.isCompleted).length;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl">←</button>
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              {lesson.sessionNumber}회차
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {fmtDate(lesson.lessonDate)} · {lesson.location || '장소 미입력'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">항목별 점수</h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: '드라이버', val: lesson.scores.driver },
              { label: '아이언', val: lesson.scores.iron },
              { label: '어프로치', val: lesson.scores.approach },
              { label: '퍼팅', val: lesson.scores.putting },
            ].map(({ label, val }) => (
              <div key={label} className="rounded-xl bg-green-50 py-3">
                <p className="text-xl font-bold text-green-700">{val}</p>
                <p className="text-[11px] text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                  tab === t.key ? 'bg-green-700 text-white' : 'text-gray-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap min-h-[80px]">
            {tab === 'good' && (lesson.goodPoints || <span className="text-gray-400">내용 없음</span>)}
            {tab === 'improve' && (lesson.improvements || <span className="text-gray-400">내용 없음</span>)}
            {tab === 'comment' && (lesson.coachComment || <span className="text-gray-400">내용 없음</span>)}
          </div>
        </Card>

        {missions.length > 0 && (
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">이번 주 연습 방향</h2>
              <span className="text-sm font-medium text-green-600">{completedCount}/{missions.length} 완료</span>
            </div>
            <div className="mb-3 h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
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
                  <span className="mt-0.5 text-xl shrink-0">
                    {m.isCompleted ? '✅' : '⬜'}
                  </span>
                  <p className={`text-sm ${m.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {m.text}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">내 메모</h2>
            {!editNote && (
              <button onClick={() => setEditNote(true)} className="text-sm text-green-600">
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
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {memberNote || <span className="text-gray-400">아직 메모가 없습니다</span>}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
