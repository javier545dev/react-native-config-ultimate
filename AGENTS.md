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

```bash
# From root
pnpm install              # Install all dependencies
pnpm build                # Build library (uses turbo, cached)
pnpm test                 # Run tests (136 tests)
pnpm lint                 # Lint source code
pnpm typecheck            # Type check

# From packages/react-native-config-ultimate
pnpm test                 # Run tests directly
pnpm build                # Build with builder-bob
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

### 5. Monorepo Testing
When running the CLI from a different package in the monorepo, use `--libRoot`:
```bash
npx rncu .env --libRoot ../react-native-config-ultimate
```

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

## Questions?

Check `docs/` for detailed documentation or open an issue.
