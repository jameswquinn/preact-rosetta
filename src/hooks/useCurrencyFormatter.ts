import { useNumberFormatter } from './useNumberFormatter';

export function useCurrencyFormatter(currency: string, options: Intl.NumberFormatOptions = {}) {
  return useNumberFormatter({
    style: 'currency',
    currency,
    ...options,
  });
}
