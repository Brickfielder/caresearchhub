import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { RawPaper } from '../src/utils/types';
import { auditPaperMetadata, metadataSummary } from '../src/utils/metadataQuality';

const root = path.resolve(import.meta.dirname, '..');
const papers = JSON.parse(readFileSync(path.join(root, 'data/papers.json'), 'utf8')) as RawPaper[];
const issues = auditPaperMetadata(papers);
const summary = metadataSummary(papers, issues);
const reportDirArg = process.argv.find((arg) => arg.startsWith('--report-dir='));
const reportDir = path.resolve(root, reportDirArg?.split('=')[1] ?? 'reports/metadata');
const strict = process.argv.includes('--strict');

mkdirSync(reportDir, { recursive: true });
writeFileSync(
  path.join(reportDir, 'metadata-audit.json'),
  JSON.stringify({ summary, issues }, null, 2) + '\n'
);
writeFileSync(
  path.join(reportDir, 'metadata-audit.md'),
  [
    '# Paper metadata audit',
    '',
    `Papers: ${summary.papers}`,
    `Issues: ${summary.issues}`,
    '',
    '| Severity | Count |',
    '| --- | ---: |',
    ...Object.entries(summary.bySeverity).map(([severity, count]) => `| ${severity} | ${count} |`),
    '',
    '| Field | Present | Missing | Complete |',
    '| --- | ---: | ---: | ---: |',
    ...Object.entries(summary.completeness).map(
      ([field, value]) => `| ${field} | ${value.present} | ${value.missing} | ${value.percent}% |`
    ),
    '',
    '## Review queue',
    '',
    ...issues.map((issue) => `- **${issue.severity} · ${issue.code}** — ${issue.message}`),
    ''
  ].join('\n')
);

console.log(JSON.stringify(summary, null, 2));
console.log(`Reports written to ${path.relative(root, reportDir)}`);
if (strict && issues.some((issue) => issue.severity === 'critical')) process.exitCode = 1;
