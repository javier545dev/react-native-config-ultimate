# Troubleshooting

Common errors and solutions when using `react-native-config-ultimate`.

![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=apple&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white)
![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=google-chrome&logoColor=white)

> **Note:** This guide applies to v0.2.0+. Versions `<0.2.0` are deprecated.

---

## Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Config files not generated | Run `npx rncu .env` |
| Values undefined at runtime | Regenerate + **full rebuild** (hot reload won't work) |
| Android empty config `{}` | Add `setBuildConfig()` in MainApplication (Old Arch only) |
| iOS xcconfig not found | Drag `rncu.xcconfig` into Xcode project |
| TypeScript errors | Regenerate with `npx rncu .env` |

---

## Table of Contents

- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [CLI Issues](#cli-issues)
- [Monorepo Issues](#monorepo-issues)
- [Platform-Specific Issues](#platform-specific-issues)

---

## Build Issues

### Missing config files error

**Error:**
```
yaml file at path /X/Y/node_modules/react-native-config-ultimate/android/rncu.yaml does not exist
```

Or:
```
#error "invoke bin.js with env file before compiling native project"
```

**Cause**: The `rncu` CLI hasn't been run to generate config files.

**Solution**: Run the CLI before building:

```bash
npx rncu .env
```

**Prevention**: Add to your build scripts:

```json
{
  "scripts": {
    "prebuild": "rncu .env",
    "preios": "rncu .env",
    "preandroid": "rncu .env"
  }
}
```

### CI/CD builds failing

**Solution**: Run `rncu` in your CI pipeline before the build step.

**GitHub Actions:**
```yaml
- name: Generate env config
  run: npx rncu .env

- name: Build iOS
  run: npx react-native run-ios
```

**AppCenter:**
```sh
# appcenter-post-clone.sh
yarn install
yarn rncu .env
```

**Bitrise / CircleCI / etc.**: Same pattern — run `rncu` before native builds.

---

## Runtime Issues

### Android: Empty config object `{}`

**Cause 1**: Missing `setBuildConfig` call (Old Architecture only).

**Solution**: Add to `MainApplication.kt`:

```kotlin
import com.reactnativeultimateconfig.UltimateConfigModule

override fun onCreate() {
  super.onCreate()
  UltimateConfigModule.setBuildConfig(BuildConfig::class.java)
  // ...
}
```

> **New Architecture**: If you're using TurboModules (RN 0.73+ with New Arch enabled), `setBuildConfig` is NOT required.

**Cause 2**: Missing `rncu.gradle` in `build.gradle`.

**Solution**: Add at the top of `android/app/build.gradle`:

```gradle
apply from: project(':react-native-config-ultimate').projectDir.getPath() + "/rncu.gradle"
```

**Cause 3**: Config wasn't regenerated after `.env` changes.

**Solution**: Run `npx rncu .env` and **rebuild** (hot reload doesn't work for native changes).

### Values are undefined at runtime

**Cause**: Config files are out of sync with your `.env`.

**Solution**:
1. Regenerate: `npx rncu .env`
2. For native values (Info.plist, AndroidManifest): **full rebuild required**
3. For JS-only values with `js_override: true`: Metro reload is enough

### TypeScript: Property does not exist on type

**Cause**: Auto-generated types are out of date.

**Solution**: Regenerate config (types are created alongside config):

```bash
npx rncu .env
# Types are written to node_modules/react-native-config-ultimate/lib/typescript/...
```

---

## CLI Issues

### "command not found" or "use strict: command not found"

**Error:**
```
/path/to/node_modules/.bin/rncu: line 1: use strict: command not found
```

**Cause**: The CLI binary is missing its shebang (`#!/usr/bin/env node`).

**Solution**:

```bash
# Reinstall the package
rm -rf node_modules
npm install

# Or if developing locally, rebuild
cd packages/react-native-config-ultimate
npm run build
```

### CLI writes to wrong location in monorepo

**Cause**: `rncu` can't find the correct library path.

**Solution**: Use `--lib-root`:

```bash
npx rncu --lib-root ../../node_modules/react-native-config-ultimate .env
```

---

## Monorepo Issues

### Android: Can't find gradle-plugin or react-native

**Error:**
```
Included build '.../node_modules/@react-native/gradle-plugin' does not exist
```

**Cause**: Dependencies are hoisted to monorepo root, but Android expects them locally.

**Solution**: Create symlinks:

```bash
cd packages/your-app/node_modules
ln -sf ../../../node_modules/react-native react-native
ln -sf ../../../node_modules/@react-native @react-native
```

Or add to `postinstall` in your app's `package.json`.

### pnpm: Various resolution errors

**Cause**: pnpm's default isolated mode is incompatible with React Native.

**Solution**: Add to `.npmrc`:

```ini
node-linker=hoisted
```

See [Monorepo Tips](./monorepo-tips.md) for detailed pnpm setup.

### rncu.yaml not found during build

**Cause**: The CLI wrote to the wrong `node_modules` location.

**Solution**: Specify both paths:

```bash
npx rncu \
  --project-root ./packages/my-app \
  --lib-root ./node_modules/react-native-config-ultimate \
  .env
```

---

## Platform-Specific Issues

### Android: "DEBUG" variable causes build error

**Error:**
```
error: incompatible types: boolean cannot be converted to String
  public static final String DEBUG = false;
```

**Cause**: `DEBUG` is a reserved name in Android's `BuildConfig`.

**Solution**: Rename your variable:

```diff
- DEBUG=true
+ DEBUG_MODE=true
```

### iOS: rncu.xcconfig not found

**Error:**
```
error: unable to open file 'ios/rncu.xcconfig'
```

**Solution**:

1. Generate the file:
   ```bash
   npx rncu .env
   ```

2. Verify it exists:
   ```bash
   ls ios/rncu.xcconfig
   ```

3. If it's in `node_modules/`, you need to set up xcconfig correctly:
   - Drag `ios/rncu.xcconfig` (from the library) into Xcode
   - Set it as base configuration in Project Settings

### iOS: ConfigValues.h not generated

**Error:**
```
#error "react-native-config-ultimate: ConfigValues.h not generated..."
```

**Solution**:

```bash
# Generate config
npx rncu .env

# Verify
cat node_modules/react-native-config-ultimate/ios/ConfigValues.h
# Should show your env vars, not the error message

# Rebuild
cd ios && pod install && cd ..
npx react-native run-ios
```

### Web: Module not found

**Error:**
```
Module not found: Can't resolve 'react-native-config-ultimate'
```

**Cause**: Web bundler can't resolve the package.

**Solution**: Ensure your bundler respects the `browser` field in `package.json`.

**Vite**: Works out of the box.

**Webpack**: Set `resolve.mainFields`:
```js
// webpack.config.js
resolve: {
  mainFields: ['browser', 'module', 'main']
}
```

---

### Metro: "Unable to resolve module"

**Error:**
```
Unable to resolve module react-native-config-ultimate
```

**Solution**: Clear Metro cache and restart:

```bash
# Clear cache and restart Metro
npx react-native start --reset-cache

# If still failing, clear node_modules
rm -rf node_modules
npm install
npx rncu .env
```

---

## Architecture-Specific Issues

### New Architecture: TurboModule not found

**Error:**
```
TurboModuleRegistry.getEnforcing(...): 'UltimateConfig' could not be found
```

**Solution**: Ensure pods are installed with New Arch enabled:

```bash
cd ios
RCT_NEW_ARCH_ENABLED=1 pod install
cd ..
```

### Old Architecture: setBuildConfig not called

**Error:**
```
UltimateConfigModule.setBuildConfig() must be called in MainApplication.onCreate()
```

**Solution**: Add to `MainApplication.kt`:

```kotlin
import com.reactnativeultimateconfig.UltimateConfigModule

override fun onCreate() {
    super.onCreate()
    UltimateConfigModule.setBuildConfig(BuildConfig::class.java)
}
```

> **Note:** New Architecture (TurboModules) does NOT require `setBuildConfig()`.

---

## Still Stuck?

1. Check the [API Reference](./api.md) for correct usage
2. See [Monorepo Tips](./monorepo-tips.md) for workspace setups
3. [Open an issue](https://github.com/AuxStudio/react-native-config-ultimate/issues) with:
   - React Native version (`npx react-native --version`)
   - Library version (`npm list react-native-config-ultimate`)
   - Architecture (Old or New)
   - Full error message
   - Your monorepo setup (if applicable)
