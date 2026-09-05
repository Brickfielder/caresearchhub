/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "node-addons"]}
 */
import { h, hydrate, render } from 'preact';
import { act } from 'preact/test-utils';
import renderToString from 'preact-render-to-string';
import BrowseClient from '../src/components/browse/BrowseClient';
import papers from '../data/papers.normalized.json';
import type { Paper } from '../src/utils/types';
import {
  applySearch,
  createFuse,
  defaultSearchState,
  parseStateFromUrl
} from '../src/utils/search';

jest.mock('../src/utils/format', () => ({
  getPaperUrl: (paper: Paper) => `/paper/${encodeURIComponent(paper.id)}`,
  truncateAuthors: (authors: string[]) => ({ display: authors.join(', '), remaining: [] })
}));

const dataset = papers as Paper[];

test.each(['?q=cognition', '?quick=Caregiver', '?domain=Psychological', ''])(
  'hydrated paper titles and destinations agree for %s and subsequent searches',
  async (query) => {
    window.history.replaceState({}, '', '/browse/');
    const container = document.createElement('div');
    container.innerHTML = renderToString(h(BrowseClient, { papers: dataset }));
    document.body.append(container);
    window.history.replaceState({}, '', `/browse/${query}#papers`);

    const checkLinks = () => {
      const state = parseStateFromUrl(new URL(window.location.href), defaultSearchState(dataset));
      const expected = applySearch(dataset, createFuse(dataset), state);
      const links = [...container.querySelectorAll<HTMLAnchorElement>('.paper-card-title a')];
      expect(links.length).toBe(expected.length);
      expect(links.length).toBeGreaterThan(0);
      links.forEach((link, index) => {
        expect(link.textContent).toBe(expected[index].title);
        expect(link.getAttribute('href')).toBe(`/paper/${encodeURIComponent(expected[index].id)}`);
        const externalLinks = [...link.closest('article')!.querySelectorAll('a[target="_blank"]')];
        expect(externalLinks.map((external) => external.getAttribute('href'))).toEqual(
          [
            expected[index].links.pubmed,
            expected[index].links.doi,
            expected[index].links.pmc
          ].filter(Boolean)
        );
      });
    };

    try {
      await act(() => hydrate(h(BrowseClient, { papers: dataset }), container));
      for (const [key, value] of new URLSearchParams(query)) {
        expect(new URL(window.location.href).searchParams.get(key)).toBe(value);
      }
      expect(window.location.hash).toBe('#papers');
      checkLinks();
      await act(() => {
        const input = container.querySelector<HTMLInputElement>('#search')!;
        input.value = 'quality of life';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      checkLinks();
      await act(() => container.querySelector<HTMLButtonElement>('button')!.click());
      checkLinks();
      expect(container.querySelectorAll('.paper-card')).toHaveLength(dataset.length);
    } finally {
      render(null, container);
      container.remove();
    }
  }
);
