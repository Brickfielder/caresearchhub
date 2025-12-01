/** @jsxImportSource react */
import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';
import papers from '@data/papers.normalized.json';

type Paper = {
  country?: string;
  corrCountryName?: string;
};

function aggregateByCountry(papers: Paper[]) {
  const counts = new Map<string, number>();

  for (const p of papers) {
    const country = (p.corrCountryName || p.country || '').trim();
    if (!country) continue;

    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  const locations: string[] = [];
  const z: number[] = [];

  for (const [country, count] of counts.entries()) {
    locations.push(country);
    z.push(count);
  }

  return { locations, z };
}

const CountryHeatmap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const { locations, z } = aggregateByCountry(papers as Paper[]);

    if (!containerRef.current || locations.length === 0) return;

    const heatmapColors = [
      '#000004', // deep black
      '#1b0c41', // dark plum
      '#4a0c6b', // brand-like purple
      '#781c6d', // magenta-purple
      '#b52f8c', // bright magenta
      '#e77f62', // orange-gold
      '#fcffa4' // pale yellow
    ];

    const colorscale: Plotly.ColorScale = heatmapColors.map((color, index) => [
      index / (heatmapColors.length - 1),
      color
    ]);

    const data = [
      {
        type: 'choropleth',
        locationmode: 'country names',
        locations,
        z,
        colorscale,
        reversescale: false,
        marker: {
          line: {
            color: '#cbd5e1',
            width: 0.5
          }
        },
        colorbar: {
          title: {
            text: 'Papers',
            font: { color: '#0f172a', size: 14 }
          },
          tickfont: { color: '#0f172a', size: 12 },
          orientation: 'h',
          x: 0.5,
          xanchor: 'center',
          y: -0.25,
          len: 0.7,
          thickness: 16,
          bgcolor: 'rgba(255,255,255,0.9)',
          outlinewidth: 0
        }
      } as Partial<Plotly.PlotData>
    ];

    const layout: Partial<Plotly.Layout> = {
      title: 'Survivorship Research by Country',
      geo: {
        projection: { type: 'natural earth' },
        bgcolor: 'rgba(0,0,0,0)',
        showframe: false,
        showcoastlines: true,
        coastlinecolor: '#0f172a',
        showcountries: true,
        countrycolor: '#e2e8f0'
      },
      font: { color: '#0f172a', family: 'Inter, system-ui, -apple-system, sans-serif' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { t: 40, r: 0, b: 80, l: 0 }
    };

    Plotly.newPlot(containerRef.current, data, layout, { responsive: true });

    return () => {
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '500px' }} />;
};

export default CountryHeatmap;
