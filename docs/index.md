# react-native-config-ultimate

**Environment variables for React Native that just work.**

![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=apple&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white)
![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=google-chrome&logoColor=white)
![New Architecture](https://img.shields.io/badge/New_Arch-TurboModules-61DAFB?style=flat&logo=react&logoColor=black)

> **Note:** v0.2.0 is the first stable release. Versions `<0.2.0` are deprecated and should not be used.

---

## Quick Links

- [**Quick Start**](./quickstart.md) — Get up and running in 5 minutes
- [**API Reference**](./api.md) — Full API documentation
- [**Cookbook**](./cookbook.md) — Common patterns and recipes
- [**Migration Guide**](./migration.md) — Coming from react-native-config?
- [**Alternatives**](./alternatives.md) — Comparison with other libraries

---

## Why This Library?

| Feature | react-native-config-ultimate | react-native-config | react-native-dotenv |
|---------|:----------------------------:|:-------------------:|:-------------------:|
| **New Architecture** | ✅ | ❌ | ❌ |
| **Old Architecture** | ✅ | ✅ | ✅ |
| **React Native 0.73+** | ✅ | ⚠️ | ⚠️ |
| **React 18/19** | ✅ | ⚠️ | ⚠️ |
| **Web support (Vite + RN Web)** | ✅ | ❌ | ✅ |
| **YAML config** | ✅ | ❌ | ❌ |
| **Per-platform values** | ✅ | ❌ | ❌ |
| **Multi-env merging** | ✅ | ❌ | ❌ |
| **Variable expansion** | ✅ | ❌ | ❌ |
| **Schema validation** | ✅ | ❌ | ❌ |
| **Auto-generated TypeScript types** | ✅ | ⚠️ Manual | ⚠️ |
| **Monorepo support** | ✅ | ⚠️ | ⚠️ |
| **Active maintenance (2024+)** | ✅ | ⚠️ | ⚠️ |

---

## Compatibility

| Library Version | React Native | React | Gradle | Architecture |
|:---------------:|:------------:|:-----:|:------:|:------------:|
| **0.2.x** | ≥ 0.73 | 18 / 19 | ≥ 8 | Old & New (TurboModules) |

> This library is a community-maintained fork of [`react-native-ultimate-config`](https://github.com/maxkomarychev/react-native-ultimate-config) with New Architecture support, bug fixes, and active maintenance.

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

## How It Works

```mermaid
flowchart TB
    subgraph Input["📄 Input Files"]
        ENV[".env / .env.yaml"]
        SCHEMA[".rncurc.js (optional)"]
    end

    subgraph CLI["⚙️ rncu CLI"]
        PARSE["Parse & Validate"]
        MERGE["Merge Environments"]
        EXPAND["Expand Variables"]
    end

    subgraph Output["📦 Generated Files"]
        direction TB
        TS["src/env.ts\n(TypeScript types)"]
        IOS["ios/rncu.xcconfig\n(Build Settings)"]
        ANDROID["android/.../RNCUValues.kt\n(BuildConfig)"]
    end

    subgraph Runtime["🚀 Runtime Access"]
        direction TB
        JS["JavaScript/TypeScript\nConfig.API_URL"]
        SWIFT["Swift/Obj-C\nUltimateConfig.API_URL"]
        KOTLIN["Kotlin/Java\nBuildConfig.API_URL"]
        WEB["Web (Vite)\nConfig.API_URL"]
    end

    ENV --> PARSE
    SCHEMA --> PARSE
    PARSE --> MERGE
    MERGE --> EXPAND
    EXPAND --> TS
    EXPAND --> IOS
    EXPAND --> ANDROID

    TS --> JS
    TS --> WEB
    IOS --> SWIFT
    ANDROID --> KOTLIN

    style Input fill:#e1f5fe
    style CLI fill:#fff3e0
    style Output fill:#e8f5e9
    style Runtime fill:#fce4ec
```

**The flow:**
1. **Input** — Your `.env` or `.env.yaml` file (plus optional schema)
2. **CLI** — `npx rncu .env` parses, merges, and validates
3. **Output** — Generates platform-specific files
4. **Runtime** — Access config values anywhere in your app

---

## Key Features

| Feature | Description |
|:--------|:------------|
| **Multi-env merging** | `npx rncu .env.base .env.staging` — merge multiple files |
| **Variable expansion** | `API_URL=$BASE_URL/v1` — reference other variables |
| **Per-platform values** | YAML: `API_KEY: { ios: "abc", android: "xyz", web: "123" }` |
| **Schema validation** | Fail at build time if required vars are missing |
| **Auto TypeScript types** | `index.d.ts` generated automatically |
| **Watch mode** | `npx rncu .env --watch` — auto-regenerate on changes |

### Platforms Supported

| Platform | Native Access | JS Access | Build Integration |
|:---------|:-------------:|:---------:|:-----------------:|
| **iOS** | Objective-C, Swift, Info.plist | ✅ | xcconfig, Build Settings |
| **Android** | Java, Kotlin, BuildConfig | ✅ | Gradle, Manifest placeholders |
| **Web** | N/A | ✅ | Vite, Webpack, Rollup, Parcel |

---

## Documentation

| Guide | Description |
|:------|:------------|
| [Quick Start](./quickstart.md) | Installation and setup |
| [API Reference](./api.md) | JavaScript, native code, build tools |
| [Cookbook](./cookbook.md) | Common patterns and recipes |
| [Migration](./migration.md) | From react-native-config |
| [Testing](./testing.md) | Mocking Config in tests |
| [Monorepo Tips](./monorepo-tips.md) | pnpm, yarn workspaces, Lerna, Nx |
| [Troubleshooting](./troubleshooting.md) | Common issues and solutions |
| [Alternatives](./alternatives.md) | Comparison with other libraries |
| [Contributor Notes](./contributor-notes.md) | For contributors |

---

## Links

- [GitHub Repository](https://github.com/AuxStudio/react-native-config-ultimate)
- [npm Package](https://www.npmjs.com/package/react-native-config-ultimate)
- [Report an Issue](https://github.com/AuxStudio/react-native-config-ultimate/issues)
- [Changelog](https://github.com/AuxStudio/react-native-config-ultimate/blob/master/CHANGELOG.md)

---

## About

This library is a community-maintained fork of [`react-native-ultimate-config`](https://github.com/maxkomarychev/react-native-ultimate-config) by Max Komarychev. We've added New Architecture support, React 18/19 compatibility, Web support (Vite + React Native Web), and continue active maintenance.

MIT License
