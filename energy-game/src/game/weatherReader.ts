import type { WeatherDataPoint, WeatherDataEntry, Pipe } from './types';

let fs: any = null, path: any = null;
if (typeof window === 'undefined') {
  fs = await import('node:fs');
  path = await import('node:path');
}

const COUNTRIES: Record<string, string> = {
  AT: 'Austria', BE: 'Belgium', CH: 'Switzerland', CZ: 'Czechia', DE: 'Germany',
  DK1: 'Denmark', DK2: 'Denmark', FR: 'France', NL: 'Netherlands', PL: 'Poland',
  ES: 'Spain', GB: 'United Kingdom', IT: 'Italy', HU: 'Hungary', LT: 'Lithuania',
  NO1: 'Norway', NO2: 'Norway', NO5: 'Norway', SE3: 'Sweden', SE4: 'Sweden',
  SI: 'Slovenia', SK: 'Slovakia', UA: 'Ukraine'
};

const GEN_MAP: Record<string, string> = {
  WIND_ONSHORE: 'Wind', WIND_OFFSHORE: 'Wind', SOLAR: 'Solar',
  HYDRO_RESERVOIR: 'Water', HYDRO_RUN_OF_RIVER_POUNDAGE: 'Water',
  HYDRO_PUMPED_STORAGE: 'Water', FOSSIL_GAS: 'Fossil', FOSSIL_COAL: 'Fossil',
  FOSSIL_OIL: 'Fossil', FOSSIL_HARD_COAL: 'Fossil', FOSSIL_BROWN_COAL: 'Fossil',
  NUCLEAR: 'Nuclear', BIOMASS: 'Fossil', WASTE: 'Fossil', GEOTHERMAL: 'Fossil', OTHER: 'Fossil'
};

const getPath = () => (typeof process !== 'undefined' ? path.resolve(process.cwd(), '../dataset') : '');

const parseCSV = (p: string) => (fs?.existsSync(p) ? fs.readFileSync(p, 'utf-8').trim().split('\n').map((l: string) => l.split(',')) : []);

const findH = (rows: string[][]) => rows.findIndex(r => r.includes('time'));

export const getRandomWeatherDate = () => {
  if (!fs) return '2024-01-01T00:00';
  const file = path.join(getPath(), 'weather', 'DE-open-meteo-51.49N10.43E309m.csv');
  if (!fs.existsSync(file)) return '2024-01-01T00:00';
  const rows = parseCSV(file);
  const hIdx = findH(rows);
  if (hIdx === -1) return '2024-01-01T00:00';
  const data = rows.slice(hIdx + 1);
  return data[Math.floor(Math.random() * (data.length - 100))][rows[hIdx].indexOf('time')];
};

export function loadWeatherForDate(date: string) {
  const result: Record<string, WeatherDataEntry> = {};
  if (!fs) return result;

  const base = getPath();
  const wDir = path.join(base, 'weather'), lDir = path.join(base, 'total-load'), gDir = path.join(base, 'generation');

  Object.entries(COUNTRIES).forEach(([code, name]) => {
    try {
      const sCode = code.startsWith('DK') ? 'DK' : code;
      const wF = fs.readdirSync(wDir).find((f: string) => f.startsWith(sCode + '-'));
      const lF = fs.readdirSync(lDir).find((f: string) => f.startsWith(sCode + '-'));
      const gF = fs.readdirSync(gDir).find((f: string) => f.startsWith(code + '-'));

      if (!wF) return;
      const wRows = parseCSV(path.join(wDir, wF)), lRows = lF ? parseCSV(path.join(lDir, lF)) : [], gRows = gF ? parseCSV(path.join(gDir, gF)) : [];
      const hIdx = findH(wRows);
      if (hIdx === -1) return;
      const headers = wRows[hIdx], tIdx = headers.indexOf('time'), data = wRows.slice(hIdx + 1);
      const start = data.findIndex(l => l[tIdx] === date);
      if (start === -1) return;

      const num = (v: string) => isNaN(parseFloat(v)) ? 0 : parseFloat(v);

      const getPoint = (i: number): WeatherDataPoint | null => {
        if (i < 0 || i >= data.length) return null;
        const r = data[i];
        const p: WeatherDataPoint = {
          time: r[tIdx], Wind: 0, Solar: 0, Water: 0, Fossil: 0, Nuclear: 0, Consumption: 0, 
          Price: 50 + Math.random() * 20,
          temperature: num(r[headers.indexOf('temperature_2m (°C)')]),
          wind_speed: num(r[headers.indexOf('wind_speed_10m (km/h)')]),
          cloud_cover: num(r[headers.indexOf('cloud_cover (%)')])
        };

        const lhIdx = findH(lRows);
        if (lhIdx !== -1) {
          const lr = lRows.slice(lhIdx + 1).find(x => x[0] === p.time);
          if (lr) p.Consumption = num(lr[1]);
        }

        const ghIdx = findH(gRows);
        if (ghIdx !== -1) {
          gRows.slice(ghIdx + 1).filter(x => x[1] === p.time).forEach(x => {
            const t = GEN_MAP[x[0]] as any;
            if (t) p[t as keyof WeatherDataPoint] = num(x[2]);
          });
        }
        return p;
      };

      const curr = getPoint(start);
      if (curr) {
        result[name] = {
          current: curr,
          forecast: [1, 2, 3].map(d => getPoint(start + d * 24)).filter((x): x is WeatherDataPoint => x !== null)
        };
      }
    } catch (err) { console.error(`Failed ${name}:`, err); }
  });
  return result;
}

export function getHistoricalPipes(allowed?: string[]) {
  if (!fs) return [];
  const flowDir = path.join(getPath(), 'flows');
  if (!fs.existsSync(flowDir)) return [];

  const map: Record<string, number> = {};
  fs.readdirSync(flowDir).forEach((f: string) => {
    if (!f.endsWith('.csv')) return;
    const rows = parseCSV(path.join(flowDir, f)), h = findH(rows);
    if (h === -1) return;
    rows.slice(h + 1).forEach(r => {
      const v = parseFloat(r[2]);
      if (!isNaN(v) && (!map[r[0]] || v > map[r[0]])) map[r[0]] = v;
    });
  });

  const pipes: Pipe[] = [];
  Object.keys(map).forEach(z => {
    const [fc, tc] = z.split('->'), from = COUNTRIES[fc], to = COUNTRIES[tc];
    if (from && to && from !== to && (!allowed || (allowed.includes(from) && allowed.includes(to)))) {
      const e = pipes.find(p => (p.from === from && p.to === to) || (p.from === to && p.to === from));
      if (e) { if (map[z] > e.capacity) e.capacity = map[z]; }
      else pipes.push({ from, to, capacity: map[z] });
    }
  });
  return pipes;
}
