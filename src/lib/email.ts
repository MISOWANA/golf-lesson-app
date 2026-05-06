import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendTempPasswordEmail(to: string, name: string, tempPassword: string) {
  await transporter.sendMail({
    from: `"GolfCoach Pro" <${process.env.EMAIL_USER}>`,
    to,
    subject: '[GolfCoach Pro] 임시 비밀번호 안내',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff;">
        <h2 style="color: #166534; margin-bottom: 4px;">⛳ GolfCoach Pro</h2>
        <p style="color: #6b7280; font-size: 14px; margin-top: 0;">골프 레슨 기록 플랫폼</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 16px;">안녕하세요, <strong>${name}</strong>님.</p>
        <p style="font-size: 14px; color: #374151;">요청하신 임시 비밀번호를 안내드립니다.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0;">임시 비밀번호</p>
          <p style="font-size: 32px; font-weight: bold; color: #166534; letter-spacing: 6px; margin: 0;">${tempPassword}</p>
        </div>
        <p style="color: #6b7280; font-size: 13px;">⏰ 임시 비밀번호는 <strong>1시간</strong> 동안만 유효합니다.</p>
        <p style="color: #6b7280; font-size: 13px;">🔒 로그인 후 반드시 비밀번호를 변경해주세요.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">본인이 요청하지 않으셨다면 이 이메일을 무시해주세요.</p>
      </div>
    `,
  });
}
