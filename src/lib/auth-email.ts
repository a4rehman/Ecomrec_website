import nodemailer from "nodemailer";

const SMTP_HOST = "smtp.hostinger.com";
const SMTP_PORT = 465;
const SMTP_USER = process.env.SMTP_USER!;   // e.g. support@saweracollection.com
const SMTP_PASS = process.env.SMTP_PASS!;   // Hostinger email password
const FROM_NAME = "Sawera Collection";
const FROM_EMAIL = SMTP_USER;

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true, // SSL on port 465
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendPasswordResetOtpEmail(email: string, otp: string) {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP credentials (SMTP_USER, SMTP_PASS) are not configured.");
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: "Your Sawera Collection password reset OTP",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.8;color:#222;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:22px;margin-bottom:8px;color:#191919">Sawera Collection</h2>
        <p style="color:#666;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px">Password Reset</p>
        <p>Your one-time verification code is:</p>
        <div style="background:#f9f5f4;border:1px solid #e8dede;border-radius:6px;padding:20px;text-align:center;margin:24px 0">
          <span style="font-size:36px;letter-spacing:12px;font-weight:700;color:#191919">${otp}</span>
        </div>
        <p style="color:#555">This code expires in <strong>10 minutes</strong>.</p>
        <p style="color:#888;font-size:12px">If you did not request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0"/>
        <p style="color:#aaa;font-size:11px;text-align:center">Sawera Collection · support@saweracollection.com</p>
      </div>
    `,
  });
}
