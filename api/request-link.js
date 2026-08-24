import { randomBytes } from 'node:crypto';
import { sign } from './_auth.js';

const email = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();
const doi = (value) =>
  String(value || '')
    .trim()
    .replace(/[.,;:'"\]}>]+$/g, '');
const allowed = () =>
  new Set(
    String(process.env.ALLOWED_SUBMITTER_EMAIL || '')
      .split(',')
      .map(email)
      .filter(Boolean)
  );

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const submittedEmail = email(req.body?.email);
  const submittedDoi = doi(req.body?.doi);
  const origin = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;

  if (
    !submittedDoi ||
    !allowed().has(submittedEmail) ||
    !process.env.AUTH_SECRET ||
    !process.env.RESEND_API_KEY
  ) {
    return res.status(400).json({ error: 'Unable to send a verification link.' });
  }

  const token = sign(
    {
      email: submittedEmail,
      doi: submittedDoi,
      exp: Math.floor(Date.now() / 1000) + 900,
      nonce: randomBytes(12).toString('base64url')
    },
    process.env.AUTH_SECRET
  );
  const link = `${origin}/api/verify?token=${encodeURIComponent(token)}`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM,
      to: [submittedEmail],
      subject: 'Confirm your CARESearch submission',
      html: `<p>Use this link to confirm your browser and submit the paper:</p><p><a href="${link}">Confirm and continue</a></p><p>This link expires in 15 minutes.</p>`
    })
  });

  if (!response.ok)
    return res.status(502).json({ error: 'The verification email could not be sent.' });
  return res.status(202).json({ ok: true });
}
