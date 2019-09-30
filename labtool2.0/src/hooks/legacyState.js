import { useState } from 'react'

/*
 * compactState({ stateVariable: defaultValue })
 */
const useLegacyState = vars => {
  const _get = {}
  const _set = {}
  const keys = Object.keys(vars)
  const result = {}

  for (const key of keys) {
    [_get[key], _set[key]] = useState(vars[key]) // eslint-disable-line prettier/prettier
    // prettier complains about a missing ; (???) for the line above

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
