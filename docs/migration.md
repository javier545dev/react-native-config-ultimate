# Migration Guide

![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=apple&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white)
![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=google-chrome&logoColor=white)

> **Note:** v0.2.0 is the first stable release of `react-native-config-ultimate`. Versions `<0.2.0` are deprecated and should not be used.

This guide covers migrating from other environment variable libraries to `react-native-config-ultimate`.

---

## Migrating to 0.3.0

This release ships two important Android changes. Read all five sections before upgrading.

### 1. Gradle 7.4+ required

**Check your version:**

```bash
cat android/gradle/wrapper/gradle-wrapper.properties | grep distributionUrl
```

The URL should contain `gradle-7.4-` or newer (e.g. `gradle-8.9-`).

**Upgrade** — edit `android/gradle/wrapper/gradle-wrapper.properties`:

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.9-bin.zip
```

**Cannot upgrade?** Pin the library:

```bash
npm install react-native-config-ultimate@^0.2.5
# or
pnpm add react-native-config-ultimate@^0.2.5
```

Then delete any leftover sidecar file if present:

```bash
rm -f node_modules/react-native-config-ultimate/android/rncu.yaml.sha256
```

---

### 2. New file: `rncu.yaml.sha256`

After upgrading to 0.3.0, every `npx rncu` invocation writes a sidecar checksum file to:

```
node_modules/react-native-config-ultimate/android/rncu.yaml.sha256
```

This file is a JSON document that records the SHA-256 of every `.env` source file. Gradle reads it at configuration time to detect when `.env` has changed since the last CLI run.

**You do not need to commit this file.** It lives inside `node_modules/`, which is already gitignored.

**Do not hand-edit it.** It is regenerated on every `npx rncu` run.

---

### 3. `manifestPlaceholders` reverted to default-on

In v0.2.1 (commit `9060f14`), `manifestPlaceholders.putAll(cfg)` was silently made opt-in — requiring `project.ext.set("rncuManifestPlaceholders", true)` in `build.gradle` to activate. This change was undocumented and broke projects that relied on `${KEY}` references in `AndroidManifest.xml`.

**0.3.0 restores the pre-0.2.1 default:** injection is on unless explicitly disabled.

| Your current `build.gradle` | What to do in 0.3.0 |
|-----------------------------|---------------------|
| `project.ext.set("rncuManifestPlaceholders", true)` | Remove the line — it's a no-op now (you'll see a WARN log nudge). |
| Nothing (no flag) | Nothing. Injection runs as expected. |
| `project.ext.set("rncuManifestPlaceholders", false)` | Keep it. This is the new opt-out escape hatch (prevents `${ENV_VAR}` from resolving in `AndroidManifest.xml`). |

---

### 4. Flavor users: add `flavor_env_mapping` to `.rncurc.js`

If your project uses `project.ext.flavorEnvMapping` in `build.gradle`, you now also need to declare the same mapping in `.rncurc.js` so the CLI can generate a complete sidecar.

**Example — your existing `build.gradle`:**

```gradle
project.ext.set("flavorEnvMapping", [
    staging: "node_modules/react-native-config-ultimate/android/rncu.staging.yaml",
    prod:    "node_modules/react-native-config-ultimate/android/rncu.prod.yaml"
])
```

**Add matching keys to `.rncurc.js`:**

```js
module.exports = {
  flavor_env_mapping: {
    staging: '.env.staging',
    prod:    '.env.prod',
  },
};
```

The **keys** must match exactly (case-sensitive). The values in `.rncurc.js` are your `.env` source files; the values in `build.gradle` are the generated YAML output paths. Both are required; only the keys are compared.

---

### 5. Rollback

If you hit a problem in 0.3.0, pin to 0.2.x:

```json
// package.json
"dependencies": {
  "react-native-config-ultimate": "~0.2.5"
}
```

Then reinstall and remove the sidecar:

```bash
npm install
rm -f node_modules/react-native-config-ultimate/android/rncu.yaml.sha256
```

Bug reports welcome at [GitHub Issues](https://github.com/javier545dev/react-native-config-ultimate/issues).

---

## Migrating from `react-native-ultimate-config`

This library is a community-maintained fork of [`react-native-ultimate-config`](https://github.com/maxkomarychev/react-native-ultimate-config) with New Architecture support, bug fixes, and active maintenance. Migration is straightforward — the API is 100% compatible.

### 1. Update package name

```bash
# Remove old package
npm uninstall react-native-ultimate-config
# or
yarn remove react-native-ultimate-config

# Install new package
npm install react-native-config-ultimate
# or
yarn add react-native-config-ultimate
# or
pnpm add react-native-config-ultimate
```

### 2. Update imports

```diff
- import Config from 'react-native-ultimate-config';
+ import Config from 'react-native-config-ultimate';
```

### 3. Update Android configuration

In `android/app/build.gradle`:

```diff
- apply from: "../../node_modules/react-native-ultimate-config/android/rncu.gradle"
+ apply from: "../../node_modules/react-native-config-ultimate/android/rncu.gradle"
```

> **Tip:** For monorepos, use the Gradle project reference instead:
> ```gradle
> apply from: project(':react-native-config-ultimate').projectDir.getPath() + "/rncu.gradle"
> ```

In `MainApplication.kt` (or `.java`):

```diff
- import com.reactnativeultimateconfig.UltimateConfigModule
+ import com.reactnativeultimateconfig.UltimateConfigModule
```

> **Note:** The import stays the same! The Java package name is unchanged for compatibility.

### 4. Run pod install

```bash
cd ios && pod install && cd ..
```

### 5. Regenerate config files

```bash
npx rncu .env
```

That's it! The API is 100% compatible.

---

## Migrating from `react-native-config`

If you're coming from `react-native-config`, the migration requires a few more steps since the libraries have different APIs and setup.

### Key differences

| Feature | react-native-config | react-native-config-ultimate |
|---------|---------------------|------------------------------|
| Import | `import Config from 'react-native-config'` | `import Config from 'react-native-config-ultimate'` |
| Access | `Config.MY_VAR` | `Config.MY_VAR` |
| Types | Manual `.d.ts` file | Auto-generated |
| New Architecture | ❌ | ✅ |
| YAML support | ❌ | ✅ |
| Per-platform values | ❌ | ✅ |
| Multi-env merging | ❌ | ✅ |
| Web support | Limited | Full |
| Variable expansion | ❌ | ✅ |
| Schema validation | ❌ | ✅ |

### 1. Update package

```bash
npm uninstall react-native-config
npm install react-native-config-ultimate
```

### 2. Update imports

```diff
- import Config from 'react-native-config';
+ import Config from 'react-native-config-ultimate';
```

### 3. Remove manual type definitions

If you had a manual `env.d.ts` file, you can delete it. Types are auto-generated by `rncu`.

### 4. Update Android setup

Remove any `react-native-config` configuration from `android/app/build.gradle` and follow the [quickstart guide](./quickstart.md#android-setup).

Key steps:
1. Add `apply from: project(':react-native-config-ultimate').projectDir.getPath() + "/rncu.gradle"` at the top
2. Add `setBuildConfig()` in MainApplication (Old Architecture only)

### 5. Update iOS setup

1. Remove `react-native-config` from your Podfile if present
2. Run `pod install`
3. Run `npx rncu .env` to generate `rncu.xcconfig`
4. Add `rncu.xcconfig` to your Xcode project and set it as base configuration
5. See [quickstart guide](./quickstart.md#ios-setup) for detailed steps

### 6. Convert .env format (optional)

Your existing `.env` files work as-is. However, you can now use YAML for more features:

**Before (.env):**
```env
API_URL=https://api.example.com
API_TIMEOUT=5000
DEBUG_MODE=true
```

**After (.env.yaml) — optional but recommended:**
```yaml
API_URL: https://api.example.com
API_TIMEOUT: 5000      # Typed as number
DEBUG_MODE: true       # Typed as boolean

# Per-platform values
STORE_URL:
  ios: https://apps.apple.com/app/myapp
  android: https://play.google.com/store/apps/details?id=com.myapp
  web: https://myapp.com
```

### 7. Regenerate config

```bash
npx rncu .env
# or for YAML
npx rncu .env.yaml
```

---

## What's New in v0.2.0

### New Features

| Feature | Description |
|---------|-------------|
| **New Architecture** | Full support for TurboModules (RN 0.68+) |
| **Old Architecture** | Continues to work with Bridge/NativeModules |
| **React 18/19** | Compatible with latest React versions |
| **Web Support** | Works with Vite + React Native Web |
| **Watch mode** | `npx rncu .env --watch` auto-regenerates on changes |
| **Monorepo support** | Better handling of hoisted dependencies (pnpm, yarn workspaces) |

### Bug Fixes

| Issue | Fix |
|-------|-----|
| Package distribution | Added missing `bin.js`, `index.d.ts`, `index.web.js` |
| iOS performance | Changed `requiresMainQueueSetup` to `NO` |
| Android reliability | Loud failure when `__RNCU_KEYS` is missing |
| Security | Updated SnakeYAML 1.19 → 1.33 (CVE fixes) |
| String escaping | Properly escapes `\`, `\n`, `\r` |
| Validation | Env key names must be valid JS identifiers |

### Improvements

- **Test coverage:** 93%+ (up from ~70% in the original)
- **TypeScript:** Stricter types, better IDE support
- **ESLint:** Updated for modern standards

### Breaking Changes

**None.** This is a drop-in replacement for `react-native-ultimate-config`.

---

## Troubleshooting Migration

### "Cannot find module 'react-native-config-ultimate'"

```bash
# Make sure you installed the package
npm install react-native-config-ultimate

# And ran pod install for iOS
cd ios && pod install && cd ..
```

### Android build fails with "UltimateConfigModule not found"

Ensure you've added:
1. The gradle plugin in `android/app/build.gradle`
2. The `setBuildConfig()` call in `MainApplication` (Old Architecture only)

See [quickstart](./quickstart.md#android-setup).

### iOS build fails with "rncu.xcconfig not found"

1. Run `npx rncu .env` to generate the config file
2. Drag `rncu.xcconfig` into your Xcode project
3. Set it as the base configuration in Project Settings → Info

### Values are undefined at runtime

1. Regenerate files: `npx rncu .env`
2. For native values, you need a **full rebuild** — hot reload won't work
3. Check that env key names are valid JS identifiers (no spaces, dashes, or special characters)

### Metro error: "Unable to resolve module"

Clear Metro cache and rebuild:

```bash
npx react-native start --reset-cache
```

---

## Need More Help?

- [Troubleshooting Guide](./troubleshooting.md) — Common issues and solutions
- [GitHub Issues](https://github.com/javier545dev/react-native-config-ultimate/issues) — Report bugs or ask questions
- [API Reference](./api.md) — Full API documentation
