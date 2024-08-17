import { useCallback } from 'preact/hooks';
import { useRosetta } from './useRosetta';

export function useNumberFormatter(options: Intl.NumberFormatOptions = {}) {
  const { locale } = useRosetta();
  
  return useCallback((number: number) => {
    return new Intl.NumberFormat(locale, options).format(number);
  }, [locale, options]);
}
