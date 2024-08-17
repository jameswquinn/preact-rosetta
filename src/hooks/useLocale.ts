import { useRosetta } from './useRosetta';

export function useLocale() {
  const { locale, setLocale, loading } = useRosetta();
  return { locale, setLocale, loading };
}
