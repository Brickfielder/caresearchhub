import type { RawPaper } from './types';

export type MetadataSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface MetadataIssue {
  severity: MetadataSeverity;
  code: string;
  doi?: string;
  message: string;
  relatedDois?: string[];
}

export interface MetadataOverride {
  values: Partial<RawPaper>;
  reason: string;
  source: string;
  verifiedAt: string;
}

export type MetadataOverrides = Record<string, MetadataOverride>;

const text = (value: unknown) => String(value ?? '').trim();
const normalized = (value: unknown) => text(value).toLowerCase().replace(/\s+/g, ' ');
const hasValue = (value: unknown) =>
  Array.isArray(value)
    ? value.length > 0
    : value !== undefined && value !== null && text(value) !== '';

const duplicateIssues = (
  papers: RawPaper[],
  field: 'doi' | 'pmid' | 'title' | 'abstract',
  severity: MetadataSeverity
): MetadataIssue[] => {
  const groups = new Map<string, RawPaper[]>();
  for (const paper of papers) {
    const key = normalized(paper[field]);
    if (!key) continue;
    const group = groups.get(key) ?? [];
    group.push(paper);
    groups.set(key, group);
  }
  return [...groups.values()]
    .filter((group) => group.length > 1)
    .map((group) => ({
      severity,
      code: `duplicate_${field}`,
      doi: group[0].doi,
      relatedDois: group.map((paper) => paper.doi).filter((doi): doi is string => Boolean(doi)),
      message: `${field} is shared by ${group.length} records: ${group.map((paper) => paper.title).join(' | ')}`
    }));
};

export const auditPaperMetadata = (papers: RawPaper[]): MetadataIssue[] => {
  const issues: MetadataIssue[] = [
    ...duplicateIssues(papers, 'doi', 'critical'),
    ...duplicateIssues(papers, 'pmid', 'critical'),
    ...duplicateIssues(papers, 'abstract', 'critical'),
    ...duplicateIssues(papers, 'title', 'medium')
  ];

  for (const paper of papers) {
    const doi = paper.doi?.trim().toLowerCase();
    if (!doi) {
      issues.push({
        severity: 'critical',
        code: 'missing_doi',
        message: `${paper.title} has no DOI.`
      });
      continue;
    }
    if (!/^10\.\d{4,9}\/.+/.test(doi)) {
      issues.push({ severity: 'high', code: 'invalid_doi', doi, message: `${doi} is malformed.` });
    }
    for (const field of ['abstract', 'country', 'pmid', 'authors'] as const) {
      if (!hasValue(paper[field])) {
        issues.push({
          severity: field === 'authors' ? 'high' : 'medium',
          code: `missing_${field}`,
          doi,
          message: `${paper.title} has no ${field}.`
        });
      }
    }
    if (paper.links?.doi && normalized(paper.links.doi) !== `https://doi.org/${doi}`) {
      issues.push({
        severity: 'high',
        code: 'doi_link_mismatch',
        doi,
        message: `${doi} has a mismatched DOI link.`
      });
    }
    if (paper.pmid && paper.links?.pubmed && !paper.links.pubmed.includes(paper.pmid)) {
      issues.push({
        severity: 'high',
        code: 'pmid_link_mismatch',
        doi,
        message: `${doi} has a mismatched PubMed link.`
      });
    }
    if (
      paper.country &&
      (paper.country.length > 50 ||
        /@|department|university|hospital|electronic address/i.test(paper.country))
    ) {
      issues.push({
        severity: 'high',
        code: 'invalid_country',
        doi,
        message: `${doi} has an affiliation instead of a country: ${paper.country}`
      });
    }
  }
  return issues;
};

export const applyMetadataOverride = (paper: RawPaper, overrides: MetadataOverrides): RawPaper => {
  const override = paper.doi ? overrides[paper.doi.toLowerCase()] : undefined;
  return override ? { ...paper, ...override.values } : paper;
};

export const fillMissingMetadata = (stored: RawPaper, fetched: RawPaper): RawPaper => {
  const result = { ...stored } as RawPaper;
  for (const key of [
    'pmid',
    'pmcid',
    'authors',
    'journal',
    'date',
    'abstract',
    'mesh',
    'keywords',
    'country'
  ] as const) {
    if (!hasValue(stored[key]) && hasValue(fetched[key])) {
      Object.assign(result, { [key]: fetched[key] });
    }
  }
  result.links = { ...fetched.links, ...stored.links };
  result.flags = { ...fetched.flags, ...stored.flags };
  return result;
};

export const metadataSummary = (papers: RawPaper[], issues: MetadataIssue[]) => ({
  papers: papers.length,
  issues: issues.length,
  bySeverity: Object.fromEntries(
    (['critical', 'high', 'medium', 'low'] as const).map((severity) => [
      severity,
      issues.filter((issue) => issue.severity === severity).length
    ])
  ),
  completeness: Object.fromEntries(
    ['pmid', 'pmcid', 'authors', 'abstract', 'mesh', 'keywords', 'country'].map((field) => {
      const present = papers.filter((paper) => hasValue(paper[field as keyof RawPaper])).length;
      return [
        field,
        {
          present,
          missing: papers.length - present,
          percent: Number(((present / papers.length) * 100).toFixed(1))
        }
      ];
    })
  )
});
