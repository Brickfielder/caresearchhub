# Heatmap country audit — 24 October 2026

Audited all 421 records at `8ec8477`. The map counts papers using the existing
corresponding/last-author affiliation proxy; these are not verified recruitment
countries, and a paper is not necessarily a distinct study.

## Cause and fix

Aggregation used literal country names, while Plotly independently resolved those
names to country polygons. Four separate entries resolved to the US: `United States`
(51), `USA` (2), `United States of America` (1), and
`Department of Emergency Medicine USA` (1). Overlapping polygons let a one-paper
entry obscure the larger US count. No other country had multiple aliases resolving
to the same polygon in this snapshot.

There was a second rendering issue: the 110m world boundaries omit Singapore,
despite its eight papers being counted. The map now uses Plotly's 50m boundaries,
which include Singapore (verified against both official TopoJSON boundary files).

The map now resolves exact country aliases/codes before aggregation and passes one
ISO-3 identifier per country to Plotly. Counts, hover text, and colours therefore
refer to the same aggregate. Regression tests cover aliases, record order,
corresponding-country precedence, blanks, unknown values, and every populated
country field in the repository. Future unsupported labels fail the coverage test.

## Reviewed metadata corrections

These record-specific corrections use the indexed author affiliations below.
Ambiguous fragments such as `MN` and `Washington` are not global country aliases.
Both source and generated data were updated.

| PMID / source | Previous country field | Corrected country | Affiliation evidence |
| --- | --- | --- | --- |
| [41343287](https://pubmed.ncbi.nlm.nih.gov/41343287/) | Chung Shan Medical University | Taiwan | Last author's Chung Shan Medical University Hospital affiliation, Taichung, Taiwan |
| [40419211](https://pubmed.ncbi.nlm.nih.gov/40419211/) | Boston MA | United States | Harvard Medical School, Boston, MA |
| [39531024](https://pubmed.ncbi.nlm.nih.gov/39531024/) | Aarhus Universitetshospital | Denmark | Aarhus University Hospital / Aarhus University |
| [38916592](https://pubmed.ncbi.nlm.nih.gov/38916592/) | Pennsylvania (Dr Elmer) | United States | University of Pittsburgh, Pennsylvania |
| [39491610](https://pubmed.ncbi.nlm.nih.gov/39491610/) | New York | United States | Columbia University Irving Medical Center, New York |
| [39482094](https://pubmed.ncbi.nlm.nih.gov/39482094/) | New York | United States | Columbia University Irving Medical Center, New York |
| [38456404](https://pubmed.ncbi.nlm.nih.gov/38456404/) | Department of Emergency Medicine National Taiwan University Medical College and Hospital Taipei Taiwan | Taiwan | National Taiwan University Medical College and Hospital, Taipei, Taiwan |
| [38019593](https://pubmed.ncbi.nlm.nih.gov/38019593/) | New York | United States | Columbia University / New York State Psychiatric Institute |
| [34988534](https://pubmed.ncbi.nlm.nih.gov/34988534/) | Oregon | United States | Oregon Health & Science University, Portland, Oregon |
| [40969403](https://pubmed.ncbi.nlm.nih.gov/40969403/) | Department of Emergency Medicine USA | United States | University of Colorado School of Medicine, Department of Emergency Medicine, USA |
| [32364618](https://pubmed.ncbi.nlm.nih.gov/32364618/) | Washington | United States | University of Washington, Seattle, Washington |
| [33268280](https://pubmed.ncbi.nlm.nih.gov/33268280/) | MN | United States | Mayo Clinic, Rochester, MN |

## Result

374 papers map to 31 countries; 47 records have no country information and remain
unassigned. Previously 10 papers with populated but unrecognised country fields
and Singapore's eight papers were absent from the rendered map. The long Taiwan affiliation and the US
department label already matched Plotly's fuzzy resolver; their correction cleans
the metadata without adding another paper.

| Country | Correct count | Finding |
| --- | ---: | --- |
| Denmark | 64 | Previously 63; one Aarhus affiliation was omitted |
| United States | 63 | Four overlapping groups totalled 55; eight more papers had unrecognised state/city labels |
| United Kingdom | 43 | Count unchanged |
| Sweden | 38 | Count unchanged |
| Netherlands | 23 | Count unchanged |
| Australia | 21 | Count unchanged |
| Canada | 19 | Count unchanged |
| Italy | 12 | Count unchanged |
| Germany | 11 | Count unchanged |
| France | 11 | Count unchanged |
| Norway | 11 | Count unchanged |
| Switzerland | 8 | Count unchanged |
| Singapore | 8 | Count unchanged; previously absent from the coarse map geometry |
| South Korea | 6 | Count unchanged |
| China | 5 | Count unchanged |
| Japan | 5 | Count unchanged |
| Austria | 3 | Count unchanged |
| Ireland | 3 | Count unchanged |
| Portugal | 3 | Count unchanged |
| India | 2 | Count unchanged |
| New Zealand | 2 | Count unchanged |
| Poland | 2 | Count unchanged |
| Spain | 2 | Count unchanged |
| Taiwan | 2 | Previously 1; one institution label was omitted |
| Colombia | 1 | Count unchanged |
| Indonesia | 1 | Count unchanged |
| Iran | 1 | Count unchanged |
| Israel | 1 | Count unchanged |
| Jordan | 1 | Count unchanged |
| Qatar | 1 | Count unchanged |
| Ukraine | 1 | Count unchanged |

Other countries' numeric counts are unchanged. Their shades may move slightly
because the maximum count increases from 63 to 64 on the shared colour scale.
