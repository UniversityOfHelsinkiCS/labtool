import { useState, useEffect } from 'react'

export default (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState()

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}
