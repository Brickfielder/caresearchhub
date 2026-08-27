import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fetchPaperByIdentifier } from '../src/utils/paperFetcher';
import {
  applyMetadataOverride,
  fillMissingMetadata,
  type MetadataOverrides
} from '../src/utils/metadataQuality';
import { normalizeRecords } from '../src/utils/normalizer';
import type { RawPaper } from '../src/utils/types';

const root = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(root, 'data/papers.json');
const normalizedPath = path.join(root, 'data/papers.normalized.json');
const overridesPath = path.join(root, 'data/paper-metadata-overrides.json');
const apply = process.argv.includes('--apply');
const doiArg = process.argv
  .find((arg) => arg.startsWith('--doi='))
  ?.split('=')[1]
  ?.toLowerCase();
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1];
const limit = limitArg ? Number(limitArg) : undefined;
const reportDirArg = process.argv.find((arg) => arg.startsWith('--report-dir='));
const reportDir = path.resolve(root, reportDirArg?.split('=')[1] ?? 'reports/metadata');
const papers = JSON.parse(readFileSync(dataPath, 'utf8')) as RawPaper[];
const overrides = JSON.parse(readFileSync(overridesPath, 'utf8')) as MetadataOverrides;
const targets = papers
  .filter((paper) => !doiArg || paper.doi?.toLowerCase() === doiArg)
  .slice(0, limit);
const proposals: object[] = [];
const updates = new Map<string, RawPaper>();

for (const paper of targets) {
  if (!paper.doi) continue;
  try {
    const fetched = await fetchPaperByIdentifier({ doi: paper.doi });
    if (fetched.doi?.toLowerCase() !== paper.doi.toLowerCase()) {
      proposals.push({
        doi: paper.doi,
        status: 'rejected',
        reason: `Fetched DOI ${fetched.doi ?? 'missing'} did not match.`
      });
      continue;
    }
    const filled = applyMetadataOverride(fillMissingMetadata(paper, fetched), overrides);
    const changed = JSON.stringify(filled) !== JSON.stringify(paper);
    const differences = Object.fromEntries(
      (
        [
          'pmid',
          'pmcid',
          'title',
          'authors',
          'journal',
          'year',
          'date',
          'abstract',
          'mesh',
          'keywords',
          'country',
          'links',
          'flags'
        ] as const
      )
        .filter((field) => JSON.stringify(paper[field]) !== JSON.stringify(fetched[field]))
        .map((field) => [
          field,
          { stored: paper[field], fetched: fetched[field], proposed: filled[field] }
        ])
    );
    proposals.push({
      doi: paper.doi,
      status: changed ? 'proposed' : 'unchanged',
      differences
    });
    if (changed) updates.set(paper.doi.toLowerCase(), filled);
  } catch (error) {
    proposals.push({
      doi: paper.doi,
      status: 'failed',
      reason: error instanceof Error ? error.message : String(error)
    });
  }
}

mkdirSync(reportDir, { recursive: true });
writeFileSync(
  path.join(reportDir, 'metadata-refresh.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), apply, proposals }, null, 2) + '\n'
);

if (apply && updates.size) {
  const updated = papers.map((paper) =>
    paper.doi && updates.has(paper.doi.toLowerCase())
      ? updates.get(paper.doi.toLowerCase())!
      : applyMetadataOverride(paper, overrides)
  );
  writeFileSync(dataPath, JSON.stringify(updated, null, 2) + '\n');
  writeFileSync(normalizedPath, JSON.stringify(normalizeRecords(updated), null, 2) + '\n');
}

console.log(
  `${targets.length} checked; ${updates.size} update(s) ${apply ? 'applied' : 'proposed'}.`
);
console.log(`Report written to ${path.relative(root, reportDir)}`);
