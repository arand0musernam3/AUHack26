import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
  ZoomableGroup,
} from "react-simple-maps";

const MapChart = () => {
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
  return (
    <ComposableMap
      projection="geoAzimuthalEqualArea"
      projectionConfig={{
        rotate: [-10.0, -52.0, 0],
        center: [-5, -3],
        scale: 1100,
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
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    // Active countries get a distinct color; others fade out
                    fill: isActive ? "#00b5c9" : "#EAEAEC",
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
                    fill: isActive ? "rgb(17, 204, 95)" : "#EAEAEC",
                    outline: "none",
                  },
                }}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
};

export default MapChart;
