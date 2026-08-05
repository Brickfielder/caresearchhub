import { verify } from './_auth.js';

const doi = (value) => String(value || '').trim().replace(/[.,;:'"\]}>]+$/g, '');
const allowed = () => new Set(String(process.env.ALLOWED_SUBMITTER_EMAIL || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!origin || new URL(origin).host !== host) return res.status(403).json({ error: 'Invalid submission origin.' });

  const session = verify(req.cookies?.caresearch_session, process.env.AUTH_SECRET || '');
  if (!session || !allowed().has(session.email)) return res.status(401).json({ error: 'Please confirm this browser first.' });

  const identifier = doi(req.body?.doi);
  if (!/^10\.\d{4,9}\/.+/i.test(identifier)) return res.status(400).json({ error: 'Enter a valid DOI.' });

  const response = await fetch('https://api.github.com/repos/Brickfielder/caresearchhub/actions/workflows/bulk-add-papers.yml/dispatches', {
    method: 'POST',
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${process.env.GITHUB_WORKFLOW_TOKEN}`, 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
    body: JSON.stringify({ ref: 'main', inputs: { identifiers: identifier, preview_only: 'false' } })
  });

  if (!response.ok) return res.status(502).json({ error: 'The CARESearch workflow could not be started.' });
  return res.status(202).json({ ok: true });
}
