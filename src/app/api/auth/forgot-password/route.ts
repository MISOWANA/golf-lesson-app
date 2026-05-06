import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import { connectDB } from '@/lib/mongodb';
import { rateLimit } from '@/lib/rateLimit';
import { sendTempPasswordEmail } from '@/lib/email';
import User from '@/models/User';

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    if (!rateLimit(`forgot:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    // 보안상 존재 여부 노출하지 않음 — 항상 같은 응답
    if (!user) {
      return NextResponse.json({ message: '이메일로 임시 비밀번호를 발송했습니다.' });
    }

    const tempPassword = nanoid();
    const hashed = await bcrypt.hash(tempPassword, 8);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1시간

    user.tempPasswordHash = hashed;
    user.tempPasswordExpiry = expiry;
    await user.save();

    await sendTempPasswordEmail(user.email, user.name, tempPassword);

    return NextResponse.json({ message: '이메일로 임시 비밀번호를 발송했습니다.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
