import { useState } from 'react'

/*
 * compactState({ stateVariable: defaultValue })
 */
const compactState = (vars) => {
  const _get = {}
  const _set = {}
  const keys = Object.keys(vars)
  const result = {}

  for (const key of keys) {
    [_get[key], _set[key]] = useState(vars[key])
    Object.defineProperty(result, key, {
      enumerable: false,
      configurable: false,
      get: () => {
        return _get[key]
      },
      set: (val) => {
        _set[key](val)
      }
    })
  }

  return result
}

export default compactState
