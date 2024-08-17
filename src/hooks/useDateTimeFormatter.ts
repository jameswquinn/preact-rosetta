import { useCallback } from 'preact/hooks';
import { useRosetta } from './useRosetta';

export function useDateTimeFormatter(options: Intl.DateTimeFormatOptions = {}) {
  const { locale } = useRosetta();
  
  return useCallback((date: Date | number) => {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }, [locale, options]);
}
