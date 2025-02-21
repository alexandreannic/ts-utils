interface FnSwitch {
  <T extends string | number | symbol, R = any>(value: T, cases: {[key in T]: ((_: T) => R) | R}): R

  <T extends string | number | symbol, R = any>(
    value: T,
    cases: Partial<{[key in T]: ((_: T) => R) | R}>,
    defaultCase: (_: T) => R,
  ): R
}

/**
 * @deprecated Use `match` instead.
 */
export const fnSwitch: FnSwitch = (value, cases, defaultCase?) => {
  const isHandled = Object.keys(cases).includes(value as any)
  if (!isHandled) {
    if (!defaultCase) {
      throw new Error(`
        [fnSwitch] ${String(value)} does not match any of theses cases ${Object.keys(cases).join(', ')}
        and defaultCase parameter is not provided.
      `)
    }
    return (defaultCase as any)(value)
  }
  const res = cases[value]
  return typeof res === 'function' ? res(value) : res
}
