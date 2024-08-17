# Preact Rosetta

Preact Rosetta is a powerful and flexible internationalization (i18n) library for Preact applications. It provides a simple yet comprehensive solution for managing translations, formatting dates, numbers, and currencies, and handling pluralization.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [API Reference](#api-reference)
5. [Usage Examples](#usage-examples)
6. [Advanced Usage](#advanced-usage)
7. [Contributing](#contributing)
8. [License](#license)

## Installation

You can install Preact Rosetta using npm:

```bash
npm install preact-rosetta
```

## Quick Start

1. Wrap your app with `RosettaProvider`:

```jsx
import { RosettaProvider } from 'preact-rosetta';

const App = () => (
  <RosettaProvider
    initialLocale="en"
    initialTranslations={{
      en: { greeting: 'Hello, {{name}}!' },
      es: { greeting: '¡Hola, {{name}}!' }
    }}
  >
    <YourApp />
  </RosettaProvider>
);
```

2. Use translations in your components:

```jsx
import { useTranslate } from 'preact-rosetta';

const Greeting = ({ name }) => {
  const translate = useTranslate();
  return <h1>{translate('greeting', { name })}</h1>;
};
```

## Features

- Easy-to-use Provider component for wrapping your app
- Hooks for translations, locale management, and formatting
- Support for nested translations and namespaces
- Pluralization support
- Memoization for performance optimization
- Async translation loading
- Date, number, and currency formatting

## API Reference

### RosettaProvider

The main component that provides the i18n context to your app.

Props:
- `initialLocale` (string): The initial locale to use.
- `initialTranslations` (object): An object containing all translations.
- `fallbackLocale` (string, optional): Locale to use if a translation is missing. Defaults to 'en'.
- `loadTranslation` (function, optional): Async function to load translations for a given locale.

### Hooks

- `useRosetta()`: Returns the entire Rosetta context.
- `useTranslate()`: Returns the translate function.
- `useLocale()`: Returns the current locale, setLocale function, and loading state.
- `useDateTimeFormatter(options)`: Returns a date formatting function.
- `useNumberFormatter(options)`: Returns a number formatting function.
- `useCurrencyFormatter(currency, options)`: Returns a currency formatting function.
- `usePluralize()`: Returns a function for handling pluralization.

### Utility Functions

- `memoizedTranslations(translations)`: Creates a memoized version of the translations object for better performance.

## Usage Examples

### Basic Translation

```jsx
import { useTranslate } from 'preact-rosetta';

const MyComponent = () => {
  const translate = useTranslate();
  return <p>{translate('key.to.translate')}</p>;
};
```

### Translation with Placeholders

```jsx
const MyComponent = ({ name }) => {
  const translate = useTranslate();
  return <p>{translate('greeting', { name })}</p>;
};
```

### Changing Locale

```jsx
import { useLocale } from 'preact-rosetta';

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLocale();
  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};
```

### Pluralization

```jsx
import { usePluralize } from 'preact-rosetta';

const ItemCount = ({ count }) => {
  const pluralize = usePluralize();
  return <p>{pluralize('item', count, { count })}</p>;
};
```

## Advanced Usage

### Async Translation Loading

```jsx
const loadTranslation = async (locale) => {
  const response = await fetch(`/api/translations/${locale}`);
  return response.json();
};

const App = () => (
  <RosettaProvider
    initialLocale="en"
    initialTranslations={{ en: { /* ... */ } }}
    loadTranslation={loadTranslation}
  >
    <YourApp />
  </RosettaProvider>
);
```

### Using Namespaces

```jsx
const translate = useTranslate();
const headerText = translate('header.title', {}, { namespace: 'common' });
```

### Memoized Translations

```jsx
import { memoizedTranslations } from 'preact-rosetta';

const memoizedTranslations = memoizedTranslations(largeTranslationsObject);
```

## Contributing

We welcome contributions to Preact Rosetta! If you have suggestions for improvements or find any issues, please feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the existing coding style.

## License

Distributed under the MIT License. See `LICENSE` file for more information.
