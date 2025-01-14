import React from 'react';
import Plot from 'react-plotly.js';

const PlotlyLineGraph = ({ data, GraphTitle, GraphWidth, GraphHeight, NameX, NameY }) => {
  return (
    <Plot
      data={data}
      layout={{
        width: GraphWidth,
        height: GraphHeight,
        title: { text: GraphTitle },
        xaxis: { title: { text: NameX } }, 
        yaxis: { title: { text: NameY } },
        paper_bgcolor: "rgba(0, 0, 0, 0)",
        plot_bgcolor: "rgba(0, 0, 0, 0)",
      }}
    />
  );
};

export default PlotlyLineGraph;
