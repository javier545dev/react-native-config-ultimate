# Alternatives

Comparing environment variable solutions for React Native.

![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=apple&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white)
![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=google-chrome&logoColor=white)

---

## Quick Comparison

| Feature | react-native-config-ultimate | react-native-config | react-native-dotenv |
|:--------|:----------------------------:|:-------------------:|:-------------------:|
| **New Architecture (TurboModules)** | ✅ | ❌ | ❌ |
| **Old Architecture (Bridge)** | ✅ | ✅ | ✅ |
| **React Native 0.73+** | ✅ | ⚠️ Partial | ⚠️ Partial |
| **React 18/19** | ✅ | ⚠️ | ⚠️ |
| **Web (Vite + RN Web)** | ✅ | ❌ | ✅ |
| **Active maintenance (2024+)** | ✅ | ⚠️ Slow | ⚠️ Slow |

---

## Detailed Feature Matrix

### JavaScript / TypeScript

| Feature | config-ultimate | config | dotenv |
|:--------|:---------------:|:------:|:------:|
| Access values in JS | ✅ | ✅ | ✅ |
| Auto-generated TypeScript types | ✅ | ❌ Manual | ❌ |
| Schema validation | ✅ | ❌ | ❌ |
| Hot reload (JS only) | ✅ `js_override` | ❌ | ✅ |

### iOS Native

| Feature | config-ultimate | config | dotenv |
|:--------|:---------------:|:------:|:------:|
| Objective-C access | ✅ | ✅ | ❌ |
| Swift access | ✅ | ✅ | ❌ |
| Info.plist variables | ✅ | ✅ | ❌ |
| Build Settings | ✅ | ✅ | ❌ |

### Android Native

| Feature | config-ultimate | config | dotenv |
|:--------|:---------------:|:------:|:------:|
| Java/Kotlin access | ✅ | ✅ | ❌ |
| Gradle access | ✅ | ✅ | ❌ |
| String resources | ✅ | ✅ | ❌ |
| Manifest placeholders | ✅ | ✅ | ❌ |

### Advanced Features

| Feature | config-ultimate | config | dotenv |
|:--------|:---------------:|:------:|:------:|
| YAML config files | ✅ | ❌ | ❌ |
| Per-platform values | ✅ | ❌ | ❌ |
| Multi-env file merging | ✅ | ❌ | ❌ |
| Variable expansion (`$VAR`) | ✅ | ❌ | ❌ |
| Hooks API | ✅ | ❌ | ❌ |
| Watch mode | ✅ | ❌ | ❌ |
| Monorepo support | ✅ | ⚠️ | ⚠️ |
| Web / React Native Web | ✅ | ❌ | ✅ |

---

## When to Use Each

### Use `react-native-config-ultimate` when:

- ✅ You need **New Architecture** (TurboModules) support
- ✅ You want **type-safe** config with auto-generated types
- ✅ You have **different values per platform** (iOS vs Android vs Web)
- ✅ You use **multiple environments** (dev, staging, prod)
- ✅ You're in a **monorepo** (pnpm, yarn workspaces, Nx)
- ✅ You need values in **native code** (Info.plist, AndroidManifest, Swift, Kotlin)

### Use `react-native-config` when:

- You're on an older React Native version (<0.68)
- You're using Old Architecture and don't plan to migrate
- You have a simple setup with no per-platform differences

### Use `react-native-dotenv` when:

- You only need config values in **JavaScript** (not native code)
- You want Babel transform without build-time generation
- You're building a web-only or Expo-only app

---

## Migration

Coming from another library? See the [Migration Guide](./migration.md) for step-by-step instructions.

---

## About This Library

`react-native-config-ultimate` is a community-maintained fork of [`react-native-ultimate-config`](https://github.com/maxkomarychev/react-native-ultimate-config) by Max Komarychev.

### What We Added

| Feature | Description |
|---------|-------------|
| **New Architecture** | Full TurboModules support (RN 0.68+) |
| **Old Architecture** | Continues to work with Bridge/NativeModules |
| **React 18/19** | Compatible with latest React versions |
| **Web Support** | Works with Vite + React Native Web |
| **TypeScript** | Improved types, auto-generated from env files |
| **Security** | CVE patches (SnakeYAML 1.19 → 1.33) |
| **Bug Fixes** | String escaping, validation, reliability |
| **Active Maintenance** | Regular updates, responsive to issues |

The API is 100% compatible with the original library — it's a drop-in replacement.

---

## Decision Guide

```
Do you need native code access (Info.plist, BuildConfig)?
├── Yes → react-native-config-ultimate ✅
└── No
    └── Do you need New Architecture support?
        ├── Yes → react-native-config-ultimate ✅
        └── No
            └── Do you need per-platform values or YAML?
                ├── Yes → react-native-config-ultimate ✅
                └── No → react-native-dotenv (simpler setup)
```
