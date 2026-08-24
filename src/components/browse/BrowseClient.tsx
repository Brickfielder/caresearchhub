import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  applySearch,
  buildFacets,
  createFuse,
  defaultSearchState,
  parseStateFromUrl,
  serializeStateToUrl
} from '~/utils/search';
import type { Paper, SearchState } from '~/utils/types';
import { getPaperUrl, truncateAuthors } from '~/utils/format';
import { recoveryStages } from '~/utils/paperFacets';

const useSearchState = (papers: Paper[]): [SearchState, (next: SearchState) => void] => {
  const defaults = useMemo(() => defaultSearchState(papers), [papers]);
  const [state, setState] = useState<SearchState>(() => {
    if (typeof window === 'undefined') {
      return defaults;
    }
    return parseStateFromUrl(new URL(window.location.href), defaults);
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const url = serializeStateToUrl(state, new URL(window.location.href));
    window.history.replaceState({}, '', url.toString());
  }, [state]);

  return [state, setState];
};

const toggleValue = (values: string[], value: string): string[] =>
  values.includes(value) ? values.filter((v) => v !== value) : [...values, value];

interface PaperCardProps {
  paper: Paper;
}

const PaperCard = ({ paper }: PaperCardProps) => {
  const { display, remaining } = truncateAuthors(paper.normalizedAuthors);

  return (
    <article
      key={paper.id}
      class="paper-card group rounded-[1.75rem] border border-white/75 bg-white/95 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/80 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_22px_50px_rgba(15,23,42,0.1)] dark:border-slate-800/80 dark:bg-slate-900 dark:ring-slate-800/60"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 class="paper-card-title text-lg font-semibold text-slate-900 transition group-hover:text-teal-700 dark:text-slate-100">
            <a href={getPaperUrl(paper)}>{paper.title}</a>
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            {display}
            {remaining.length > 0 && (
              <details class="inline">
                <summary class="ml-1 cursor-pointer text-blue-600 dark:text-blue-400">
                  +{remaining.length} more
                </summary>
                <span class="ml-2 inline text-slate-600 dark:text-slate-300">
                  {remaining.join(', ')}
                </span>
              </details>
            )}
          </p>
        </div>
        <div class="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-300">
          <span>{paper.journal}</span>
          <span aria-hidden="true">•</span>
          <span>{paper.year}</span>
        </div>
      </div>
      <details class="paper-card-abstract mt-3 rounded-2xl border border-teal-100/80 bg-teal-50/40 p-3 transition open:shadow-sm dark:border-teal-900/40 dark:bg-teal-900/10">
        <summary class="flex cursor-pointer items-center justify-between text-sm font-semibold text-teal-700 transition hover:text-teal-800 dark:text-teal-200 dark:hover:text-teal-100">
          <span>Abstract</span>
          <span class="text-xs font-bold uppercase tracking-wide text-teal-500 dark:text-teal-200">
            {'▼'}
          </span>
        </summary>
        <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-200">
          {paper.abstract}
          {paper.isAbstractTruncated && (
            <span class="ml-1 text-xs uppercase text-orange-600">(Abstract truncated)</span>
          )}
        </p>
      </details>
      <div class="mt-4 flex flex-wrap gap-2">
        {(paper.domains ?? []).map((domain) => (
          <span
            key={domain}
            class="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:bg-teal-900/30 dark:text-teal-200"
          >
            {domain}
          </span>
        ))}
      </div>
      <div class="mt-5 flex flex-wrap gap-2 text-sm">
        {paper.links.pubmed && (
          <a
            class="inline-flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition hover:border-teal-200 hover:bg-teal-100 dark:border-teal-500/40 dark:bg-teal-900/20 dark:text-teal-200"
            href={paper.links.pubmed}
            target="_blank"
            rel="noopener noreferrer"
          >
            PubMed
          </a>
        )}
        {paper.links.doi && (
          <a
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
            href={paper.links.doi}
            target="_blank"
            rel="noopener noreferrer"
          >
            DOI
          </a>
        )}
        {paper.links.pmc && (
          <a
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
            href={paper.links.pmc}
            target="_blank"
            rel="noopener noreferrer"
          >
            PMC
          </a>
        )}
      </div>
    </article>
  );
};

interface Props {
  papers: Paper[];
}

export default function BrowseClient({ papers }: Props) {
  const fuse = useMemo(() => createFuse(papers), [papers]);
  const facets = useMemo(() => buildFacets(papers), [papers]);
  const [state, setState] = useSearchState(papers);
  const visiblePapers = useMemo(() => applySearch(papers, fuse, state), [papers, fuse, state]);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const yearRange = useMemo(() => {
    const years = Object.keys(facets.years).map((y) => Number.parseInt(y, 10));
    if (!years.length) {
      return [currentYear, currentYear] as [number, number];
    }
    return [Math.min(...years), Math.max(...years)] as [number, number];
  }, [facets.years, currentYear]);

  const handleYearChange = (index: 0 | 1) => (event: Event) => {
    const value = Number.parseInt((event.target as HTMLInputElement).value, 10);
    const next: [number, number] = [...state.years];
    next[index] = value;
    if (next[0] > next[1]) {
      if (index === 0) next[1] = value;
      else next[0] = value;
    }
    setState({ ...state, years: next });
  };

  const updateQuery = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    setState({ ...state, query: value });
  };

  const buildFacetList = (
    items: Record<string, number>,
    selected: string[],
    key: keyof Pick<
      SearchState,
      | 'domains'
      | 'settings'
      | 'designs'
      | 'populations'
      | 'recoveryStages'
      | 'countries'
      | 'journals'
    >
  ) => (
    <ul class="space-y-2">
      {Object.entries(items)
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => (
          <li key={value}>
            <label class="flex items-center justify-between gap-2 rounded-2xl border border-transparent px-2 py-1 text-sm text-slate-600 transition hover:border-teal-100 hover:bg-teal-50/60 dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:bg-teal-900/20">
              <span class="flex items-center">
                <input
                  type="checkbox"
                  class="mr-2 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:checked:bg-teal-500"
                  checked={selected.includes(value)}
                  onChange={() =>
                    setState({
                      ...state,
                      [key]: toggleValue(selected, value)
                    })
                  }
                />
                {key === 'recoveryStages'
                  ? recoveryStages.find(([stage]) => stage === value)?.[1]
                  : value}
              </span>
              <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">{count}</span>
            </label>
          </li>
        ))}
    </ul>
  );

  const FacetSection = ({
    title,
    children,
    defaultOpen = false
  }: {
    title: string;
    children: ComponentChildren;
    defaultOpen?: boolean;
  }) => (
    <details
      class="browse-facet rounded-2xl border border-teal-100/70 bg-teal-50/40 p-3 transition open:bg-white/90 open:shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:open:bg-slate-900"
      open={defaultOpen}
    >
      <summary class="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-700 transition hover:text-teal-700 dark:text-slate-200 dark:hover:text-teal-200">
        <span>{title}</span>
        <span class="text-xs font-bold uppercase tracking-wide text-teal-500 dark:text-teal-200">
          {'▼'}
        </span>
      </summary>
      <div class="mt-3">{children}</div>
    </details>
  );

  return (
    <div class="browse-client space-y-6">
      <div class="flex justify-center">
        <div class="browse-search w-full max-w-3xl rounded-[2rem] border border-teal-200/70 bg-gradient-to-br from-white via-cyan-50/70 to-teal-50/70 p-6 text-center shadow-[0_22px_60px_rgba(13,148,136,0.12)] ring-1 ring-teal-100/80 backdrop-blur-lg transition dark:border-slate-800 dark:from-slate-900/90 dark:via-teal-950/20 dark:to-slate-900/85 dark:shadow-none dark:ring-teal-900/40">
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-teal-500 dark:text-teal-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.8"
                stroke="currentColor"
                class="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-4.35-4.35m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9Z"
                />
              </svg>
            </div>
            <input
              id="search"
              type="search"
              placeholder="Search by title, abstract, keywords, or author"
              value={state.query}
              onInput={updateQuery}
              class="peer w-full appearance-none rounded-2xl border border-teal-200/80 bg-white/90 px-12 py-4 text-base font-semibold text-slate-800 shadow-lg shadow-teal-100/70 transition duration-200 placeholder:font-medium placeholder:text-slate-400 focus:-translate-y-0.5 focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-cyan-50 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden dark:border-teal-900/50 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-teal-500 dark:focus:ring-teal-700/50 dark:focus:ring-offset-slate-900"
            />
            <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold uppercase tracking-wide text-teal-600 opacity-0 transition-opacity duration-200 peer-focus:opacity-100 dark:text-teal-200">
              Live match
            </div>
          </div>
        </div>
      </div>

      <div class="browse-workspace flex flex-col gap-8 lg:flex-row">
        <aside class="browse-filters lg:w-80 lg:flex-none">
          <div class="browse-filter-panel space-y-6 rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900 dark:ring-slate-800/80">
            <div>
              <p class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Year range
              </p>
              <div class="space-y-3">
                <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                  <span>{state.years[0]}</span>
                  <span>{state.years[1] === currentYear ? 'Current' : state.years[1]}</span>
                </div>
                <div class="space-y-2">
                  <input
                    type="range"
                    min={yearRange[0]}
                    max={yearRange[1]}
                    value={state.years[0]}
                    onInput={handleYearChange(0)}
                    aria-label="Start year"
                    class="w-full accent-teal-600"
                  />
                  <input
                    type="range"
                    min={yearRange[0]}
                    max={yearRange[1]}
                    value={state.years[1]}
                    onInput={handleYearChange(1)}
                    aria-label="End year"
                    class="w-full accent-teal-600"
                  />
                </div>
              </div>
            </div>

            <FacetSection title="Domain">
              {buildFacetList(facets.domains, state.domains, 'domains')}
            </FacetSection>

            <FacetSection title="Setting">
              {buildFacetList(facets.settings, state.settings, 'settings')}
            </FacetSection>

            <FacetSection title="Study design">
              {buildFacetList(facets.designs, state.designs, 'designs')}
            </FacetSection>

            <FacetSection title="Population">
              {buildFacetList(facets.populations, state.populations, 'populations')}
            </FacetSection>

            <FacetSection title="Recovery stage">
              {buildFacetList(facets.recoveryStages, state.recoveryStages, 'recoveryStages')}
            </FacetSection>

            <FacetSection title="Geography">
              {buildFacetList(facets.countries, state.countries, 'countries')}
            </FacetSection>

            <FacetSection title="Journal">
              {buildFacetList(facets.journals, state.journals, 'journals')}
            </FacetSection>
          </div>
        </aside>

        <section class="browse-results flex-1 space-y-5">
          <div class="browse-results-header flex flex-col gap-3 rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/80 backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900 dark:ring-slate-800/80">
            <div>
              <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {visiblePapers.length} papers
              </h2>
              <p class="text-sm text-slate-600 dark:text-slate-300">
                Sorted by relevance, then year (newest first)
              </p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-1.5 text-sm font-semibold text-teal-700 transition hover:border-teal-200 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-900 dark:text-teal-300"
              onClick={() => setState(defaultSearchState(papers))}
            >
              Reset filters
            </button>
          </div>
          <div class="space-y-4">
            {visiblePapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
