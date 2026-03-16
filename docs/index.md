# react-native-config-ultimate

**Environment variables for React Native that just work.**

iOS | Android | Web | New Architecture

---

## Quick Links

- [**Quick Start**](./quickstart.md) — Get up and running in 5 minutes
- [**API Reference**](./api.md) — Full API documentation
- [**Cookbook**](./cookbook.md) — Common patterns and recipes
- [**Migration Guide**](./migration.md) — Coming from react-native-config?

---

## Why This Library?

| Feature | react-native-config-ultimate | react-native-config | react-native-dotenv |
|---------|:----------------------------:|:-------------------:|:-------------------:|
| **New Architecture** | ✅ | ❌ | ❌ |
| **React Native 0.79+** | ✅ | ⚠️ | ⚠️ |
| **Web support** | ✅ | ❌ | ✅ |
| **YAML config** | ✅ | ❌ | ❌ |
| **Per-platform values** | ✅ | ❌ | ❌ |
| **Type-safe** | ✅ | ⚠️ | ⚠️ |
| **Active maintenance** | ✅ | ⚠️ | ⚠️ |

---

## Installation

```bash
npm install react-native-config-ultimate
# or
yarn add react-native-config-ultimate
# or
pnpm add react-native-config-ultimate
```

## Basic Usage

```bash
# Create config
echo "API_URL=https://api.myapp.com" > .env

# Generate for all platforms
npx rncu .env
```

```tsx
import Config from 'react-native-config-ultimate';

console.log(Config.API_URL); // https://api.myapp.com
```

---

## Documentation

| Guide | Description |
|:------|:------------|
| [Quick Start](./quickstart.md) | Installation and setup |
| [API Reference](./api.md) | JavaScript, native code, build tools |
| [Cookbook](./cookbook.md) | Common patterns and recipes |
| [Migration](./migration.md) | From react-native-config |
| [Testing](./testing.md) | Mocking Config in tests |
| [Monorepo Tips](./monorepo-tips.md) | pnpm, yarn workspaces, Lerna |
| [Troubleshooting](./troubleshooting.md) | Common issues and solutions |

---

## Links

- [GitHub Repository](https://github.com/javier545dev/react-native-config-ultimate)
- [npm Package](https://www.npmjs.com/package/react-native-config-ultimate)
- [Report an Issue](https://github.com/javier545dev/react-native-config-ultimate/issues)

---

MIT License © 2024-present javier545dev
