import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line
} from "react-simple-maps";
import type { ActiveModifier, PlayedCard, Pipe, CountryWeatherData, ActivePipeModifier } from "../../game/types";
import worldData from "../../../countries-50m.json";

interface EuropeMapProps {
  weather_data: CountryWeatherData;
  pipes: Pipe[];
  onCountryClick?: (id: string) => void;
  onCountryHover?: (id: string | null) => void;
  onPipeHover?: (pipe: Pipe | null) => void;
  onPipeClick?: (id: string) => void;
  activeModifiers?: Record<string, ActiveModifier[]>;
  activePipeModifiers?: ActivePipeModifier[];
  pendingPlays?: PlayedCard[];
  isTargeting?: boolean;
  targetingType?: 'country' | 'pipe';
}

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
  "Finland": [25.7482, 61.9241],
  "Portugal": [-8.2245, 39.3999],
};

const getCountryId = (name: string): string => {
  const mapping: Record<string, string> = {
    'Germany': 'DE', 'France': 'FR', 'Spain': 'ES', 'Portugal': 'PT', 'Italy': 'IT',
    'Netherlands': 'NL', 'Belgium': 'BE', 'Denmark': 'DK', 'Norway': 'NO', 
    'Sweden': 'SE', 'Finland': 'FI', 'Poland': 'PL', 'Czechia': 'CZ', 
    'Austria': 'AT', 'Switzerland': 'CH'
  };
  return mapping[name] || name;
};

export const EuropeMap: React.FC<EuropeMapProps> = ({ 
  weather_data,
  pipes,
  onCountryClick, 
  onCountryHover,
  onPipeHover,
  onPipeClick,
  activeModifiers = {},
  activePipeModifiers = [],
  pendingPlays = [],
  isTargeting = false,
  targetingType = 'country'
}) => {
  const activeCountries = Object.keys(weather_data);

  const getCountryFill = (id: string, name: string) => {
    const isActive = activeCountries.includes(name);
    if (!isActive) return 'rgba(30, 42, 56, 0.2)';

    const active = activeModifiers[id] || [];
    const pending = pendingPlays.filter(p => p.target_country === id);

    if (active.some(a => a.type === 'POLAR_VORTEX')) return 'rgba(0, 229, 255, 0.7)';
    if (active.some(a => a.type === 'HEAT_DOME')) return 'rgba(255, 179, 0, 0.7)';
    if (active.some(a => a.type === 'MONSOON')) return 'rgba(41, 121, 255, 0.7)';
    if (active.some(a => a.type === 'DEAD_CALM')) return 'rgba(255, 87, 34, 0.7)';
    if (active.some(a => a.type === 'BOOST_ENERGY')) return 'rgba(118, 255, 3, 0.4)';
    if (active.some(a => a.type === 'NERF_ENERGY')) return 'rgba(255, 87, 34, 0.4)';

    if (pending.length > 0) return 'rgba(255, 255, 255, 0.4)';
    
    return 'rgba(0, 181, 201, 0.4)';
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#0a0c0f" }}>
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: [-10.0, -52.0, 0],
          center: [-5, 0],
          scale: 1600,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={worldData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name;
              const id = getCountryId(countryName);
              const isActive = activeCountries.includes(countryName);
              const isPending = pendingPlays.some(p => p.target_country === id);
              const fill = getCountryFill(id, countryName);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    if (isActive) onCountryHover?.(countryName);
                  }}
                  onMouseLeave={() => onCountryHover?.(null)}
                  onClick={() => {
                    if (isActive && targetingType === 'country') onCountryClick?.(id);
                  }}
                  style={{
                    default: {
                      fill: fill,
                      stroke: isPending ? 'var(--color-solar)' : '#1e2a38',
                      strokeWidth: isPending ? 2 : 0.5,
                      outline: "none",
                      transition: "all 250ms",
                    },
                    hover: {
                      fill: isActive ? (isTargeting && targetingType === 'country' ? "rgba(255, 179, 0, 0.6)" : "rgba(0, 113, 125, 0.8)") : fill,
                      stroke: isActive ? "#fff" : "#1e2a38",
                      strokeWidth: isActive ? 1 : 0.5,
                      outline: "none",
                      cursor: isActive ? "pointer" : "default",
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

          const isPending = pendingPlays.some(p => p.target_pipe?.from === pipe.from && p.target_pipe?.to === pipe.to);
          
          const activeBroken = activePipeModifiers.find(m => m.type === 'CUT_CONDUCT' && m.target.from === pipe.from && m.target.to === pipe.to);
          const activeDiscount = activePipeModifiers.find(m => m.type === 'DISCOUNT_CONDUCT' && m.target.from === pipe.from && m.target.to === pipe.to);

          let strokeColor = "rgba(0, 229, 255, 0.3)";
          if (activeBroken) strokeColor = "var(--color-fossil)"; // RED
          if (activeDiscount) strokeColor = "var(--color-nuclear)"; // GREEN
          if (isPending) strokeColor = "var(--color-solar)"; // YELLOW/ORANGE glow

          return (
            <Line
              key={`pipe-${i}`}
              from={start}
              to={end}
              stroke={strokeColor}
              strokeWidth={isPending ? 6 : 4} // Thicker pipes
              strokeLinecap="round"
              onMouseEnter={() => onPipeHover?.(pipe)}
              onMouseLeave={() => onPipeHover?.(null)}
              onClick={() => {
                if (targetingType === 'pipe') onPipeClick?.(`${pipe.from} ⇹ ${pipe.to}`);
              }}
              style={{
                default: { 
                  stroke: strokeColor, 
                  strokeWidth: isPending ? 6 : 4, 
                  transition: "all 250ms" 
                },
                hover: { 
                  stroke: isTargeting && targetingType === 'pipe' ? "var(--color-solar)" : "var(--color-wind)", 
                  strokeWidth: 8, 
                  cursor: "pointer" 
                }
              }}
            />
          );
        })}
      </ComposableMap>
    </div>
  );
};
