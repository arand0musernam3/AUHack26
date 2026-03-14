import type { WeatherDataPoint, WeatherDataEntry, Pipe } from './types';

let fs: any = null;
let path: any = null;

if (typeof window === 'undefined') {
  fs = await import('node:fs');
  path = await import('node:path');
}

const COUNTRY_MAP: Record<string, string> = {
  'AT': 'Austria', 'BE': 'Belgium', 'CH': 'Switzerland', 'CZ': 'Czechia',
  'DE': 'Germany', 'DK1': 'Denmark', 'DK2': 'Denmark', 'FR': 'France',
  'NL': 'Netherlands', 'PL': 'Poland', 'ES': 'Spain', 'GB': 'United Kingdom',
  'IT': 'Italy', 'HU': 'Hungary', 'LT': 'Lithuania', 'NO1': 'Norway',
  'NO2': 'Norway', 'NO5': 'Norway', 'SE3': 'Sweden', 'SE4': 'Sweden',
  'SI': 'Slovenia', 'SK': 'Slovakia', 'UA': 'Ukraine',
};

const GENERATION_MAPPING: Record<string, string> = {
  'WIND_ONSHORE': 'Wind', 'WIND_OFFSHORE': 'Wind', 'SOLAR': 'Solar',
  'HYDRO_RESERVOIR': 'Water', 'HYDRO_RUN_OF_RIVER_POUNDAGE': 'Water',
  'HYDRO_PUMPED_STORAGE': 'Water', 'FOSSIL_GAS': 'Fossil',
  'FOSSIL_COAL': 'Fossil', 'FOSSIL_OIL': 'Fossil', 'FOSSIL_HARD_COAL': 'Fossil',
  'FOSSIL_BROWN_COAL': 'Fossil', 'NUCLEAR': 'Nuclear', 'BIOMASS': 'Fossil', 
  'WASTE': 'Fossil', 'GEOTHERMAL': 'Fossil', 'OTHER': 'Fossil',
};

const getBasePath = () => {
  if (typeof process === 'undefined') return '';
  return path.resolve(process.cwd(), '../../../dataset');
};

function parseCSV(filePath: string): string[][] {
  if (!fs || !fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
  return lines.map((l: string) => l.split(','));
}

function findHeaderIndex(rows: string[][]): number {
  return rows.findIndex(r => r.includes('time'));
}

export function getRandomWeatherDate(): string {
  if (!fs) return '2024-01-01T00:00';
  const WEATHER_PATH = path.join(getBasePath(), 'weather');
  const firstFile = path.join(WEATHER_PATH, 'DE-open-meteo-51.49N10.43E309m.csv');
  if (!fs.existsSync(firstFile)) return '2024-01-01T00:00';
  
  const rows = parseCSV(firstFile);
  const headerIdx = findHeaderIndex(rows);
  if (headerIdx === -1) return '2024-01-01T00:00';
  const dataLines = rows.slice(headerIdx + 1);
  const timeIdx = rows[headerIdx].indexOf('time');
  const randomIndex = Math.floor(Math.random() * (dataLines.length - 24 * 4));
  return dataLines[randomIndex][timeIdx];
}

export function loadWeatherForDate(date: string): Record<string, WeatherDataEntry> {
  const result: Record<string, WeatherDataEntry> = {};
  if (!fs) return result;

  const BASE_PATH = getBasePath();
  const WEATHER_PATH = path.join(BASE_PATH, 'weather');
  const LOAD_PATH = path.join(BASE_PATH, 'total-load');
  const GEN_PATH = path.join(BASE_PATH, 'generation');

  const countryCodes = Object.keys(COUNTRY_MAP);

  countryCodes.forEach(code => {
    const countryName = COUNTRY_MAP[code];
    try {
      const searchCode = code.startsWith('DK') ? 'DK' : code;
      const weatherFile = fs.readdirSync(WEATHER_PATH).find((f: string) => f.startsWith(searchCode + '-'));
      const loadFile = fs.readdirSync(LOAD_PATH).find((f: string) => f.startsWith(searchCode + '-'));
      const genFile = fs.readdirSync(GEN_PATH).find((f: string) => f.startsWith(code + '-'));

      if (!weatherFile) return;

      const weatherRows = parseCSV(path.join(WEATHER_PATH, weatherFile));
      const loadRows = loadFile ? parseCSV(path.join(LOAD_PATH, loadFile)) : [];
      const genRows_raw = genFile ? parseCSV(path.join(GEN_PATH, genFile)) : [];

      const wHeaderIdx = findHeaderIndex(weatherRows);
      if (wHeaderIdx === -1) return;
      const wHeaders = weatherRows[wHeaderIdx];
      const wTimeIdx = wHeaders.indexOf('time');
      const wData = weatherRows.slice(wHeaderIdx + 1);
      const startIdx = wData.findIndex(line => line[wTimeIdx] === date);
      
      if (startIdx === -1) return;

      const safeFloat = (val: string) => {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      };

      const extractPoint = (idx: number): WeatherDataPoint | null => {
        if (idx < 0 || idx >= wData.length) return null;
        const row = wData[idx];
        if (!row || row.length < 5) return null;

        const time = row[wTimeIdx];
        const point: WeatherDataPoint = {
          time,
          Wind: 0, Solar: 0, Water: 0, Fossil: 0, Nuclear: 0,
          Consumption: 0, Price: 50 + Math.random() * 20, // Mock price if not in CSV
          temperature: safeFloat(row[wHeaders.indexOf('temperature_2m (°C)')]),
          wind_speed: safeFloat(row[wHeaders.indexOf('wind_speed_10m (km/h)')]),
          cloud_cover: safeFloat(row[wHeaders.indexOf('cloud_cover (%)')]),
        };

        const loadHeaderIdx = findHeaderIndex(loadRows);
        if (loadHeaderIdx !== -1) {
          const lData = loadRows.slice(loadHeaderIdx + 1);
          const loadRow = lData.find(r => r[0] === time);
          if (loadRow) point.Consumption = safeFloat(loadRow[1]);
        }

        const genHeaderIdx = findHeaderIndex(genRows_raw);
        if (genHeaderIdx !== -1) {
          const gData = genRows_raw.slice(genHeaderIdx + 1);
          const genRowsForTime = gData.filter(r => r[1] === time);
          genRowsForTime.forEach(r => {
            const type = GENERATION_MAPPING[r[0]] as any;
            if (type) point[type as keyof WeatherDataPoint] = safeFloat(r[2]);
          });
        }
        return point;
      };

      const current = extractPoint(startIdx);
      if (current) {
        result[countryName] = {
          current,
          forecast: [1, 2, 3]
            .map(d => extractPoint(startIdx + d * 24))
            .filter((p): p is WeatherDataPoint => p !== null)
        };
      }
    } catch (e) {
      console.error(`[WeatherReader] Error loading ${countryName}:`, e);
    }
  });
  return result;
}

export function getHistoricalPipes(allowedCountries?: string[]): Pipe[] {
  if (!fs) return [];
  const BASE_PATH = getBasePath();
  const FLOWS_PATH = path.join(BASE_PATH, 'flows');
  if (!fs.existsSync(FLOWS_PATH)) return [];

  const files = fs.readdirSync(FLOWS_PATH);
  const pipeMap: Record<string, number> = {};
  files.forEach((file: string) => {
    if (!file.endsWith('.csv')) return;
    const rows = parseCSV(path.join(FLOWS_PATH, file));
    const hIdx = findHeaderIndex(rows);
    if (hIdx === -1) return;
    const dataRows = rows.slice(hIdx + 1);
    dataRows.forEach(row => {
      if (row.length < 3) return;
      const zone = row[0];
      const val = parseFloat(row[2]);
      if (isNaN(val)) return;
      if (!pipeMap[zone] || val > pipeMap[zone]) pipeMap[zone] = val;
    });
  });

  const pipes: Pipe[] = [];
  Object.keys(pipeMap).forEach(zone => {
    const [fromCode, toCode] = zone.split('->');
    const from = COUNTRY_MAP[fromCode];
    const to = COUNTRY_MAP[toCode];
    if (from && to && from !== to) {
      if (allowedCountries && (!allowedCountries.includes(from) || !allowedCountries.includes(to))) return;
      const existing = pipes.find(p => (p.from === from && p.to === to) || (p.from === to && p.to === from));
      if (existing) {
        if (pipeMap[zone] > existing.capacity) existing.capacity = pipeMap[zone];
      } else {
        pipes.push({ from, to, capacity: pipeMap[zone] });
      }
    }
  });
  return pipes;
}
