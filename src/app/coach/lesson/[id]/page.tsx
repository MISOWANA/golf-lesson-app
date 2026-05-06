'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { Card } from '@/components/ui/Card';

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
  missions: { id: string; text: string; isCompleted: boolean }[];
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
  const [tab, setTab] = useState<'good' | 'improve' | 'comment'>('good');
  const [goodPoints, setGoodPoints] = useState('');
  const [improvements, setImprovements] = useState('');
  const [coachComment, setCoachComment] = useState('');
  const [scores, setScores] = useState({ driver: 7, iron: 7, approach: 7, putting: 7 });
  const [missions, setMissions] = useState<{ id: string; text: string; isCompleted: boolean }[]>([]);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${id}`).then(r => r.json()).then(data => {
      setLesson(data);
      setGoodPoints(data.goodPoints || '');
      setImprovements(data.improvements || '');
      setCoachComment(data.coachComment || '');
      setScores(data.scores);
      setMissions(data.missions || []);
    });
  }, [id]);

  async function save(share: boolean) {
    const fn = share ? setSharing : setSaving;
    fn(true);
    await fetch(`/api/lessons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goodPoints, improvements, coachComment, scores, missions, isShared: share }),
    });
    fn(false);
    setDirty(false);
    if (share) router.push(`/coach/members/${lesson?.memberId?._id}`);
  }

  function markDirty() { setDirty(true); }

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

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl">←</button>
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              {lesson.sessionNumber}회차
            </span>
            {lesson.isShared && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">공유됨</span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {fmtDate(lesson.lessonDate)} · {lesson.location || '장소 미입력'} · {lesson.memberId?.name}
          </p>
        </div>
      </div>

      <div className="space-y-5">
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
              onChange={e => { setGoodPoints(e.target.value); markDirty(); }}
              placeholder="이번 레슨에서 잘한 점..." />
          )}
          {tab === 'improve' && (
            <Textarea rows={5} value={improvements}
              onChange={e => { setImprovements(e.target.value); markDirty(); }}
              placeholder="개선이 필요한 점..." />
          )}
          {tab === 'comment' && (
            <Textarea rows={5} value={coachComment}
              onChange={e => { setCoachComment(e.target.value); markDirty(); }}
              placeholder="추가 코치 코멘트..." />
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">항목별 평가</h2>
          {(['driver', 'iron', 'approach', 'putting'] as const).map((k) => (
            <ScoreBar
              key={k}
              label={{ driver: '드라이버', iron: '아이언', approach: '어프로치', putting: '퍼팅' }[k]}
              value={scores[k]}
              onChange={v => { setScores({ ...scores, [k]: v }); markDirty(); }}
            />
          ))}
        </Card>

        {missions.length > 0 && (
          <Card>
            <h2 className="mb-3 font-semibold">이번 주 연습 방향</h2>
            <div className="space-y-2">
              {missions.map((m, i) => (
                <div key={m.id} className="flex items-start gap-3">
                  <span className={`mt-0.5 text-lg ${m.isCompleted ? 'opacity-50' : ''}`}>
                    {m.isCompleted ? '✅' : '🎯'}
                  </span>
                  <p className={`text-sm ${m.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {m.text}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {lesson.memberNote && (
          <Card className="border-l-4 border-blue-300">
            <p className="mb-1 text-xs font-medium text-blue-500">회원 메모</p>
            <p className="text-sm text-gray-700">{lesson.memberNote}</p>
          </Card>
        )}

        {!lesson.isShared && (
          <div className="flex gap-3 pb-8">
            {dirty && (
              <Button variant="secondary" onClick={() => save(false)} loading={saving} className="flex-1">
                저장
              </Button>
            )}
            <Button onClick={() => save(true)} loading={sharing} className="flex-1">
              회원에게 공유 🚀
            </Button>
          </div>
        )}

        {lesson.isShared && dirty && (
          <div className="pb-8">
            <Button onClick={() => save(false)} loading={saving} className="w-full">변경사항 저장</Button>
          </div>
        )}
      </div>
    </div>
  );
}
