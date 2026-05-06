import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest, createSession } from '@/lib/auth';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: '새 비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.id);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 현재 비밀번호 또는 유효한 임시 비밀번호 확인
    const validMain = await bcrypt.compare(currentPassword, user.password);
    const validTemp =
      user.tempPasswordHash &&
      user.tempPasswordExpiry &&
      user.tempPasswordExpiry > new Date() &&
      (await bcrypt.compare(currentPassword, user.tempPasswordHash));

    if (!validMain && !validTemp) {
      return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    const hashed = await bcrypt.hash(newPassword, 8);
    user.password = hashed;
    user.tempPasswordHash = undefined;
    user.tempPasswordExpiry = undefined;
    await user.save();

    // 세션 갱신 (mustChangePassword 제거)
    await createSession({ id: user._id.toString(), name: user.name, role: user.role, email: user.email });

    return NextResponse.json({ message: '비밀번호가 변경되었습니다.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
