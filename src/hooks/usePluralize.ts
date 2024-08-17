import { useCallback } from 'preact/hooks';
import { useRosetta } from './useRosetta';

export function usePluralize() {
  const { translate } = useRosetta();

  return useCallback((key: string, count: number, replacements: Record<string, any> = {}) => {
    const pluralKey = `${key}_${count === 1 ? 'one' : 'other'}`;
    return translate(pluralKey, { ...replacements, count });
  }, [translate]);
}
