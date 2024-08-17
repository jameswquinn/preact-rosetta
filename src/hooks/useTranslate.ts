import { useRosetta } from './useRosetta';

export function useTranslate() {
  const { translate } = useRosetta();
  return translate;
}
