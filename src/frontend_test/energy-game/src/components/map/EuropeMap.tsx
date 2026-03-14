import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line
} from "react-simple-maps";
import type { CountryWeatherData, Pipe } from "../../game/types";

interface MapChartProps {
  weather_data: Record<string, CountryWeatherData>;
  pipes: Pipe[];
}

const MapChart: React.FC<MapChartProps> = ({ weather_data, pipes }) => {
  React.useEffect(() => {
    console.log("MapChart received weather_data:", weather_data);
    console.log("MapChart received pipes:", pipes);
  }, [weather_data, pipes]);

  const countryCenters: Record<string, [number, number]> = {
    "Netherlands": [5.2913, 52.1326],
    "Germany": [10.4515, 51.1657],
    "Denmark": [9.5018, 56.2639],
    "Poland": [19.1451, 51.9194],
    "Czechia": [15.4730, 49.8175],
    "Austria": [14.5501, 47.5162],
    "Switzerland": [8.2275, 46.8182],
    "France": [2.2137, 46.2276],
    "Belgium": [4.4699, 50.5039],
    "Spain": [-3.7492, 40.4637],
    "United Kingdom": [-1.1743, 52.3555],
    "Norway": [8.4689, 60.4720],
    "Sweden": [18.6435, 60.1282],
    "Italy": [12.5674, 41.8719],
    "Hungary": [19.0402, 47.1625],
    "Lithuania": [23.8813, 55.1694],
    "Slovenia": [14.9955, 46.1512],
    "Slovakia": [19.6990, 48.6690],
    "Ukraine": [31.1656, 48.3794],
  };

  const activeCountries = Object.keys(weather_data);
  const [selection, setSelection] = React.useState<string>("")
  const [hoveredCountry, setHoveredCountry] = React.useState<string | null>(null);
  const [hoveredPipe, setHoveredPipe] = React.useState<Pipe | null>(null);

  const formatWeather = (country: string) => {
    const data = weather_data[country];
    if (!data) return null;
    
    const totalGen = data.current.generation ? Object.values(data.current.generation).reduce((a, b) => a + b, 0) : 0;

    return (
      <div style={{
        backgroundColor: "rgba(0, 5, 10, 0.95)",
        color: "#fff",
        padding: "12px",
        borderRadius: "2px",
        fontSize: "11px",
        pointerEvents: "none",
        zIndex: 1000,
        position: "absolute",
        top: 10,
        left: 10,
        border: "1px solid #00b5c9",
        boxShadow: "0 0 10px rgba(0, 181, 201, 0.3)",
        fontFamily: "'JetBrains Mono', monospace",
        minWidth: "200px"
      }}>
        <div style={{ fontWeight: "bold", borderBottom: "1px solid #00b5c9", marginBottom: "8px", paddingBottom: "4px", color: "#00b5c9" }}>
          {country.toUpperCase()} STATUS
        </div>
        
        <div style={{ marginBottom: "8px" }}>
          <div style={{ color: "#aaa", fontSize: "9px" }}>METRICS:</div>
          <div>TEMP: {data.current.temperature}°C</div>
          <div>WIND: {data.current.wind_speed} km/h</div>
          <div>CLOUD: {data.current.cloud_cover}%</div>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <div style={{ color: "#aaa", fontSize: "9px" }}>GRID LOAD:</div>
          <div>CONS: {data.current.consumption?.toLocaleString() || 'N/A'} MW</div>
          <div>GEN : {totalGen.toLocaleString() || 'N/A'} MW</div>
        </div>

        {data.current.mix_percentages && (
          <div style={{ marginBottom: "8px" }}>
            <div style={{ color: "#aaa", fontSize: "9px" }}>ENERGY MIX:</div>
            {Object.entries(data.current.mix_percentages).map(([type, pct]) => (
              pct > 0 ? <div key={type}>{type.padEnd(8)}: {pct.toFixed(1)}%</div> : null
            ))}
          </div>
        )}

        <div style={{ borderTop: "1px solid #333", marginTop: "8px", paddingTop: "4px" }}>
          <div style={{ color: "#aaa", fontSize: "9px" }}>3-DAY FORECAST:</div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            {data.forecast.map((f, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ color: '#00b5c9' }}>D+{i+1}</div>
                <div>{f.temperature}°C</div>
                <div>{f.wind_speed}k</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {hoveredCountry && formatWeather(hoveredCountry)}
      {hoveredPipe && (
        <div style={{
          backgroundColor: "rgba(0, 5, 10, 0.95)",
          color: "#fff",
          padding: "10px",
          borderRadius: "2px",
          fontSize: "11px",
          pointerEvents: "none",
          zIndex: 1000,
          position: "absolute",
          top: 10,
          right: 10,
          border: "1px solid #00b5c9",
          boxShadow: "0 0 10px rgba(0, 181, 201, 0.3)",
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          <div style={{ fontWeight: "bold", borderBottom: "1px solid #00b5c9", marginBottom: "4px", color: "#00b5c9" }}>
            INTERCONNECTION
          </div>
          <div>{hoveredPipe.from} ⇹ {hoveredPipe.to}</div>
          <div>MAX CAPACITY: {hoveredPipe.capacity.toLocaleString()} MW</div>
        </div>
      )}
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
              const countryName = geo.properties.name;
              const isActive = activeCountries.includes(countryName);
              const isSelected = countryName == selection;
              const fillColor = isSelected ? "#004b53" :
              (isActive ? "#00b5c9" : "#EAEAEC")
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    if (isActive) setHoveredCountry(countryName);
                  }}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => {
                    if (isActive) {
                      setSelection(countryName);
                    }
                  }}
                  style={{
                    default: {
                      fill: fillColor,
                      outline: "none",
                      transition: "all 250ms",
                    },
                    hover: {
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
        {pipes.map((pipe, i) => {
          const start = countryCenters[pipe.from];
          const end = countryCenters[pipe.to];
          if (!start || !end) return null;

          return (
            <Line
              key={i}
              from={start}
              to={end}
              stroke="#00041a"
              strokeWidth={2}
              strokeLinecap="round"
              onMouseEnter={() => setHoveredPipe(pipe)}
              onMouseLeave={() => setHoveredPipe(null)}
              style={{
                default: { stroke: "#00041a", strokeWidth: 2, transition: "all 250ms" },
                hover: { stroke: "#00b5c9", strokeWidth: 4, cursor: "pointer" }
              }}
            />
          );
        })}
      </ComposableMap>
    </div>
  );
};

export default MapChart;
