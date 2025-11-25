import type { APIRoute } from 'astro';
import ongoingStudies from '../../../data/ongoing-studies.json';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(ongoingStudies), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
