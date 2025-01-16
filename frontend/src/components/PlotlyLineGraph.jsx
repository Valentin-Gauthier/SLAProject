import React from 'react';
import Plot from 'react-plotly.js';

const PlotlyLineGraph = ({ data, GraphTitle, GraphWidth, GraphHeight, NameX, NameY }) => {
  return (
    <Plot
      data={data}
      layout={{
        width: GraphWidth,
        height: GraphHeight,
        title: { text: GraphTitle, font: {color: "#FFFFFF"} },
        xaxis: { title: { text: NameX, font: {color: "#FFFFFF" } } }, 
        yaxis: { title: { text: NameY, font: {color: "#FFFFFF" } } },
        paper_bgcolor: "rgba(0, 0, 0, 0)",
        plot_bgcolor: "rgba(0, 0, 0, 0)",
      }}
    />
  );
};

export default PlotlyLineGraph;
