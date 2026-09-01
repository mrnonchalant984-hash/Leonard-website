import nodemailer from "nodemailer";

function configured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transporter() {
  if (!configured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendMail(to: string, subject: string, html: string) {
  const transport = transporter();
  if (!transport) throw new Error("SMTP is not configured");
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to, subject, html,
  });
}

export function emailShell(title: string, content: string) {
  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0b1220"><div style="max-width:640px;margin:32px auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden"><div style="padding:24px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:24px;font-weight:800">LeonardX</div><div style="padding:30px"><h1 style="font-size:28px;margin:0 0 16px">${title}</h1>${content}<p style="color:#64748b;margin-top:28px">LeonardX — Nigerian Freelancing + AI Platform</p></div></div></body></html>`;
}
