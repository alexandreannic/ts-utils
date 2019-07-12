import {performance} from 'perf_hooks';

const t0 = performance.now();
const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;

const to = (divideBy: number) => (perf: number): number => Math.floor(perf / divideBy);
const toSeconds = to(ONE_SECOND);
const toMinutes = to(ONE_MINUTE);
const toHour = to(ONE_HOUR);

export interface ElapsedTime {
  getPerformance: () => number
  getSeconds: () => number
  getMinutes: () => number
  getHour: () => number
  toString: () => string
}

export const formatPerformance = (perf: number): ElapsedTime => ({
  getPerformance: () => perf,
  getSeconds: () => toSeconds(perf),
  getMinutes: () => toMinutes(perf),
  getHour: () => toHour(perf),
  toString: () => `${toHour(perf)} Hr ${toMinutes(perf % ONE_HOUR)} Min ${toSeconds(perf % ONE_MINUTE)} Sec`
});

export const getElapsedTime = (init: number = t0): ElapsedTime => formatPerformance(performance.now() - init);
