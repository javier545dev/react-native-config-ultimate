# Contributing to react-native-config-ultimate

Thanks for your interest in contributing! This guide will help you set up a local development environment.

## Prerequisites

- Node.js 18+
- npm or yarn
- Xcode (for iOS development)
- Android Studio (for Android development)
- A physical device or simulator/emulator

## Repository Structure

```
react-native-config-ultimate/
├── packages/
│   ├── react-native-config-ultimate/   # The library itself
│   ├── example/                        # Example app (older RN version)
│   ├── example083/                     # Example app for RN 0.83+
│   └── example-web/                    # Web example
└── package.json                        # Root workspace config
```

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/javier545dev/react-native-config-ultimate.git
cd react-native-config-ultimate
npm install
```

### 2. Build the Library

The library must be built before it can be used by example apps:

```bash
cd packages/react-native-config-ultimate
npm run build
```

This generates the `lib/` directory with compiled JavaScript and TypeScript declarations.

### 3. Testing with example083 (React Native 0.83+)

The `example083` project is configured as a **standalone project** (not part of the npm workspace) that links to the library via `file:` reference. This simulates how real consumers would use the library from npm.

```bash
cd packages/example083
npm install
```

#### Metro Configuration for Local Development

When using `file:` links, Metro needs to know about the symlinked library folder. The `metro.config.js` in example083 is already configured for this:

```javascript
const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// Path to the linked library
const libraryPath = path.resolve(__dirname, '../react-native-config-ultimate');

const config = {
  // Tell Metro to also watch the library folder
  watchFolders: [libraryPath],
  
  resolver: {
    // Tell Metro to look for node_modules in both places
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(libraryPath, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

**Why is this needed?**

- `watchFolders`: Metro by default only watches files inside the project root. Since the library is symlinked from `../react-native-config-ultimate`, we need to tell Metro to watch that folder too.
- `nodeModulesPaths`: When the library code imports its own dependencies, Metro needs to know where to find them.

> **Note**: This configuration is only needed for local development. When users install the library from npm (`npm install react-native-config-ultimate`), the library lives inside their `node_modules` and no extra Metro config is required.

### 4. Generate Config Files

Before running the app, generate the native config files from your `.env`:

```bash
cd packages/example083
npx rncu .env
```

### 5. Run the Example App

**iOS:**
```bash
cd packages/example083/ios
pod install
cd ..
npm run ios
```

**Android:**
```bash
cd packages/example083
npm run android
```

## Making Changes to the Library

1. Make your changes in `packages/react-native-config-ultimate/src/`
2. Rebuild the library: `npm run build`
3. The example app will pick up changes automatically (Metro watches the built files)

For faster iteration during development, you can run the build in watch mode:

```bash
cd packages/react-native-config-ultimate
npm run build -- --watch
```

## Testing

Run the test suite:

```bash
cd packages/react-native-config-ultimate
npm test
```

## Common Issues

### "Unable to resolve module react-native-config-ultimate"

This usually means Metro can't find the symlinked library. Make sure:

1. The library is built (`npm run build` in the library folder)
2. Your `metro.config.js` includes `watchFolders` pointing to the library
3. You've run `npm install` in the example project

### "@babel/runtime/helpers/interopRequireDefault" error

This error occurs when Metro resolves the compiled JS instead of the source TypeScript. The library's `package.json` has a `"react-native"` condition in the `exports` field to fix this:

```json
"exports": {
  ".": {
    "react-native": "./src/index.ts",
    "source": "./src/index.ts",
    "types": "./lib/typescript/src/index.d.ts",
    "default": "./lib/module/index.js"
  }
}
```

If you're still seeing this error, make sure you're using Metro 0.82+ (React Native 0.79+) which properly supports the `exports` field.

### iOS build fails with "ConfigValues.h not generated"

Run `npx rncu .env` before building iOS. The native header file must be generated from your environment variables.

## Pull Request Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests if applicable
4. Ensure tests pass: `npm test`
5. Commit with a descriptive message
6. Push and open a Pull Request

## Questions?

Open an issue on GitHub if you have questions or run into problems.
