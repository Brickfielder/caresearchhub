declare module 'plotly.js-dist' {
  namespace Plotly {
    interface PlotData {
      [key: string]: unknown;
    }

    interface Layout {
      [key: string]: unknown;
    }
  }

  const Plotly: {
    newPlot: (...args: unknown[]) => Promise<void> | void;
    react: (...args: unknown[]) => Promise<void> | void;
    purge: (root: HTMLElement) => void;
  };

  export = Plotly;
}
