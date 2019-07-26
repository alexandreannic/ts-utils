export const int = (x?: string): undefined | number => x ? parseInt(x) : undefined;

export const defaultValue = (value: string) => (x?: string): string => x || value;

export const required = (x?: string): string => {
  if (!x) throw new Error();
  return x;
};

export const bool = (x?: string): boolean | undefined => {
  if (x === 'true') return true;
  if (x === 'false') return false;
};
