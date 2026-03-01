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
│   │   ├── ios/                       # iOS native module
│   │   ├── android/                   # Android native module
│   │   └── templates/                 # Handlebars templates
│   └── example/                       # Example React Native app
├── docs/                              # Documentation
└── .github/workflows/                 # CI/CD
```

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
