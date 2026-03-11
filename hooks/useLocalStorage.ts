
import { useState, useEffect, Dispatch, SetStateAction, useCallback, useRef } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
        return { ...defaultValue, ...parsed };
      }
      return parsed as T;
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      return defaultValue;
    }
  }
  return defaultValue;
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const setStoredValue: Dispatch<SetStateAction<T>> = useCallback((valOrFn) => {
    setValue(prev => {
      const newValue = valOrFn instanceof Function ? valOrFn(prev) : valOrFn;
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (e) {
        console.error(`Error saving to localStorage key "${key}":`, e);
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          alert('Warning: Local storage is full. Some data might not be saved.');
        }
      }
      return newValue;
    });
  }, [key]);

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          if (JSON.stringify(newValue) !== JSON.stringify(valueRef.current)) {
            setValue(newValue);
          }
        } catch (err) {
          console.error(`Error parsing storage event for key "${key}":`, err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [value, setStoredValue];
}
