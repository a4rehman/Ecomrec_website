import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "Sawera Collection <onboarding@resend.dev>";

export async function sendPasswordResetOtpEmail(email: string, otp: string) {
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resend = new Resend(resendApiKey);

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Your Sawera password reset OTP",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
        <h2>Sawera Collection Password Reset</h2>
        <p>Your verification code is:</p>
        <p style="font-size:28px;letter-spacing:6px;font-weight:700">${otp}</p>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `
  });
}
