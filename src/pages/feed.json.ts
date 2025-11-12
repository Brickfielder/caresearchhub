import type { APIRoute } from 'astro';
import papers from '../../data/papers.normalized.json';
import { resolveWithBase } from '~/utils/paths';
import type { Paper } from '~/utils/types';

export const GET: APIRoute = ({ site }) => {
  const typed = papers as Paper[];
  const baseSite = site ?? new URL(import.meta.env.SITE ?? 'https://example.com');
  const withBase = (path: string) => new URL(resolveWithBase(path), baseSite).toString();
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'OHCA Survivorship Repository',
    home_page_url: withBase('/'),
    feed_url: withBase('/feed.json'),
    description: 'Latest additions to the OHCA Survivorship Repository',
    items: typed.slice(0, 20).map((paper) => ({
      id: paper.id,
      url: withBase(`/paper/${paper.id}`),
      title: paper.title,
      content_text: paper.abstract,
      date_published: paper.date ?? `${paper.year}-01-01`
    }))
  };
  return new Response(JSON.stringify(feed, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8'
    }
  });
};
