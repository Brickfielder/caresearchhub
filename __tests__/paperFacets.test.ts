import {
  classifyPopulations,
  classifyRecoveryStages,
  classifyStudyDesign
} from '../src/utils/paperFacets';
import type { Paper } from '../src/utils/types';

const paper = (title: string, abstract: string): Paper => ({
  id: title,
  title,
  abstract,
  authors: [],
  normalizedAuthors: [],
  journal: 'Test',
  year: 2026,
  links: {},
  isAbstractTruncated: false
});

test('classifies useful researcher-facing facets from paper text', () => {
  const sample = paper(
    'Prospective cohort of cardiac arrest survivors',
    'Patients and family caregivers were assessed at 3 months, 12 months and 2 years.'
  );

  expect(classifyStudyDesign(sample)).toBe('Observational');
  expect(classifyPopulations(sample)).toEqual(['Survivors/patients', 'Family/caregivers']);
  expect(classifyRecoveryStages(sample)).toEqual(['early', 'medium', 'long']);
});
