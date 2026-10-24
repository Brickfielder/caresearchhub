import { COUNTRIES } from './countries';

type CountryPaper = {
  country?: string;
  corrCountryName?: string;
  corrCountryCode?: string;
};

const countryByAlias = new Map(
  COUNTRIES.flatMap((country) =>
    [country.code, country.iso3, country.name, ...country.aliases].map(
      (alias) => [alias.toLowerCase(), country] as const
    )
  )
);

export function resolveCountry(paper: CountryPaper) {
  for (const value of [paper.corrCountryName, paper.corrCountryCode, paper.country]) {
    const country = countryByAlias.get(value?.trim().toLowerCase() ?? '');
    if (country) return country;
  }
  return undefined;
}

export function aggregateByCountry(papers: CountryPaper[]) {
  const counts = new Map<string, { name: string; count: number }>();
  let unmappedCount = 0;

  for (const paper of papers) {
    const country = resolveCountry(paper);
    if (!country) {
      unmappedCount++;
      continue;
    }
    const entry = counts.get(country.iso3) ?? { name: country.name, count: 0 };
    entry.count++;
    counts.set(country.iso3, entry);
  }

  const entries = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  return {
    locations: entries.map(([iso3]) => iso3),
    z: entries.map(([, { count }]) => count),
    text: entries.map(([, { name }]) => name),
    unmappedCount
  };
}
