import { useState } from 'react'

/* eslint react-hooks/rules-of-hooks: off */
// leave me alone, I know what I'm doing

/*
 * useLegacyState({ stateVariable: defaultValue })
 */
const useLegacyState = vars => {
  const _get = {}
  const _set = {}
  const keys = Object.keys(vars)
  const result = {}

  for (const key of keys) {
    const [g, s] = useState(vars[key])
    _get[key] = g
    _set[key] = s

    Object.defineProperty(result, key, {
      enumerable: false,
      configurable: false,
      get: () => _get[key],
      set: val => _set[key](val)
    })
  }

  return result
}

export default useLegacyState
