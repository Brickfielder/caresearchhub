import type { Paper } from './types';

export const studyDesigns = [
  'Intervention or trial',
  'Observational',
  'Qualitative or mixed methods',
  'Review',
  'Protocol',
  'Other or unclear'
] as const;

export const populations = [
  'Survivors/patients',
  'Family/caregivers',
  'Healthcare professionals',
  'Bystanders/public'
] as const;

export const recoveryStages = [
  ['early', 'Early recovery (up to 3 months)'],
  ['medium', 'Medium term (>3 to 12 months)'],
  ['long', 'Long term (>12 months)']
] as const;

const paperText = (paper: Paper): string => `${paper.title}\n${paper.abstract ?? ''}`.toLowerCase();

export const getPaperCountry = (paper: Paper): string | undefined =>
  paper.corrCountryName || paper.country;

export const classifyStudyDesign = (paper: Paper): string => {
  const title = paper.title.toLowerCase();
  const text = paperText(paper);
  if (/\bprotocol\b/.test(title)) return 'Protocol';
  if (
    /systematic review|scoping review|meta-analysis|literature review|narrative review/.test(text)
  ) {
    return 'Review';
  }
  if (
    /randomi[sz]ed|controlled trial|clinical trial|intervention study|feasibility study|pilot study|quasi-experimental/.test(
      text
    )
  ) {
    return 'Intervention or trial';
  }
  if (
    /qualitative|mixed[- ]methods|interview|focus group|thematic analysis|phenomenolog|ethnograph/.test(
      text
    )
  ) {
    return 'Qualitative or mixed methods';
  }
  if (
    /cohort|cross-sectional|observational|registry|retrospective|prospective|survey|case-control|longitudinal/.test(
      text
    )
  ) {
    return 'Observational';
  }
  return 'Other or unclear';
};

export const classifyPopulations = (paper: Paper): string[] => {
  const text = paperText(paper);
  return populations.filter((population) => {
    const pattern = {
      'Survivors/patients': /\bsurvivor|\bpatient/,
      'Family/caregivers':
        /\bcaregiver|\bcarer|\bfamil(?:y|ies)|\brelative|\bpartner|\bspouse|co-survivor|next[- ]of[- ]kin/,
      'Healthcare professionals':
        /healthcare professional|health care professional|\bclinician|\bnurse|\bphysician|\bparamedic|emergency medical|\bprovider/,
      'Bystanders/public': /\bbystander|lay responder|\blayperson|\bpublic\b/
    }[population];
    return pattern.test(text);
  });
};

export const classifyRecoveryStages = (paper: Paper): string[] => {
  const text = paperText(paper);
  const stages = new Set<string>();
  const timePattern =
    /\b((?:\d+(?:\.\d+)?\s*(?:(?:,|and|to|–|-)\s*)?)+)\s*(weeks?|months?|mos\.?|years?|yrs\.?)\b/g;

  for (const match of text.matchAll(timePattern)) {
    const values = match[1].match(/\d+(?:\.\d+)?/g) ?? [];
    const unit = match[2];
    values.forEach((rawValue) => {
      let months = Number(rawValue);
      if (unit.startsWith('week')) months /= 4.35;
      if (unit.startsWith('year') || unit.startsWith('yr')) months *= 12;
      stages.add(months <= 3 ? 'early' : months <= 12 ? 'medium' : 'long');
    });
  }

  if (/\bearly[- ]phase|\bacute\b|post-discharge|short[- ]term/.test(text)) stages.add('early');
  if (/\blong[- ]term|several years|chronic/.test(text)) stages.add('long');
  return recoveryStages.map(([value]) => value).filter((value) => stages.has(value));
};
