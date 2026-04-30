import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) {
        return typeof initialValue === 'function' ? initialValue() : initialValue;
      }
      return JSON.parse(stored);
    } catch (err) {
      console.warn(`useLocalStorage: failed to read "${key}"`, err);
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`useLocalStorage: failed to write "${key}"`, err);
    }
  }, [key, value]);

  const reset = useCallback(() => {
    const fresh = typeof initialValue === 'function' ? initialValue() : initialValue;
    setValue(fresh);
  }, [initialValue]);

  return [value, setValue, reset];
}
