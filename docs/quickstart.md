# Quickstart

Get up and running with `react-native-config-ultimate` in 5 minutes.

![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=apple&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white)
![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=google-chrome&logoColor=white)

> **Note:** v0.2.0 is the first stable release. Versions `<0.2.0` are deprecated.

---

## Compatibility

| Library | React Native | React | Gradle | Architecture |
|:-------:|:------------:|:-----:|:------:|:------------:|
| **0.3.x** | ≥ 0.73 | 18 / 19 | ≥ 7.4 | Old & New (TurboModules) |
| **0.2.x** | ≥ 0.73 | 18 / 19 | ≥ 8 | Old & New (TurboModules) |

**Supported Platforms:**
- **iOS** — Native modules (Objective-C/Swift), Info.plist, Build Settings
- **Android** — Native modules (Java/Kotlin), BuildConfig, Manifest placeholders
- **Web** — Vite, Webpack, Rollup, Parcel (via React Native Web)

For advanced setup (multiple schemes, flavors, monorepos), see the [Cookbook](./cookbook.md).

---

## 1. Install the package

```bash
# npm
npm install react-native-config-ultimate

# yarn
yarn add react-native-config-ultimate

# pnpm
pnpm add react-native-config-ultimate
```

## 2. Create your config file

**Option A: `.env` (simple key=value)**

```bash
echo "API_URL=https://api.myapp.com" > .env
```

**Option B: `.env.yaml` (supports types and per-platform values)** — Recommended

```yaml
# .env.yaml
API_URL: https://api.myapp.com
DEBUG_MODE: true        # Typed as boolean
TIMEOUT_MS: 5000        # Typed as number

# Per-platform values
APP_STORE_URL:
  ios: https://apps.apple.com/app/myapp
  android: https://play.google.com/store/apps/details?id=com.myapp
  web: https://myapp.com
```

## 3. Update .gitignore

Add this to `.gitignore` (generated files should not be committed):

```gitignore
# react-native-config-ultimate
rncu.xcconfig
```

## 4. Generate config files

```bash
npx rncu .env
# or for YAML
npx rncu .env.yaml
```

This generates platform-specific files that native code reads at build time.

---

## 5. Configure iOS (one-time setup)
<a name="ios-setup"></a>

1. Run `pod install` in the `ios` folder:

   ```bash
   cd ios && pod install && cd ..
   ```

2. Open the `.xcworkspace` in Xcode

3. Drag `rncu.xcconfig` into your project:
   - Open Finder in `ios/`
   - Drag `rncu.xcconfig` into Xcode's project navigator
   
   ![drag and drop](./quickstart.assets/ios.1.png)
   ![drag and drop](./quickstart.assets/ios.2.png)

4. Set `rncu.xcconfig` as the base configuration:
   - Go to Project Settings → Info tab
   - Under "Configurations", set `rncu` for both Debug and Release
   
   ![set](./quickstart.assets/ios.3.png)
   ![set](./quickstart.assets/ios.4.png)

> **Runtime sanity check:** if `Config.MY_VAR` is `undefined` at runtime and you see `[UltimateConfig] No config values found…` in the Xcode console, you skipped `npx rncu <env-file>` before building (or your `.env` was empty). See [troubleshooting → iOS: empty config at runtime](./troubleshooting.md#ios-empty-config-at-runtime-npx-rncu-not-run-before-build).

---

## 6. Configure Android (one-time setup)
<a name="android-setup"></a>

> **Prerequisites:** Gradle 7.4+ required (0.3.0+). Check your version in `android/gradle/wrapper/gradle-wrapper.properties`. See [Migration Guide](./migration.md#migrating-to-030) if you need to upgrade.

### Step 1: Apply the Gradle plugin

Open `android/app/build.gradle` and add at the **top** of the file (before `android {}`):

```gradle
apply from: project(':react-native-config-ultimate').projectDir.getPath() + "/rncu.gradle"
```

> **Monorepo/pnpm users:** This `project(':...')` form uses Gradle's dependency resolution and works regardless of where `node_modules` lives. See [Monorepo Tips](./monorepo-tips.md).

> **Fallback:** If the above doesn't work, use the relative path:
> ```gradle
> apply from: "../../node_modules/react-native-config-ultimate/android/rncu.gradle"
> ```

### Step 2: Expose BuildConfig (required on both architectures)

> **Required on Old AND New Architecture.** The native module cannot resolve your app's `BuildConfig` class on its own — you must hand it the reference once at app start. Without this call, `Config.MY_VAR` is `undefined` at runtime and a warning is printed to logcat (`UltimateConfig: setBuildConfig was never called…`).

**Kotlin** — in `MainApplication.kt`:

```kotlin
import com.reactnativeultimateconfig.UltimateConfigModule

override fun onCreate() {
  super.onCreate()
  UltimateConfigModule.setBuildConfig(BuildConfig::class.java)
  // ... rest of onCreate
}
```

**Java** — in `MainApplication.java`:

```java
import com.reactnativeultimateconfig.UltimateConfigModule;

@Override
public void onCreate() {
  super.onCreate();
  UltimateConfigModule.setBuildConfig(BuildConfig.class);
  // ... rest of onCreate
}
```

### Step 3: ProGuard (release builds only)

If using ProGuard/R8, add to `proguard-rules.pro`:

```java
-keepclassmembers class YOUR.PACKAGE.NAME.BuildConfig {
   public static <fields>;
}
```

Replace `YOUR.PACKAGE.NAME` with your actual package (e.g., `com.myapp`).

---

## 7. Configure Web (optional)
<a name="web-setup"></a>

![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=google-chrome&logoColor=white)

For [React Native Web](https://necolas.github.io/react-native-web/) projects, the library provides a web-compatible export via the `browser` field in `package.json`.

| Bundler | Configuration | Notes |
|---------|---------------|-------|
| **Vite** | Works out of the box | Recommended for new projects |
| **Webpack** | Works out of the box | Target must include `"web"` |
| **Rollup** | `browser: true` in node-resolve | Use [@rollup/plugin-node-resolve](https://www.npmjs.com/package/@rollup/plugin-node-resolve) |
| **Parcel** | Works out of the box | |

### Vite Example Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
});
```

```tsx
// Works in Web, iOS, and Android!
import Config from 'react-native-config-ultimate';
console.log(Config.API_URL);
```

---

## 8. Use in your app

### JavaScript / TypeScript

```tsx
// App.tsx
import Config from 'react-native-config-ultimate';
import { View, Text } from 'react-native';

function App() {
  return (
    <View>
      <Text>API: {Config.API_URL}</Text>
      <Text>Timeout: {Config.TIMEOUT_MS}ms</Text>
      {Config.DEBUG_MODE && <Text>Debug Mode Enabled</Text>}
    </View>
  );
}
```

TypeScript types are **auto-generated** from your `.env` or `.env.yaml` — no manual `.d.ts` files needed!

### Native Code Access

The same values are available in native code:

**iOS (Swift):**
```swift
// Via Info.plist (see API docs for setup)
let apiUrl = Config.apiUrl
```

**Android (Kotlin):**
```kotlin
// Via BuildConfig
val apiUrl = BuildConfig.API_URL
```

See [API Reference](./api.md) for complete native code examples.

---

## Switching environments

**On Android (0.3.0+), `npx rncu` is required before every build that uses a different env.** Gradle verifies that your `.env` file hasn't changed since the last CLI run. If you skip this step, the build fails immediately with an actionable error.

**Workflow:**

```bash
# 1. Pick your env and run the CLI
npx rncu .env.staging

# 2. Build Android
cd android && ./gradlew bundleRelease
```

If you edit `.env.staging` without re-running the CLI, Gradle will stop the build with:

```
Source env file(s) changed since the rncu CLI was last run:
  - .env.staging changed
Run:  npx rncu .env.staging
Then retry the Android build.
```

**Other common invocations:**

```bash
# Development
npx rncu .env.dev

# Production
npx rncu .env.prod

# Merge multiple files (later files override)
npx rncu .env.base .env.staging
```

**Recommended `package.json` script** — run the CLI automatically before every Android build:

```json
{
  "scripts": {
    "preandroid": "rncu .env"
  }
}
```

After running `rncu`:
- **JavaScript changes**: Just reload the app
- **Native changes** (Info.plist, AndroidManifest): Rebuild required
- **Android with config cache** (`org.gradle.configuration-cache=true`): No `--no-configuration-cache` flag needed in 0.3.0+; the sidecar file is a tracked input that automatically invalidates the cache when env values change.

---

## Watch mode

Auto-regenerate when your `.env` file changes:

```bash
npx rncu .env --watch
```

---

## Next steps

- [API Reference](./api.md) — Full CLI options, YAML features, schema validation
- [Cookbook](./cookbook.md) — App name, bundle ID, deep links, multiple schemes
- [Testing](./testing.md) — Mocking config in Jest tests
- [Troubleshooting](./troubleshooting.md) — Common issues and solutions
