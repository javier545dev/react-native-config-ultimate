# Agent Instructions for react-native-config-ultimate

> This file contains instructions for AI assistants (Claude, Cursor, Copilot, etc.) working on this codebase.

## Project Overview

**react-native-config-ultimate** is a React Native library for managing environment variables across iOS, Android, and JavaScript. It's a community-maintained fork of `react-native-ultimate-config`.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Language** | TypeScript (strict mode) |
| **Build** | react-native-builder-bob |
| **Monorepo** | pnpm workspaces + Turborepo |
| **Testing** | Jest + ts-jest |
| **Linting** | ESLint |
| **Native** | iOS (Objective-C), Android (Kotlin/Gradle) |
| **Templates** | Handlebars (.hbs) |

## Project Structure

```
├── packages/
│   ├── react-native-config-ultimate/  # Main library (THIS IS THE CODE)
│   │   ├── src/                       # TypeScript source
│   │   ├── lib/                       # Compiled output (generated, DO NOT EDIT)
│   │   ├── ios/                       # iOS native module
│   │   ├── android/                   # Android native module
│   │   └── templates/                 # Handlebars templates for codegen
│   ├── example/                       # Example app (RN 0.83+)
│   └── Example079/                    # Example app (RN 0.79.5)
├── docs/                              # Documentation
├── turbo.json                         # Turborepo config
└── pnpm-workspace.yaml                # pnpm workspace config
```

## Commands

### Library Development (from root)

```bash
pnpm install              # Install all dependencies
pnpm build                # Build library (uses turbo, cached)
pnpm test                 # Run tests (136 tests)
pnpm lint                 # Lint source code
pnpm typecheck            # Type check
```

### Running Example Apps (from root)

All example commands can be run from the monorepo root:

#### Example (RN 0.83+ with YAML config)

```bash
# First time setup (build + generate env + pod install)
pnpm example:setup

# Or run individual steps:
pnpm example:env          # Generate config from .env.yaml
pnpm example:pods         # Install iOS pods

# Run apps
pnpm example:start        # Start Metro bundler
pnpm example:ios          # Run on iOS simulator
pnpm example:android      # Run on Android emulator
```

#### Example079 (RN 0.79.5 with .env config)

```bash
# First time setup
pnpm example079:setup

# Or run individual steps:
pnpm example079:env       # Generate config from .env
pnpm example079:pods      # Install iOS pods

# Run native apps
pnpm example079:start     # Start Metro bundler
pnpm example079:ios       # Run on iOS simulator
pnpm example079:android   # Run on Android emulator

# Run web (Vite + React Native Web)
pnpm example079:web       # Start Vite dev server
pnpm example079:web:build # Build for production
```

#### Example Web (Standalone Vite + React Native Web)

```bash
pnpm example:web:setup    # Build library + generate env
pnpm example:web:dev      # Start Vite dev server
pnpm example:web:build    # Build for production
pnpm example:web:preview  # Preview production build
```

### Updating Environment Variables

After modifying `.env` or `.env.yaml` files, regenerate config from root:

```bash
pnpm example:env          # For example (RN 0.83)
pnpm example079:env       # For Example079 (RN 0.79)
```

This generates:
- `android/app/src/main/java/.../RNCUValues.kt` (Android)
- `ios/rncu.xcconfig` (iOS)
- `src/env.ts` (JavaScript/TypeScript)

**Important**: After regenerating, rebuild the app (`pnpm example:ios` or `pnpm example:android`)

### Library Development Workflow

```bash
# 1. Make changes in library source
#    Edit files in packages/react-native-config-ultimate/src/

# 2. Build library
pnpm build

# 3. Update env and test in example app
pnpm example:env
pnpm example:ios   # or pnpm example:android
```

## Key Conventions

### Code Style
- **TypeScript strict mode** - no `any`, use `unknown` and narrow
- **Conventional Commits** - `feat:`, `fix:`, `docs:`, etc.
- **No AI attribution** - NEVER add "Co-Authored-By" or AI mentions in commits

### Testing
- All tests in `src/*.spec.ts`
- Use `<rootDir>/lib/` in `testPathIgnorePatterns` (NOT `/lib/`)
- Tests must pass before committing

### Building
- builder-bob outputs to `lib/` (commonjs, module, typescript)
- The CLI needs a shebang - build script adds it automatically
- Run `pnpm build` before testing CLI changes

## Important Files

| File | Purpose |
|------|---------|
| `src/cli.ts` | CLI entry point (`rncu` command) |
| `src/main.ts` | Core logic - generates config files |
| `src/load-env.ts` | Parses .env and .env.yaml files |
| `src/render-env.ts` | Renders templates with Handlebars |
| `templates/` | Handlebars templates for iOS/Android/JS |
| `jest.config.js` | Jest configuration |

## Common Gotchas

### 1. Metro Package Exports (RN 0.79+)
The `exports` field in package.json MUST have `"react-native"` condition:
```json
"exports": {
  ".": {
    "react-native": "./src/index.ts",  // REQUIRED for Metro
    "types": "./lib/typescript/src/index.d.ts",
    "default": "./lib/module/index.js"
  }
}
```

### 2. Android Reserved Names
`DEBUG` is reserved by Android's `BuildConfig.DEBUG`. Use `DEBUG_MODE` instead.

### 3. iOS xcconfig
The library generates `rncu.xcconfig`. Users must manually add it to their Xcode project's build settings.

### 4. YAML Per-Platform Values
The library supports per-platform values in YAML:
```yaml
APP_ICON:
  ios: AppIconDev
  android: app_icon_dev  # Android requires lowercase
```

### 5. Monorepo Autolink Behavior
Example apps are excluded from pnpm workspace (`pnpm-workspace.yaml`) and install the library from npm. The `react-native.config.js` must NOT override dependency paths:
```js
// WRONG - forces local package, breaks config file location
dependencies: {
  'react-native-config-ultimate': {
    root: path.join(__dirname, '..', 'react-native-config-ultimate'),
  },
}

// CORRECT - let autolink find the npm package in node_modules
module.exports = {
  project: { ios: { automaticPodsInstallation: true } },
  // No dependencies override
};
```
The CLI writes `rncu.yaml` to `node_modules/.../android/`, and Gradle must read from the same location.

## What NOT to Do

- **DON'T** edit files in `lib/` - they're generated
- **DON'T** use `npm` or `yarn` - this is a pnpm workspace
- **DON'T** add Lerna - we use pnpm + Turborepo
- **DON'T** skip tests before committing
- **DON'T** use `/lib/` in Jest ignore patterns (use `<rootDir>/lib/`)

## Workflow for Changes

1. Make changes in `packages/react-native-config-ultimate/src/`
2. Run `pnpm test` to verify tests pass
3. Run `pnpm build` if changing CLI or exports
4. Commit with conventional commit message
5. Push and create PR (master is protected)

## Release Process

Releases are automated via release-please:
1. Merge PR to master
2. release-please creates a Release PR
3. Merge Release PR to publish to npm

## Skills (Auto-load based on context)

When working on this project, load the appropriate skill BEFORE writing code. These define coding standards and patterns.

### Skill Detection

| Context | Skill to Load |
|---------|---------------|
| React Native components, performance, navigation | `react-native-best-practices` |
| TypeScript types, interfaces, generics | `typescript` |
| Jest tests, mocking, assertions | `pytest` (patterns apply) |
| Upgrading React Native version | `upgrading-react-native` |

### react-native-best-practices

Apply when working on:
- Native module code (iOS/Android)
- Performance optimizations
- Example app components

Key patterns:
- Use `FlashList` over `FlatList` for large lists
- Avoid anonymous functions in render
- Memoize expensive computations
- Handle platform differences with `Platform.select()`

### typescript

Apply when writing ANY TypeScript code in `src/`:
- **Strict mode** - no `any`, use `unknown` and narrow
- **Interfaces over types** for object shapes
- **Explicit return types** on public functions
- **Const assertions** for literal types
- **Discriminated unions** for state machines

```typescript
// GOOD
interface EnvConfig {
  readonly name: string;
  readonly value: string | number | boolean;
}

function parseEnv(input: unknown): EnvConfig {
  if (!isValidEnv(input)) throw new Error('Invalid env');
  return input;
}

// BAD
type EnvConfig = any;
function parseEnv(input) { return input; }
```

### Testing Patterns

Apply when writing tests in `*.spec.ts`:
- **Descriptive test names** - `it('should parse YAML with per-platform values')`
- **Arrange-Act-Assert** structure
- **Mock file system** - never touch real files
- **Test edge cases** - empty files, missing keys, invalid YAML

```typescript
describe('loadEnv', () => {
  it('should parse .env file with KEY=VALUE format', () => {
    // Arrange
    const content = 'API_URL=https://api.example.com';
    
    // Act
    const result = parseEnvContent(content);
    
    // Assert
    expect(result.API_URL).toBe('https://api.example.com');
  });
});
```

## Questions?

Check `docs/` for detailed documentation or open an issue.
