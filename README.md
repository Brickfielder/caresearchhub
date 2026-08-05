# Cardiac Arrest Research Hub

A static Astro site that curates literature on survivorship after out-of-hospital cardiac arrest. The project delivers mobile-first browsing, advanced faceted search, and export tooling suitable for GitHub Pages hosting.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:4321> to explore the development build. Use `npm run build` to generate the production bundle.

### Useful scripts

- `npm run dev` – start the Astro dev server
- `npm run build` – create a production build
- `npm run preview` – preview the build output locally
- `npm run validate` – validate `data/papers.json` against `data/papers.schema.json`
- `npm run normalize` – deduplicate, infer tags, and produce `data/papers.normalized.json`
- `npm run merge data/papers.to-merge.json` – merge curated additions into `data/papers.json`
- `npm run add:paper -- --doi <doi>|--pmid <pmid>` – fetch metadata for a DOI or PMID and append it to the dataset
- `npm run test` – run Jest unit tests for data hygiene helpers
- `npm run lint` – run ESLint
- `npm run typecheck` – run the TypeScript compiler in no-emit mode
- `npm run lighthouse` – execute Lighthouse CI assertions

## Add papers by DOI

Approved repository collaborators can submit a DOI through the **Add paper by DOI** issue form. The workflow fetches available metadata and abstract text with preview mode disabled, updates the datasets, and opens a pull request for review.

### Email-verified bookmark submissions

The `api/` directory is deployed as a small Vercel service. Configure `ALLOWED_SUBMITTER_EMAIL`, `AUTH_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, and `GITHUB_WORKFLOW_TOKEN` there; the last token needs permission to dispatch the `bulk-add-papers.yml` workflow. The public bookmark opens the Vercel submission page, where the approved contributor verifies their email once per browser and later submits directly for review. See [the colleague guide](docs/paper-submission-guide.md).

For faster submission from journal websites, install the **Add to CARESearch** bookmarklet from <https://caresearchhub.org/add-paper.html>. It detects a DOI on the current page and opens the GitHub issue form with the DOI pre-filled. The bookmarklet contains no GitHub credentials.

## Update cadence

This repository is updated manually approximately every two months, with additional ad-hoc updates when notable papers appear earlier. Follow the checklist below for each update cycle:

1. Collect PMIDs/DOIs/titles/abstracts via your searches.
2. Paste into `/admin/ingest.html` → export `papers.to-merge.json`.
3. `npm run merge data/papers.to-merge.json`
4. `npm run prep:update` (validate + normalize)
5. `npm run build` (local sanity check)
6. Push branch and dispatch Manual Update workflow (mode = bi-monthly or hotfix).
7. Review PR, merge when green.

## Project highlights

- Responsive, accessible UI with dark/light theme toggle.
- Client-side faceted search backed by Fuse.js with URL persistence.
- Paper detail pages with related-paper similarity, citation exports, and permalink copy helpers.
- JSON schema validation, normalization, and automated tagging utilities to keep metadata consistent.
- Feeds (`/feed.xml`, `/feed.json`) and `/api/papers.json` endpoint for downstream integrations.
- CI workflows for linting, type checks, tests, Lighthouse budgets, and GitHub Pages deployment.

## Manual release process

When an update PR merges, tag the release (`update-YYYY-MM[-hotfix]`) and publish a GitHub Release that includes the changelog excerpt and feed artifacts. Attach `feed.xml` and `feed.json` if desired.
