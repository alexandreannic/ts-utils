type Func<A, R> = (a1: A) => R
type Func1<R> = (a1?: string) => R

interface Pipe {
  (): Func<string, string | undefined>
  <R>(f1: Func1<R>): Func<string, R>
  <A, R>(f1: Func1<A>, f2: Func<A, R>): Func<string, R>
  <A, B, R>(f1: Func1<A>, f2: Func<A, B>, f3: Func<B, R>): Func<string, R>
  <A, B, C, R>(f1: Func1<A>, f2: Func<A, B>, f3: Func<B, C>, f4: Func<C, R>): Func<string, R>
}

export const env: Pipe = (...funcs: any[]) => (envname: string) => {
  if (funcs.length === 0) {
    return (arg: any) => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a: any, b: any) => (...args: any[]) => a(b(...args)))(process.env[envname]);
};
