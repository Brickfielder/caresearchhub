import {
  applyMetadataOverride,
  auditPaperMetadata,
  fillMissingMetadata
} from '../src/utils/metadataQuality';
import type { RawPaper } from '../src/utils/types';

const paper = (doi: string, overrides: Partial<RawPaper> = {}): RawPaper => ({
  id: doi,
  doi,
  title: `Paper ${doi}`,
  authors: ['Jane Doe'],
  journal: 'Journal',
  year: 2026,
  date: '2026-01-01',
  abstract: 'A unique abstract.',
  country: 'Denmark',
  links: { doi: `https://doi.org/${doi}` },
  ...overrides
});

it('flags cross-record corruption and affiliation-shaped countries', () => {
  const issues = auditPaperMetadata([
    paper('10.1000/a', {
      abstract: 'Duplicated',
      country: 'Department of Medicine, Example University'
    }),
    paper('10.1000/b', { abstract: 'Duplicated' })
  ]);
  expect(issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ code: 'duplicate_abstract', severity: 'critical' }),
      expect.objectContaining({ code: 'invalid_country', severity: 'high' })
    ])
  );
});

it('fills only missing source metadata and then preserves verified overrides', () => {
  const stored = paper('10.1000/a', { abstract: '', country: 'Wrong' });
  const fetched = paper('10.1000/a', {
    abstract: 'Fetched abstract',
    country: 'Fetched country',
    pmid: '123'
  });
  const filled = fillMissingMetadata(stored, fetched);
  expect(filled).toMatchObject({ abstract: 'Fetched abstract', country: 'Wrong', pmid: '123' });
  expect(
    applyMetadataOverride(filled, {
      '10.1000/a': {
        values: { country: 'Denmark' },
        reason: 'Verified',
        source: 'test',
        verifiedAt: '2026-08-27'
      }
    }).country
  ).toBe('Denmark');
});
