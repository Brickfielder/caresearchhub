// Exact country identities and aliases for map aggregation.
// Keep fuzzy affiliation parsing out of the rendering path.
export const COUNTRIES: { code: string; iso3: string; name: string; aliases: string[] }[] = [
  // Existing
  {
    code: 'US',
    iso3: 'USA',
    name: 'United States',
    aliases: ['United States', 'USA', 'U.S.A.', 'US', 'U.S.', 'United States of America']
  },
  {
    code: 'GB',
    iso3: 'GBR',
    name: 'United Kingdom',
    aliases: ['United Kingdom', 'UK', 'U.K.', 'England', 'Scotland', 'Wales', 'Northern Ireland']
  },
  { code: 'CA', iso3: 'CAN', name: 'Canada', aliases: ['Canada'] },
  { code: 'AU', iso3: 'AUS', name: 'Australia', aliases: ['Australia'] },
  { code: 'DE', iso3: 'DEU', name: 'Germany', aliases: ['Germany', 'Bundesrepublik Deutschland'] },
  { code: 'FR', iso3: 'FRA', name: 'France', aliases: ['France'] },
  { code: 'IT', iso3: 'ITA', name: 'Italy', aliases: ['Italy', 'Italia'] },
  { code: 'SE', iso3: 'SWE', name: 'Sweden', aliases: ['Sweden', 'Sverige'] },
  { code: 'NO', iso3: 'NOR', name: 'Norway', aliases: ['Norway', 'Norge'] },
  {
    code: 'NL',
    iso3: 'NLD',
    name: 'the Netherlands',
    aliases: ['Netherlands', 'the Netherlands', 'The Netherlands', 'Nederland']
  },
  { code: 'DK', iso3: 'DNK', name: 'Denmark', aliases: ['Denmark', 'Danmark'] },

  // More European countries likely to appear
  { code: 'ES', iso3: 'ESP', name: 'Spain', aliases: ['Spain', 'España'] },
  { code: 'PT', iso3: 'PRT', name: 'Portugal', aliases: ['Portugal'] },
  {
    code: 'CH',
    iso3: 'CHE',
    name: 'Switzerland',
    aliases: ['Switzerland', 'Suisse', 'Schweiz', 'Svizzera']
  },
  { code: 'AT', iso3: 'AUT', name: 'Austria', aliases: ['Austria', 'Österreich'] },
  { code: 'BE', iso3: 'BEL', name: 'Belgium', aliases: ['Belgium', 'Belgique', 'België'] },
  { code: 'FI', iso3: 'FIN', name: 'Finland', aliases: ['Finland', 'Suomi'] },
  { code: 'IE', iso3: 'IRL', name: 'Ireland', aliases: ['Ireland', 'Republic of Ireland'] },
  { code: 'PL', iso3: 'POL', name: 'Poland', aliases: ['Poland', 'Polska'] },
  {
    code: 'CZ',
    iso3: 'CZE',
    name: 'Czech Republic',
    aliases: ['Czech Republic', 'Czechia', 'Česko']
  },

  // Asia-Pacific, large research contributors
  {
    code: 'CN',
    iso3: 'CHN',
    name: 'China',
    aliases: ['China', "People's Republic of China", 'PR China']
  },
  { code: 'JP', iso3: 'JPN', name: 'Japan', aliases: ['Japan', 'Nippon'] },
  { code: 'ID', iso3: 'IDN', name: 'Indonesia', aliases: ['Indonesia'] },
  {
    code: 'KR',
    iso3: 'KOR',
    name: 'Republic of Korea',
    aliases: ['Republic of Korea', 'South Korea', 'Korea']
  },
  { code: 'IN', iso3: 'IND', name: 'India', aliases: ['India', 'Bharat'] },
  { code: 'NZ', iso3: 'NZL', name: 'New Zealand', aliases: ['New Zealand', 'Aotearoa'] },

  // Americas (beyond US/Canada)
  { code: 'BR', iso3: 'BRA', name: 'Brazil', aliases: ['Brazil', 'Brasil'] },
  { code: 'MX', iso3: 'MEX', name: 'Mexico', aliases: ['Mexico', 'México'] },
  { code: 'AR', iso3: 'ARG', name: 'Argentina', aliases: ['Argentina'] },

  // Middle East / others likely to appear
  { code: 'IL', iso3: 'ISR', name: 'Israel', aliases: ['Israel'] },
  { code: 'TR', iso3: 'TUR', name: 'Turkey', aliases: ['Turkey', 'Türkiye'] },
  {
    code: 'SG',
    iso3: 'SGP',
    name: 'Singapore',
    aliases: ['Singapore', 'Republic of Singapore', 'Singapore, Singapore']
  },
  { code: 'TW', iso3: 'TWN', name: 'Taiwan', aliases: ['Taiwan'] },
  { code: 'UA', iso3: 'UKR', name: 'Ukraine', aliases: ['Ukraine'] },
  {
    code: 'IR',
    iso3: 'IRN',
    name: 'Iran',
    aliases: ['Iran', 'Islamic Republic of Iran', 'Iran, Islamic Republic of']
  },
  { code: 'JO', iso3: 'JOR', name: 'Jordan', aliases: ['Jordan'] },
  { code: 'QA', iso3: 'QAT', name: 'Qatar', aliases: ['Qatar'] },
  { code: 'CO', iso3: 'COL', name: 'Colombia', aliases: ['Colombia'] }
];
