# Migration Guide

## Migrating from `react-native-ultimate-config`

This library is a fork of `react-native-ultimate-config` with bug fixes, improved security, and better TypeScript support. Migration is straightforward.

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

If you're coming from `react-native-config`, the migration requires a few more steps since the libraries have different APIs.

### Key differences

| Feature | react-native-config | react-native-config-ultimate |
|---------|---------------------|------------------------------|
| Import | `import Config from 'react-native-config'` | `import Config from 'react-native-config-ultimate'` |
| Access | `Config.MY_VAR` | `Config.MY_VAR` |
| Types | Manual `.d.ts` file | Auto-generated |
| YAML support | ❌ | ✅ |
| Nested values | ❌ | ✅ (flattened) |
| Web support | Limited | Full |
| Per-platform values | ❌ | ✅ |

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

If you had a manual `env.d.ts` file, you can delete it. Types are auto-generated.

### 4. Update Android setup

Remove any `react-native-config` configuration from `android/app/build.gradle` and follow the [quickstart guide](./quickstart.md#android).

### 5. Update iOS setup

1. Remove `react-native-config` from your Podfile
2. Run `pod install`
3. Follow the [quickstart guide](./quickstart.md) for iOS xcconfig setup

### 6. Convert .env format (optional)

Your existing `.env` files will work as-is. However, you can now use YAML for more complex configurations:

**Before (.env):**
```
API_URL=https://api.example.com
API_TIMEOUT=5000
FEATURE_FLAG_NEW_UI=true
```

**After (.env.yaml) — optional:**
```yaml
API_URL: https://api.example.com
API_TIMEOUT: 5000
FEATURE_FLAG_NEW_UI: true

# Per-platform values
ios:
  STORE_URL: https://apps.apple.com/app/myapp
android:
  STORE_URL: https://play.google.com/store/apps/details?id=com.myapp
```

### 7. Regenerate config

```bash
npx rncu .env
# or for YAML
npx rncu .env.yaml
```

---

## What's new in 0.0.2

### Bug fixes

- **Package distribution:** Added missing `bin.js`, `index.d.ts`, `index.web.js` to published files
- **iOS performance:** Changed `requiresMainQueueSetup` to `NO` (prevents main thread blocking)
- **Android reliability:** Added loud failure in debug mode when `__RNCU_KEYS` is missing from BuildConfig
- **Security:** Updated SnakeYAML from 1.19 to 1.33 (CVE fixes)
- **String escaping:** Properly escapes backslashes (`\`), newlines (`\n`), and carriage returns (`\r`)
- **Validation:** Added env key name validation (must be valid JS identifiers)

### Improvements

- **Test coverage:** 93.69% (up from ~70% in the original)
- **TypeScript:** Stricter types, better IDE support
- **ESLint:** Updated configuration for modern standards

### Breaking changes

None. This is a drop-in replacement.

---

## Troubleshooting

### "Cannot find module 'react-native-config-ultimate'"

Make sure you've installed the package and run `pod install`:

```bash
npm install react-native-config-ultimate
cd ios && pod install && cd ..
```

### Android build fails with "UltimateConfigModule not found"

Ensure you've added the gradle plugin and `setBuildConfig` call. See [quickstart](./quickstart.md#android).

### iOS build fails with "rncu.xcconfig not found"

Run `npx rncu .env` to generate the config file, then drag it into Xcode.

### Values are undefined at runtime

1. Make sure you regenerated files after changing `.env`: `npx rncu .env`
2. For native values (xcconfig/BuildConfig), you need a **full rebuild** — not just a reload
3. Check that your env key names are valid JavaScript identifiers (no spaces, dashes, or special characters)
