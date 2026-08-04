import { cookie, sign, verify } from './_auth.js';

export default function handler(req, res) {
  const token = verify(req.query.token, process.env.AUTH_SECRET || '');
  if (!token || token.email !== String(process.env.ALLOWED_SUBMITTER_EMAIL || '').toLowerCase()) return res.status(400).send('This verification link is invalid or has expired.');

  const session = sign({ email: token.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90 }, process.env.AUTH_SECRET);
  res.setHeader('Set-Cookie', cookie('caresearch_session', session, 60 * 60 * 24 * 90));
  return res.redirect(302, `/submit-paper.html?doi=${encodeURIComponent(token.doi)}&verified=1`);
}
