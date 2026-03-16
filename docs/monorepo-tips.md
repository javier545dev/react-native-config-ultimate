# Monorepo Tips

This guide covers using `react-native-config-ultimate` in monorepo setups with pnpm, yarn workspaces, Lerna, Nx, Turborepo, and similar tools.

![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=apple&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white)
![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=google-chrome&logoColor=white)

> **Compatibility:** Works with both Old and New Architecture (TurboModules). Tested with React Native 0.73+ and React 18/19.

---

## Quick Reference

| Package Manager | Key Setting | Notes |
|-----------------|-------------|-------|
| **pnpm** | `node-linker=hoisted` in `.npmrc` | Required for RN compatibility |
| **Yarn Classic** | `nohoist` may be needed | Check workspace config |
| **Yarn Berry** | `nodeLinker: node-modules` | PnP not supported |
| **npm workspaces** | Works out of the box | |

---

## Common Monorepo Structures

### Standard Structure

```
monorepo/
├── package.json              # Root package.json
├── pnpm-workspace.yaml       # or yarn workspaces in package.json
├── node_modules/             # Hoisted dependencies
│   ├── react-native
│   └── react-native-config-ultimate
└── packages/
    ├── mobile-app/           # React Native app
    │   ├── package.json
    │   ├── ios/
    │   └── android/
    ├── shared/               # Shared code
    └── web-app/              # Web app
```

### Nested Structure (App inside packages)

```
monorepo/
├── package.json
├── node_modules/
└── apps/
    └── mobile/
        ├── package.json
        ├── node_modules/     # May have local copies
        ├── ios/
        └── android/
```

---

## CLI Options for Monorepos

The `rncu` CLI has two flags for monorepo support:

```bash
npx rncu --project-root . --lib-root ../../node_modules/react-native-config-ultimate .env
```

| Flag | Description |
|------|-------------|
| `--project-root` | Path to the React Native app root (where `ios/` and `android/` are) |
| `--lib-root` | Path to where `react-native-config-ultimate` is installed |

### Example: Running from monorepo root

```bash
# From monorepo root, targeting packages/mobile-app
npx rncu \
  --project-root ./packages/mobile-app \
  --lib-root ./node_modules/react-native-config-ultimate \
  ./packages/mobile-app/.env
```

### Example: Running from app directory

```bash
# From packages/mobile-app
npx rncu \
  --project-root . \
  --lib-root ../../node_modules/react-native-config-ultimate \
  .env
```

---

## Android: Gradle Configuration

### The Problem

Hardcoded paths like `../../node_modules/...` break in monorepos where dependencies are hoisted.

### The Solution: Use Gradle Project Reference

In `android/app/build.gradle`:

```gradle
// ✅ Works in all monorepo setups
apply from: project(':react-native-config-ultimate').projectDir.getPath() + "/rncu.gradle"
```

This uses Gradle's dependency resolution, which works regardless of where `node_modules` lives.

### Fallback: Relative Path

If the project reference doesn't work (rare), use a relative path adjusted for your structure:

```gradle
// For packages/mobile-app/android/app/build.gradle
// when node_modules is at monorepo root
apply from: "../../../../node_modules/react-native-config-ultimate/android/rncu.gradle"
```

### Specifying React Native Path

If Gradle can't find React Native, add to your root `android/build.gradle`:

```groovy
buildscript {
    ext {
        // Adjust path based on your monorepo structure
        REACT_NATIVE_NODE_MODULES_DIR = "../../node_modules/react-native"
    }
}
```

---

## iOS: CocoaPods Configuration

### Standard Setup

CocoaPods usually works out of the box if you're using autolinking. Just ensure:

```bash
cd packages/mobile-app/ios
pod install
```

### If Pods Can't Find the Package

Add to your `Podfile`:

```ruby
# Podfile
require_relative '../../../node_modules/react-native/scripts/react_native_pods'
require_relative '../../../node_modules/@react-native-community/cli-platform-ios/native_modules'
```

Adjust the `../../../` based on your structure.

---

## pnpm Workspaces

### Required: Use `node-linker=hoisted`

pnpm's default isolated mode is **not compatible** with React Native. Add to `.npmrc`:

```ini
# .npmrc at monorepo root
node-linker=hoisted
```

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - '!packages/mobile-app'  # Exclude RN app if it installs its own deps
```

> **Why exclude?** Some teams prefer the mobile app to install dependencies separately to simulate real npm installs. This is optional.

---

## Yarn Workspaces

### package.json Configuration

```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

### nohoist (if needed)

If you encounter issues, try nohoisting React Native:

```json
{
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": [
      "**/react-native",
      "**/react-native/**"
    ]
  }
}
```

---

## Nx Monorepo

### Project Configuration

```json
// project.json or workspace.json
{
  "targets": {
    "generate-env": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx rncu .env",
        "cwd": "apps/mobile"
      }
    }
  }
}
```

### Running

```bash
nx run mobile:generate-env
```

---

## Lerna

### lerna.json

```json
{
  "packages": ["packages/*"],
  "npmClient": "yarn",
  "useWorkspaces": true
}
```

### Package Scripts

Add to your mobile app's `package.json`:

```json
{
  "scripts": {
    "env:dev": "rncu --lib-root ../../node_modules/react-native-config-ultimate .env.dev",
    "env:prod": "rncu --lib-root ../../node_modules/react-native-config-ultimate .env.prod"
  }
}
```

---

## Turborepo

> **Note:** This library's own repository uses Turborepo + pnpm workspaces.

### turbo.json

```json
{
  "tasks": {
    "generate-env": {
      "cache": false,
      "dependsOn": []
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["lib/**"]
    },
    "build:ios": {
      "dependsOn": ["generate-env"]
    },
    "build:android": {
      "dependsOn": ["generate-env"]
    }
  }
}
```

### Package Scripts

```json
{
  "scripts": {
    "generate-env": "rncu .env.yaml",
    "ios": "react-native run-ios",
    "android": "react-native run-android"
  }
}
```

### Running

```bash
# Generate env for specific app
turbo run generate-env --filter=mobile-app

# Build with env generation
turbo run build:ios --filter=mobile-app
```

---

## Troubleshooting

### "yaml file at path ... does not exist"

The CLI wrote config to the wrong location. Use `--lib-root`:

```bash
npx rncu --lib-root ../../node_modules/react-native-config-ultimate .env
```

### "Included build '.../@react-native/gradle-plugin' does not exist"

Create symlinks for React Native packages:

```bash
cd packages/mobile-app/node_modules
ln -sf ../../../node_modules/react-native react-native
ln -sf ../../../node_modules/@react-native @react-native
```

Or add to `postinstall`:

```json
{
  "scripts": {
    "postinstall": "cd packages/mobile-app && ln -sf ../../node_modules/react-native node_modules/react-native"
  }
}
```

### Pod install fails

Ensure CocoaPods can find the packages:

```bash
# From ios directory
pod install --repo-update
```

If it still fails, check your `Podfile` paths are correct for your monorepo structure.

---

## Related

- [CLI Reference](./api.md#advanced-options-for-monorepo) — Full CLI options
- [Cookbook](./cookbook.md#apply-rncugradle-in-monorepos-and-pnpm-projects) — Gradle patterns
- [Troubleshooting](./troubleshooting.md) — Common issues