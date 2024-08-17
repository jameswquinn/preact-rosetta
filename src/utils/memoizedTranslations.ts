export function memoizedTranslations<T extends Record<string, any>>(translations: T): T {
  const memoized: Partial<T> = {};
  
  Object.keys(translations).forEach(key => {
    Object.defineProperty(memoized, key, {
      get: () => translations[key],
      enumerable: true,
    });
  });

  return memoized as T;
}
