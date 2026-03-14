import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line
} from "react-simple-maps";

const MapChart = () => {
  const countryCenters = {
  "United Kingdom": [-1.1743, 52.3555],
  "Netherlands": [5.2913, 52.1326],
  "Germany": [10.4515, 51.1657],
  "Denmark": [9.5018, 56.2639],
  "Poland": [19.1451, 51.9194],
  "Czechia": [15.4730, 49.8175],
  "Austria": [14.5501, 47.5162],
  "Switzerland": [8.2275, 46.8182],
  "France": [2.2137, 46.2276]
};
const pipeConnections = [
  { from: "France", to: "Germany" },
  { from: "United Kingdom", to: "Netherlands" },
  { from: "Germany", to: "Poland" },
  { from: "Switzerland", to: "Austria" },
  { from: "Czechia", to: "Germany" },
  { from: "Denmark", to: "Germany" }
];
  const activeCountries = [
    "France",
    "Germany",
    "Austria",
    "Switzerland",
    "Netherlands",
    "Denmark",
    "Poland",
    "Czechia",
    "United Kingdom"
  ];
  const [selection, setSelection] = React.useState<string>("")

  return (
    <ComposableMap
      projection="geoAzimuthalEqualArea"
      projectionConfig={{
        rotate: [-10.0, -52.0, 0],
        center: [-5, 0],
        scale: 1500,
      }}
    >
      <Geographies
        geography="../../../countries-50m.json"
        fill="#D6D6DA"
        stroke="#FFFFFF"
        strokeWidth={0.5}
      >
        {({ geographies }) =>
          geographies.map((geo) => {
            const isActive = activeCountries.includes(geo.properties.name);
            const isSelected = geo.properties.name == selection;
            const fillColor = isSelected ? "#004b53" :
            (isActive ? "#00b5c9" : "#EAEAEC")
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => {
                  if (isActive) {
                    setSelection(geo.properties.name);
                  }
                }}
                style={{
                  default: {
                    // Active countries get a distinct color; others fade out
                    fill: fillColor,
                    outline: "none",
                    transition: "all 250ms",
                  },
                  hover: {
                    // Only show hover effects for active countries
                    fill: isActive ? "#00717d" : "#EAEAEC",
                    outline: "none",
                    cursor: isActive ? "pointer" : "default",
                  },
                  pressed: {
                    fill: isActive ? "#004b53" : "#EAEAEC",
                    outline: "none",
                  },
                }}
              />
            );
          })
        }
      </Geographies>
      {pipeConnections.map((pipe, i) => {
  const start = countryCenters[pipe.from];
  const end = countryCenters[pipe.to];
  

  return (
    <Line
      key={i}
      from={start}
      to={end}
        stroke="#00041a"
        strokeWidth={4}
        strokeLinecap="round"
    />
  );
})}
    </ComposableMap>
  );
};

export default MapChart;
