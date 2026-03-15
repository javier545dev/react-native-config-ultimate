# Contributing to react-native-config-ultimate

First off, thanks for taking the time to contribute! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Branch Protection](#branch-protection)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Development Setup](#development-setup)
- [Running Tests](#running-tests)
- [Code Style](#code-style)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

## Branch Protection

The `master` branch is protected. **Direct pushes to master are not allowed.**

All changes must go through a Pull Request with:
- ✅ Passing CI checks (lint, tests)
- ✅ At least 1 approval from a maintainer
- ✅ Up-to-date with master before merging

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/react-native-config-ultimate.git
cd react-native-config-ultimate
```

### 2. Create a Branch

Branch names should be descriptive and follow this convention:

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/description` | `feat/add-yaml-validation` |
| Bug fix | `fix/description` | `fix/ios-crash-on-launch` |
| Docs | `docs/description` | `docs/update-quickstart` |
| Refactor | `refactor/description` | `refactor/simplify-cli` |
| Chore | `chore/description` | `chore/update-dependencies` |

```bash
git checkout -b feat/my-new-feature
```

### 3. Make Your Changes

- Write code
- Add/update tests
- Update documentation if needed

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/). See [Commit Convention](#commit-convention) below.

```bash
git commit -m "feat: add support for .env.local files"
```

### 5. Push and Create PR

```bash
git push origin feat/my-new-feature
```

Then open a Pull Request on GitHub.

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) for automatic changelog generation.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Changelog |
|------|-------------|-----------|
| `feat` | New feature | ✅ Features |
| `fix` | Bug fix | ✅ Bug Fixes |
| `docs` | Documentation only | ✅ Documentation |
| `style` | Code style (formatting, semicolons, etc.) | ❌ Hidden |
| `refactor` | Code change that neither fixes a bug nor adds a feature | ✅ Code Refactoring |
| `perf` | Performance improvement | ✅ Performance |
| `test` | Adding or updating tests | ❌ Hidden |
| `build` | Build system or external dependencies | ✅ Build System |
| `ci` | CI configuration | ❌ Hidden |
| `chore` | Other changes that don't modify src or test files | ❌ Hidden |
| `revert` | Reverts a previous commit | ✅ Reverts |

### Examples

```bash
# Feature
git commit -m "feat: add support for YAML schema validation"

# Bug fix
git commit -m "fix: resolve crash when .env file is empty"

# Bug fix with scope
git commit -m "fix(ios): correct requiresMainQueueSetup value"

# Breaking change (add ! after type)
git commit -m "feat!: change default config file format to YAML"

# With body and footer
git commit -m "fix: handle special characters in env values

Previously, backslashes and quotes would cause parsing errors.
Now they are properly escaped.

Closes #123"
```

### Breaking Changes

For breaking changes, add `!` after the type or include `BREAKING CHANGE:` in the footer:

```bash
git commit -m "feat!: rename Config to EnvConfig"
# or
git commit -m "feat: rename Config to EnvConfig

BREAKING CHANGE: The default export is now named EnvConfig instead of Config"
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest master:
   ```bash
   git fetch origin
   git rebase origin/master
   ```

2. **Run all checks locally**:
   ```bash
   npm run lint
   npm test
   ```

3. **Ensure your commits follow the convention**

### PR Title

PR titles should also follow the commit convention:

```
feat: add YAML schema validation
fix(android): resolve BuildConfig not found error
docs: add migration guide from react-native-config
```

### PR Description

Include:
- **What** does this PR do?
- **Why** is this change needed?
- **How** was it tested?
- **Screenshots** (if UI changes)

### Review Process

1. CI must pass (lint, tests on Node 18/20/22/24)
2. At least 1 maintainer approval required
3. All review comments must be resolved
4. Branch must be up-to-date with master

### After Approval

- Maintainers will merge using **Squash and Merge**
- The PR title becomes the commit message
- release-please will automatically create a release PR

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repo
git clone https://github.com/javier545dev/react-native-config-ultimate.git
cd react-native-config-ultimate

# Install dependencies
npm install

# Build
npm run build
```

### Project Structure

```
├── packages/
│   ├── react-native-config-ultimate/  # Main library
│   │   ├── src/                       # TypeScript source
│   │   ├── lib/                       # Compiled output (generated)
│   │   │   ├── commonjs/              # CommonJS build (Node.js)
│   │   │   ├── module/                # ESM build (bundlers)
│   │   │   └── typescript/            # Type definitions
│   │   ├── ios/                       # iOS native module
│   │   ├── android/                   # Android native module
│   │   └── templates/                 # Handlebars templates
│   └── example/                       # Example React Native app
├── docs/                              # Documentation
└── .github/workflows/                 # CI/CD
```

## Build System

This library uses [react-native-builder-bob](https://github.com/callstack/react-native-builder-bob) 
for building TypeScript to JavaScript. This is the industry standard for React Native libraries.

### Build Output

Running `npm run build` generates three outputs in `lib/`:

| Directory | Format | Purpose |
|-----------|--------|---------|
| `lib/commonjs/` | CommonJS | Node.js (CLI, Jest tests) |
| `lib/module/` | ESM | Bundlers (Metro, Webpack) |
| `lib/typescript/` | `.d.ts` | TypeScript type definitions |

### Entry Points (package.json)

```json
{
  "main": "./lib/commonjs/index.js",     // Node.js/CommonJS
  "module": "./lib/module/index.js",     // ESM bundlers
  "react-native": "./src/index.ts",      // Metro uses source directly
  "types": "./lib/typescript/src/index.d.ts"
}
```

### The Shebang Fix

The CLI (`rncu` command) needs a **shebang** to be executable:

```bash
#!/usr/bin/env node
```

This line tells the OS to use Node.js to run the script. Without it, running `npx rncu .env` 
fails with cryptic errors like:

```
line 1: use strict: command not found
```

**Problem**: `react-native-builder-bob` doesn't add shebangs when compiling TypeScript.

**Solution**: The build script adds the shebang as a post-build step:

```json
{
  "build": "bob build && node -e \"const fs=require('fs');const f='lib/commonjs/cli.js';const c=fs.readFileSync(f,'utf8');if(!c.startsWith('#!')){fs.writeFileSync(f,'#!/usr/bin/env node\\n'+c)}\""
}
```

This one-liner:
1. Runs `bob build` to compile TypeScript
2. Reads `lib/commonjs/cli.js`
3. Prepends `#!/usr/bin/env node\n` if not already present
4. Writes the file back

### Testing the Example App

The example app is a React Native project in `packages/example/`. 

**Important for monorepo development**: The example needs symlinks for Android to work:

```bash
# These are created automatically, but if needed:
cd packages/example/node_modules
ln -sf ../../../node_modules/react-native react-native
ln -sf ../../../node_modules/@react-native @react-native
```

To test changes:

```bash
# 1. Build the library
cd packages/react-native-config-ultimate
npm run build

# 2. Generate config files (from example dir)
cd ../example
node -e "
const main = require('../../packages/react-native-config-ultimate/lib/commonjs/main').default;
const path = require('path');
main(process.cwd(), path.resolve('../react-native-config-ultimate'), ['.env']);
"

# 3. Run on iOS
npm run ios

# 4. Run on Android  
npm run android
```

### Android Reserved Names

**Warning**: Avoid using `DEBUG` as an env variable name. It conflicts with Android's 
built-in `BuildConfig.DEBUG` boolean. Use `DEBUG_MODE` or similar instead.

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/validate-env.spec.ts
```

## Code Style

### ESLint

We use ESLint with TypeScript support:

```bash
npm run lint
```

### Prettier

We use Prettier for formatting:

```bash
# Check formatting
npx prettier --check "packages/react-native-config-ultimate/src/**/*.ts"

# Fix formatting
npx prettier --write "packages/react-native-config-ultimate/src/**/*.ts"
```

### TypeScript

- Strict mode enabled
- No `any` types (use `unknown` and narrow)
- Prefer `const` over `let`
- Use descriptive variable names with snake_case for local variables

## Questions?

Open an issue or start a discussion on GitHub. We're happy to help!
