# Preact Rosetta

Preact Rosetta is a powerful and flexible internationalization (i18n) library for Preact applications. It provides a simple yet comprehensive solution for managing translations, formatting dates, numbers, and currencies, and handling pluralization.

## Table of Contents

1. [File Structure](#file-structure)
2. [File Contents](#file-contents)
3. [Setup Instructions](#setup-instructions)
4. [Publishing to npm](#publishing-to-npm)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [Contributing](#contributing)
8. [License](#license)

## File Structure

```
preact-rosetta/
├── src/
│   ├── hooks/
│   │   ├── useRosetta.ts
│   │   ├── useTranslate.ts
│   │   ├── useLocale.ts
│   │   ├── useDateTimeFormatter.ts
│   │   ├── useNumberFormatter.ts
│   │   ├── useCurrencyFormatter.ts
│   │   └── usePluralize.ts
│   ├── utils/
│   │   └── memoizedTranslations.ts
│   ├── RosettaProvider.tsx
│   └── index.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .npmignore
└── README.md
```

## File Contents

### src/index.ts

```typescript
export { RosettaProvider } from './RosettaProvider';
export { useRosetta } from './hooks/useRosetta';
export { useTranslate } from './hooks/useTranslate';
export { useLocale } from './hooks/useLocale';
export { useDateTimeFormatter } from './hooks/useDateTimeFormatter';
export { useNumberFormatter } from './hooks/useNumberFormatter';
export { useCurrencyFormatter } from './hooks/useCurrencyFormatter';
export { usePluralize } from './hooks/usePluralize';
export { memoizedTranslations } from './utils/memoizedTranslations';
```

### src/RosettaProvider.tsx

```typescript
import { createContext, useState, useCallback, useMemo, useRef, ComponentChildren } from 'preact/compat';

export interface RosettaContextType {
  locale: string;
  fallbackLocale: string;
  translations: Record<string, any>;
  translate: (key: string, replacements?: Record<string, any>, options?: TranslateOptions) => string;
  setLocale: (newLocale: string) => Promise<void>;
  addTranslations: (newTranslations: Record<string, any>, locale?: string) => void;
  formatMessage: (messageDescriptor: MessageDescriptor, values?: Record<string, any>) => string;
  loading: boolean;
}

export interface RosettaProviderProps {
  children: ComponentChildren;
  initialLocale: string;
  initialTranslations: Record<string, any>;
  fallbackLocale?: string;
  loadTranslation?: (locale: string) => Promise<Record<string, any>>;
}

export interface TranslateOptions {
  locale?: string;
  fallback?: string;
  namespace?: string;
}

export interface MessageDescriptor {
  id: string;
  defaultMessage?: string;
}

export const RosettaContext = createContext<RosettaContextType | null>(null);

const deepMerge = (target: Record<string, any>, source: Record<string, any>): Record<string, any> => {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

const isObject = (item: any): item is Record<string, any> => {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

export function RosettaProvider({
  children,
  initialLocale,
  initialTranslations,
  fallbackLocale = 'en',
  loadTranslation
}: RosettaProviderProps) {
  const [currentLocale, setCurrentLocale] = useState(initialLocale);
  const [translations, setTranslations] = useState(initialTranslations);
  const [loading, setLoading] = useState(false);
  const loadTranslationRef = useRef(loadTranslation);

  const translate = useCallback((key: string, replacements: Record<string, any> = {}, options: TranslateOptions = {}) => {
    const { locale = currentLocale, fallback, namespace } = options;
    const keys = key.split('.');
    let translation: any = namespace 
      ? translations[locale]?.[namespace]?.[keys[0]] 
      : translations[locale]?.[keys[0]];
    
    for (let i = 1; i < keys.length; i++) {
      translation = translation?.[keys[i]];
      if (!translation) break;
    }

    translation = translation || translations[fallbackLocale]?.[keys[0]] || fallback || key;
    
    if (typeof translation === 'function') {
      return translation(replacements);
    }

    Object.entries(replacements).forEach(([placeholder, value]) => {
      translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), value);
    });

    return translation;
  }, [currentLocale, translations, fallbackLocale]);

  const setLocale = useCallback(async (newLocale: string) => {
    if (newLocale === currentLocale) return;

    setLoading(true);
    try {
      if (loadTranslationRef.current) {
        const newTranslations = await loadTranslationRef.current(newLocale);
        setTranslations(prevTranslations => deepMerge(prevTranslations, { [newLocale]: newTranslations }));
      }
      setCurrentLocale(newLocale);
    } catch (error) {
      console.error('Failed to set new locale:', error);
    } finally {
      setLoading(false);
    }
  }, [currentLocale]);

  const addTranslations = useCallback((newTranslations: Record<string, any>, locale: string = currentLocale) => {
    setTranslations(prevTranslations => deepMerge(prevTranslations, { [locale]: newTranslations }));
  }, [currentLocale]);

  const formatMessage = useCallback((messageDescriptor: MessageDescriptor, values: Record<string, any> = {}) => {
    return translate(messageDescriptor.id, values, { fallback: messageDescriptor.defaultMessage });
  }, [translate]);

  const contextValue = useMemo(() => ({
    locale: currentLocale,
    fallbackLocale,
    translations,
    translate,
    setLocale,
    addTranslations,
    formatMessage,
    loading
  }), [currentLocale, fallbackLocale, translations, translate, setLocale, addTranslations, formatMessage, loading]);

  return (
    <RosettaContext.Provider value={contextValue}>
      {children}
    </RosettaContext.Provider>
  );
}
```

### src/hooks/useRosetta.ts

```typescript
import { useContext } from 'preact/hooks';
import { RosettaContext, RosettaContextType } from '../RosettaProvider';

export function useRosetta(): RosettaContextType {
  const context = useContext(RosettaContext);
  if (!context) {
    throw new Error('useRosetta must be used within a RosettaProvider');
  }
  return context;
}
```

### src/hooks/useTranslate.ts

```typescript
import { useRosetta } from './useRosetta';

export function useTranslate() {
  const { translate } = useRosetta();
  return translate;
}
```

### src/hooks/useLocale.ts

```typescript
import { useRosetta } from './useRosetta';

export function useLocale() {
  const { locale, setLocale, loading } = useRosetta();
  return { locale, setLocale, loading };
}
```

### src/hooks/useDateTimeFormatter.ts

```typescript
import { useCallback } from 'preact/hooks';
import { useRosetta } from './useRosetta';

export function useDateTimeFormatter(options: Intl.DateTimeFormatOptions = {}) {
  const { locale } = useRosetta();
  
  return useCallback((date: Date | number) => {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }, [locale, options]);
}
```

### src/hooks/useNumberFormatter.ts

```typescript
import { useCallback } from 'preact/hooks';
import { useRosetta } from './useRosetta';

export function useNumberFormatter(options: Intl.NumberFormatOptions = {}) {
  const { locale } = useRosetta();
  
  return useCallback((number: number) => {
    return new Intl.NumberFormat(locale, options).format(number);
  }, [locale, options]);
}
```

### src/hooks/useCurrencyFormatter.ts

```typescript
import { useNumberFormatter } from './useNumberFormatter';

export function useCurrencyFormatter(currency: string, options: Intl.NumberFormatOptions = {}) {
  return useNumberFormatter({
    style: 'currency',
    currency,
    ...options,
  });
}
```

### src/hooks/usePluralize.ts

```typescript
import { useCallback } from 'preact/hooks';
import { useRosetta } from './useRosetta';

export function usePluralize() {
  const { translate } = useRosetta();

  return useCallback((key: string, count: number, replacements: Record<string, any> = {}) => {
    const pluralKey = `${key}_${count === 1 ? 'one' : 'other'}`;
    return translate(pluralKey, { ...replacements, count });
  }, [translate]);
}
```

### src/utils/memoizedTranslations.ts

```typescript
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
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    preact(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PreactRosetta',
      fileName: (format) => `preact-rosetta.${format}.js`,
    },
    rollupOptions: {
      external: ['preact'],
      output: {
        globals: {
          preact: 'Preact',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "ESNext",
    "lib": ["ES2018", "DOM"],
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationDir": "./dist/types",
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### package.json

```json
{
  "name": "preact-rosetta",
  "version": "1.0.0",
  "description": "A powerful i18n library for Preact applications",
  "main": "dist/preact-rosetta.umd.js",
  "module": "dist/preact-rosetta.es.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/preact-rosetta.es.js",
      "require": "./dist/preact-rosetta.umd.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",
    "prepare": "npm run build",
    "prepublishOnly": "npm run lint && npm run test"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourusername/preact-rosetta.git"
  },
  "keywords": [
    "preact",
    "i18n",
    "internationalization",
    "localization",
    "translation"
  ],
  "author": "Your Name",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/yourusername/preact-rosetta/issues"
  },
  "homepage": "https://github.com/yourusername/preact-rosetta#readme",
  "peerDependencies": {
    "preact": "^10.0.0"
  },
  "devDependencies": {
    "@preact/preset-vite": "^2.5.0",
    "@types/jest": "^27.0.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^8.0.0",
    "eslint-plugin-preact": "^0.1.0",
    "jest": "^27.0.0",
    "prettier": "^2.0.0",
    "ts-jest": "^27.0.0",
    "typescript": "^4.5.0",
    "vite": "^4.3.9",


```

Hello
