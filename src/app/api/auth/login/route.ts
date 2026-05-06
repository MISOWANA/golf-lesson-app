import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { createSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    if (!rateLimit(`login:${ip}`, 10, 60 * 1000)) {
      return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    const validMain = await bcrypt.compare(password, user.password);

    if (!validMain) {
      // 임시 비밀번호 확인
      const validTemp =
        user.tempPasswordHash &&
        user.tempPasswordExpiry &&
        user.tempPasswordExpiry > new Date() &&
        (await bcrypt.compare(password, user.tempPasswordHash));

      if (!validTemp) {
        return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
      }

      await createSession({ id: user._id.toString(), name: user.name, role: user.role, email: user.email, mustChangePassword: true });
      return NextResponse.json({ id: user._id, name: user.name, role: user.role, mustChangePassword: true });
    }

    await createSession({ id: user._id.toString(), name: user.name, role: user.role, email: user.email });
    return NextResponse.json({ id: user._id, name: user.name, role: user.role });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
