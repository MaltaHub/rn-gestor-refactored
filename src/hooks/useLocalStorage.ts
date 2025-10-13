"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar localStorage de forma type-safe e com SSR-safety
 * 
 * @param key - Chave do localStorage
 * @param initialValue - Valor inicial (usado no SSR e quando não há valor armazenado)
 * @returns [valor, setter, remover]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Estado com valor inicial estável (evita hydration mismatch)
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Carrega valor do localStorage após mount (client-side apenas)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error loading localStorage key "${key}":`, error);
    }
    
  }, [key]);

  // Setter que atualiza estado e localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Permite função updater como useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);

        // Salva no localStorage (apenas client-side)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remover do localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook simplificado para valores primitivos (string, number, boolean)
 */
export function useLocalStorageValue<T extends string | number | boolean>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useLocalStorage(key, initialValue);
  return [value, setValue];
}
