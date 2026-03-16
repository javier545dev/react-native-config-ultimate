# Contributor Notes

Guide for contributing to `react-native-config-ultimate`.

![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=apple&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white)
![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=google-chrome&logoColor=white)

> **About:** This is a community-maintained fork of [`react-native-ultimate-config`](https://github.com/maxkomarychev/react-native-ultimate-config). We welcome contributions!

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 8+ (`npm install -g pnpm`)
- **Xcode** 15+ (for iOS development)
- **Android Studio** (for Android development)
- **CocoaPods** (`gem install cocoapods`)

---

## Directory Structure

Repository uses **pnpm workspaces + Turborepo** for efficient builds and caching.

```
react-native-config-ultimate/
├── packages/
│   ├── react-native-config-ultimate/  # 📦 Main library (THIS IS THE CODE)
│   │   ├── src/                       # TypeScript source
│   │   ├── lib/                       # Compiled output (DO NOT EDIT)
│   │   ├── ios/                       # iOS native module
│   │   ├── android/                   # Android native module
│   │   └── templates/                 # Handlebars templates for codegen
│   ├── example/                       # Example app (RN 0.83+)
│   ├── Example079/                    # Example app (RN 0.79.5)
│   └── example-web/                   # Standalone Vite + RN Web
├── docs/                              # Documentation
├── turbo.json                         # Turborepo config
└── pnpm-workspace.yaml                # pnpm workspace config
```

> **Note:** Example apps are **excluded** from the pnpm workspace to simulate real npm installs. They install `react-native-config-ultimate` from npm, not via workspace links.

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/javier545dev/react-native-config-ultimate.git
cd react-native-config-ultimate

# Install dependencies
pnpm install

# Build library
pnpm build

# Run tests
pnpm test
```

---

## Development Commands

### Library Development

```bash
pnpm build        # Build library (uses turbo, cached)
pnpm test         # Run tests (130+ tests)
pnpm lint         # Lint source code
pnpm typecheck    # Type check
```

### Example Apps (from monorepo root)

#### Example (RN 0.83+ with YAML config)

```bash
pnpm example:setup      # Build + generate env + pod install
pnpm example:ios        # Run on iOS simulator
pnpm example:android    # Run on Android emulator
pnpm example:env        # Regenerate config from .env.yaml
```

#### Example079 (RN 0.79.5 with .env config)

```bash
pnpm example079:setup   # Build + generate env + pod install
pnpm example079:ios     # Run on iOS simulator
pnpm example079:android # Run on Android emulator
pnpm example079:web     # Start Vite dev server
pnpm example079:env     # Regenerate config from .env
```

#### Example Web (Standalone Vite + RN Web)

```bash
pnpm example:web:setup  # Build library + generate env
pnpm example:web:dev    # Start Vite dev server
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/cli.ts` | CLI entry point (`rncu` command) |
| `src/main.ts` | Core logic - generates config files |
| `src/load-env.ts` | Parses .env and .env.yaml files |
| `src/render-env.ts` | Renders templates with Handlebars |
| `templates/` | Handlebars templates for iOS/Android/JS |
| `jest.config.js` | Jest configuration |

---

## Development Workflow

### Making Changes

1. Make changes in `packages/react-native-config-ultimate/src/`
2. Run `pnpm test` to verify tests pass
3. Run `pnpm build` if changing CLI or exports
4. Test in an example app:
   ```bash
   pnpm example:env
   pnpm example:ios
   ```
5. Commit with conventional commit message

### Adding a New Feature

1. Write tests first in `src/*.spec.ts`
2. Implement the feature
3. Update documentation in `docs/`
4. Update TypeScript types if needed
5. Test in both example apps (RN 0.83 and 0.79)

### Testing Native Changes

After changing native code (ios/ or android/):

```bash
# iOS
pnpm example:pods
pnpm example:ios

# Android
pnpm example:android
```

---

## Code Style

- **TypeScript strict mode** — no `any`, use `unknown` and narrow
- **Conventional Commits** — `feat:`, `fix:`, `docs:`, etc.
- **Tests** — all changes should have test coverage
- **No AI attribution** — NEVER add "Co-Authored-By" in commits

---

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- load-env.spec.ts

# Run with coverage
pnpm test -- --coverage

# Watch mode
pnpm test -- --watch
```

Test structure:
- All tests in `src/*.spec.ts`
- Use descriptive test names
- Mock file system — never touch real files
- Test edge cases

---

## Publishing

Releases are automated via **release-please**:

1. Merge PRs to `master` with conventional commits
2. release-please creates a Release PR with:
   - Version bump
   - Generated changelog
3. Merge the Release PR
4. GitHub Actions publishes to npm

### Manual Release (not recommended)

```bash
cd packages/react-native-config-ultimate
npm version patch  # or minor/major
npm publish
```

---

## Common Gotchas

### 1. The `lib/` Directory

**DO NOT EDIT** files in `lib/` — they're generated by `pnpm build`.

### 2. Metro Package Exports

The `exports` field in package.json MUST have `"react-native"` condition for Metro to work.

### 3. Android Reserved Names

`DEBUG` is reserved by Android's `BuildConfig.DEBUG`. Document this in error messages.

### 4. CLI Shebang

The build script automatically adds `#!/usr/bin/env node` to `lib/commonjs/cli.js`.

### 5. Test Path Patterns

Use `<rootDir>/lib/` in `testPathIgnorePatterns` (NOT just `/lib/`).

---

---

## Architecture Support

The library supports **both** Old and New Architecture:

| Architecture | How to Test | Notes |
|--------------|-------------|-------|
| **Old (Bridge)** | `example079` app | RN 0.79 with `newArchEnabled=false` |
| **New (TurboModules)** | `example` app | RN 0.83+ with New Arch enabled |

Always test changes on **both** architectures before submitting PRs.

---

## Web Support

The library supports React Native Web via Vite:

```bash
# Test web support
pnpm example079:web
```

Web support relies on the `browser` field in `package.json` pointing to `index.web.js`.

---

## Questions?

- Check existing [issues](https://github.com/AuxStudio/react-native-config-ultimate/issues)
- Open a new issue for bugs or feature requests
- PRs welcome!
