import { performance } from 'perf_hooks';

const t0 = performance.now();
const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;

const to = (divideBy: number) => (perf: number): number => Math.round(perf / divideBy);
const toSeconds = to(ONE_SECOND);
const toMinutes = to(ONE_MINUTE);
const toHour = to(ONE_HOUR);

export interface ElapsedTime {
  getSeconds: () => number
  getMinutes: () => number
  getHour: () => number
  toString: () => string
}

export const getElapsedTime = (init: number = t0): ElapsedTime => {
  const d = performance.now() - init;
  return {
    getSeconds: () => toSeconds(d),
    getMinutes: () => toMinutes(d),
    getHour: () => toHour(d),
    toString: () => `${toHour(d)} Hr ${toMinutes(d % ONE_HOUR)} Min ${toSeconds(d % ONE_MINUTE)} Sec`
  };
};
