export const SECOND = (x: number = 1): number => x * 1000;
export const MINUTE = (x: number = 1): number => x * 60 * SECOND();
export const HOUR = (x: number = 1): number => x * 60 * MINUTE();
export const DAY = (x: number = 1): number => x * 24 * HOUR();

export type TimeUnit = typeof SECOND | typeof MINUTE | typeof HOUR | typeof DAY;

export type Duration = number;

export type DurationReturn = number & {
  toMs: number
  toSeconds: number
  toMinutes: number
  toHours: number
  toDays: number
  valueOf: () => number
  toString: () => string
};

interface DurationConstructor {
  (value: any, unit?: TimeUnit): DurationReturn;
}

const toSeconds = (x: number) => Math.floor(x / 1000);
const toMinutes = (x: number) => Math.floor(toSeconds(x) / 60);
const toHours = (x: number) => Math.floor(toMinutes(x) / 60);
const toDays = (x: number) => Math.floor(toHours(x) / 24);

export const duration: DurationConstructor = (value: number, unit?: TimeUnit) => {
  const toMs = unit ? unit(value) : value;
  return {
    toMs,
    toSeconds: toSeconds(toMs),
    toMinutes: toMinutes(toMs),
    toHours: toHours(toMs),
    toDays: toDays(toMs),
    valueOf: (): number => toMs,
    toString: (): string => {
      const print = (value: number, suffix: string) => value > 0 ? `${value} ${suffix} ` : '';
      return (''
        + `${print(toDays(toMs), 'Days')}`
        + `${print(toHours(toMs % DAY()), 'Hr')}`
        + `${print(toMinutes(toMs % HOUR()), 'Min')}`
        + `${print(toSeconds(toMs % MINUTE()), 'Sec')}`
      ).trim();
    }
  } as never as DurationReturn;
};
