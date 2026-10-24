import papers from '../data/papers.normalized.json';
import { aggregateByCountry, resolveCountry } from '../src/utils/countryHeatmap';

describe('country heatmap', () => {
  it('combines country aliases before plotting, independently of record order', () => {
    const sample = [
      { country: 'United States' },
      { country: 'USA' },
      { country: 'United States of America' },
      { country: ' u.s.a. ' },
      { corrCountryCode: 'US' },
      { country: 'Netherlands' },
      { country: 'the Netherlands' },
      { country: 'South Korea' },
      { country: 'Republic of Korea' },
      { country: 'Singapore, Singapore' },
      { country: 'SG' },
      { country: 'United Kingdom' },
      { country: 'UK' }
    ];
    const result = aggregateByCountry(sample);
    expect(result).toEqual({
      locations: ['GBR', 'KOR', 'NLD', 'SGP', 'USA'],
      z: [2, 2, 2, 2, 5],
      text: [
        'United Kingdom',
        'Republic of Korea',
        'the Netherlands',
        'Singapore',
        'United States'
      ],
      unmappedCount: 0
    });
    expect(aggregateByCountry([...sample].reverse())).toEqual(result);
  });

  it('prefers corresponding country and falls back from blank or unusable metadata', () => {
    expect(resolveCountry({ corrCountryName: 'Canada', country: 'USA' })?.iso3).toBe('CAN');
    expect(resolveCountry({ corrCountryName: '  ', country: 'USA' })?.iso3).toBe('USA');
    expect(resolveCountry({ corrCountryName: 'Unknown', corrCountryCode: 'NL' })?.iso3).toBe('NLD');
    expect(resolveCountry({ country: 'MN' })).toBeUndefined();
    expect(aggregateByCountry([{}, { country: 'Unknown' }]).unmappedCount).toBe(2);
  });

  it('maps every populated country in the repository to exactly one ISO-3 location', () => {
    const populated = papers.filter(
      (paper) =>
        paper.corrCountryName?.trim() || paper.corrCountryCode?.trim() || paper.country?.trim()
    );
    expect(populated.filter((paper) => !resolveCountry(paper)).map((paper) => paper.id)).toEqual(
      []
    );
    const result = aggregateByCountry(papers);
    expect(new Set(result.locations).size).toBe(result.locations.length);
    expect(result.z.reduce((sum, count) => sum + count, 0)).toBe(populated.length);
    expect(result.unmappedCount).toBe(papers.length - populated.length);
  });
});
