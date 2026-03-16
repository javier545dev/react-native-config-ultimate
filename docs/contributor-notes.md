# Developing

## Directory structure

Repository is maintained using **pnpm workspaces + Turborepo** for efficient builds and caching.

```
├── packages/
│   ├── react-native-config-ultimate/  # Main library
│   ├── example/                       # Example app (RN 0.83+)
│   ├── Example079/                    # Example app (RN 0.79.5)
│   └── example-web/                   # Standalone Vite + RN Web
├── turbo.json                         # Turborepo config
└── pnpm-workspace.yaml                # pnpm workspace config
```

> **Note:** Example apps are **excluded** from the pnpm workspace to simulate real npm installs. They install `react-native-config-ultimate` from npm, not via workspace links.

## Working with the library

```bash
# Install dependencies
pnpm install

# Build library
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

## Working with example apps

All example commands can be run from the **monorepo root**:

### Example (RN 0.83+ with YAML config)

```bash
pnpm example:setup      # Build + generate env + pod install
pnpm example:ios        # Run on iOS simulator
pnpm example:android    # Run on Android emulator
```

### Example079 (RN 0.79.5 with .env config)

```bash
pnpm example079:setup   # Build + generate env + pod install
pnpm example079:ios     # Run on iOS simulator
pnpm example079:android # Run on Android emulator
pnpm example079:web     # Start Vite dev server
```

### Example Web (Standalone Vite + RN Web)

```bash
pnpm example:web:setup  # Build library + generate env
pnpm example:web:dev    # Start Vite dev server
```

## Updating environment variables

After modifying `.env` or `.env.yaml` files:

```bash
pnpm example:env        # For example (RN 0.83)
pnpm example079:env     # For Example079 (RN 0.79)
```

Then rebuild the native app.

## Publishing new version

Releases are automated via **release-please**:

1. Merge PR to master
2. release-please creates a Release PR with changelog
3. Merge Release PR to publish to npm

For manual version bumps (not recommended):

```bash
pnpm version
```
