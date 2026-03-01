# Testing Guide

This guide explains how to test React Native apps that use
`react-native-config-ultimate` at every level of the testing pyramid.

```
         ┌─────────────────┐
         │   E2E (Detox /  │  ← Real simulator, real native build
         │    Maestro)     │    Catches native-layer integration issues
         ├─────────────────┤
         │  Integration    │  ← Component tests with react-test-renderer
         │  (Jest + RTL)   │    Catches JS-layer rendering issues
         ├─────────────────┤
         │   Unit (Jest)   │  ← Pure logic, fully mocked
         └─────────────────┘
```

---

## 1. Unit Tests (Jest)

### Run

```bash
# From the library package (98 tests)
cd packages/react-native-ultimate-config
npm test

# From your own app
cd your-app
npx jest
```

### Mocking the config in your tests

`react-native-config-ultimate` reads values that are baked in at native build
time. In Jest, you must mock the module so tests don't depend on generated
files or native code.

**Option A — inline mock per test file:**

```typescript
jest.mock('react-native-config-ultimate', () => ({
  API_URL: 'https://mock-api.test',
  APP_ENV: 'test',
  FEATURE_FLAG: 'true',
}));
```

**Option B — global mock via `moduleNameMapper` in `jest.config.js`:**

```js
// jest.config.js
module.exports = {
  moduleNameMapper: {
    'react-native-config-ultimate': '<rootDir>/__mocks__/config.ts',
  },
};
```

```typescript
// __mocks__/config.ts
export default {
  API_URL: 'https://mock-api.test',
  APP_ENV: 'test',
};
```

**Option C — Jest manual mock in `__mocks__/` folder:**

```
your-app/
└── __mocks__/
    └── react-native-config-ultimate.ts   ← auto-discovered by Jest
```

```typescript
// __mocks__/react-native-config-ultimate.ts
const config = {
  API_URL: 'https://mock-api.test',
  APP_ENV: 'test',
};
export default config;
```

### Example test

```typescript
// src/components/ApiLabel.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ApiLabel from './ApiLabel';

jest.mock('react-native-config-ultimate', () => ({
  API_URL: 'https://mock-api.test',
}));

it('renders the API URL from config', () => {
  render(<ApiLabel />);
  expect(screen.getByText('https://mock-api.test')).toBeTruthy();
});
```

---

## 2. E2E with Maestro (recommended for beginners)

Maestro is the simplest e2e framework for React Native — no native build
configuration needed beyond a running app in a simulator.

### Install Maestro

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Prepare the app

```bash
cd packages/example

# Generate native config files
npx rnuc .env

# Launch the app in a simulator
npx react-native run-ios     # iOS
npx react-native run-android # Android
```

### Run Maestro flows

```bash
# Single flow
maestro test .maestro/01_config_display.yaml

# All flows
maestro test .maestro/

# With env parameter (for 02_env_switching.yaml)
maestro test .maestro/02_env_switching.yaml --env ENV=staging
```

### Flow anatomy

```yaml
# .maestro/01_config_display.yaml
appId: com.example     # your bundle ID

---

- launchApp:
    clearState: true

- assertVisible:
    id: "section-title-config"   # matches testID="section-title-config" in App.tsx

- assertVisible:
    text: "HELLO"                # from .env: HELLO=world
```

### Available testIDs in the example app

| `testID` | What it is |
|---|---|
| `section-config` | Config section container |
| `section-title-config` | "Config" title text |
| `section-body-config` | Config section body |
| `config-values` | The raw JSON.stringify(config) text |

---

## 3. E2E with Detox (full native integration)

Detox runs against a real native build. It catches issues that Maestro can't:
native module loading failures, TurboModule initialization errors, etc.

### Install Detox

```bash
cd packages/example
npm install --save-dev detox @types/detox

# iOS only — install xcpretty
gem install xcpretty
```

### Prepare the app

```bash
cd packages/example

# 1. Generate native config
npx rnuc .env

# 2. Install iOS pods
cd ios && pod install && cd ..

# 3. Build for Detox
npm run test:e2e:build:ios      # iOS simulator
npm run test:e2e:build:android  # Android emulator
```

### Run Detox tests

```bash
# iOS
npm run test:e2e:ios

# Android
npm run test:e2e:android

# With options
npx detox test --configuration ios.sim.debug --reuse        # reuse running sim
npx detox test --configuration ios.sim.debug --take-screenshots all
npx detox test --configuration ios.sim.debug --record-videos all
```

### Test anatomy

```typescript
// e2e/config.test.ts
describe('Config Display', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should render config values from .env', async () => {
    // Uses testID set in App.tsx
    await expect(element(by.id('config-values'))).toBeVisible();

    // Assert a specific key is shown (HELLO=world from .env)
    await expect(
      element(by.id('config-values').and(by.text(/HELLO/))),
    ).toExist();
  });
});
```

### Testing environment switching with Detox

Since env values are baked in at build time, test different envs by building
separately:

```bash
# Build + test with staging env
npx rnuc .env.staging
npm run test:e2e:build:ios
npx detox test --configuration ios.sim.debug

# Build + test with production env
npx rnuc .env.production
npm run test:e2e:build:ios
npx detox test --configuration ios.sim.debug
```

### Configurations in `.detoxrc.js`

| Configuration | Platform | Mode |
|---|---|---|
| `ios.sim.debug` | iOS Simulator | Debug |
| `ios.sim.release` | iOS Simulator | Release |
| `android.emu.debug` | Android Emulator | Debug |
| `android.emu.release` | Android Emulator | Release |

---

## 4. CI/CD

### GitHub Actions — Unit tests (already configured)

```yaml
# .github/workflows/test.yml (already in repo)
- run: npm test
```

### GitHub Actions — Maestro (add to workflow)

```yaml
- name: Install Maestro
  run: curl -Ls "https://get.maestro.mobile.dev" | bash

- name: Run Maestro flows
  run: |
    npx rnuc .env
    npx react-native run-ios --simulator "iPhone 15"
    maestro test .maestro/
```

### GitHub Actions — Detox iOS (macOS runner required)

```yaml
jobs:
  e2e-ios:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: gem install xcpretty
      - run: npm install
      - run: cd packages/example && npx rnuc .env
      - run: cd packages/example/ios && pod install
      - run: cd packages/example && npm run test:e2e:build:ios
      - run: cd packages/example && npm run test:e2e:ios
```

---

## Quick reference

| What | Command | Where |
|---|---|---|
| Unit tests (library) | `npm test` | `packages/react-native-ultimate-config/` |
| Unit tests (example app) | `npm test` | `packages/example/` |
| Maestro e2e | `maestro test .maestro/` | `packages/example/` |
| Detox build iOS | `npm run test:e2e:build:ios` | `packages/example/` |
| Detox run iOS | `npm run test:e2e:ios` | `packages/example/` |
| Detox build Android | `npm run test:e2e:build:android` | `packages/example/` |
| Detox run Android | `npm run test:e2e:android` | `packages/example/` |
