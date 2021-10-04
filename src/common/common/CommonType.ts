export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : DeepPartial<T[P]>
};

export type Index<T> = {[key: string]: T};

export type PromiseReturn<T> = T extends PromiseLike<infer U> ? U : T

export type PromiseFnResult<T extends (...args: any[]) => Promise<object>> = PromiseReturn<ReturnType<T>>
