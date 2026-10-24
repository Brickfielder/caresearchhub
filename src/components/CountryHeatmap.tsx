/** @jsxImportSource react */
import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';
import papers from '@data/papers.normalized.json';
import { aggregateByCountry } from '../utils/countryHeatmap';

const { locations, z, text, unmappedCount } = aggregateByCountry(papers);

const CountryHeatmap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || locations.length === 0) return;

    const data = [
      {
        type: 'choropleth',
        locationmode: 'ISO-3',
        locations,
        z,
        text,
        hovertemplate: '%{text}<br>Papers: %{z}<extra></extra>',
        colorscale: 'Viridis',
        reversescale: true,
        colorbar: {
          title: 'Papers',
          orientation: 'h',
          x: 0.5,
          xanchor: 'center',
          y: -0.25,
          len: 0.7,
          thickness: 16
        }
      } as Partial<Plotly.PlotData>
    ];

    const layout: Partial<Plotly.Layout> = {
      title: 'Survivorship Research by Country',
      geo: {
        projection: { type: 'natural earth' },
        resolution: 110,
        showcountries: true,
        countrycolor: '#94a3b8'
      },
      margin: { t: 40, r: 0, b: 80, l: 0 }
    };

    Plotly.newPlot(containerRef.current, data, layout, { responsive: true });

    return () => {
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, []);

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
      <p className="text-center text-sm text-slate-600">
        {papers.length - unmappedCount} papers mapped across {locations.length} countries.
        {unmappedCount > 0 && ` ${unmappedCount} papers have no usable country information.`}
      </p>
    </div>
  );
};

export default CountryHeatmap;
