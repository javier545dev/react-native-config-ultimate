# Android Smoke Test — Stale Env-Var Fix (0.3.0)

Manual verification recipe for the sidecar divergence check and config-cache invalidation introduced in 0.3.0. Run this against a real React Native app (RN 0.74+) before releasing.

---

## Prerequisites

- A fresh RN 0.74+ app (or the `apps/` example in this repo).
- `react-native-config-ultimate@0.3.0` (local path link or published).
- Android SDK and a connected device or emulator.

Add to `android/gradle.properties`:

```properties
org.gradle.configuration-cache=true
```

---

## Step 1 — Initial setup

```bash
# Fresh install
pnpm install   # or npm install / yarn

# Verify the CLI is on your PATH
npx rncu --version
```

**Pass:** CLI prints a version string.

---

## Step 2 — Create two env files with different values

```bash
# .env.production
echo "API_URL=https://api.production.com\nAPP_ENV=production" > .env.production

# .env.staging
echo "API_URL=https://api.staging.com\nAPP_ENV=staging" > .env.staging
```

---

## Step 3 — Generate sidecar and verify it exists

```bash
npx rncu .env.production
```

**Pass criteria:**

1. `node_modules/react-native-config-ultimate/android/rncu.yaml.sha256` exists.
2. It is valid JSON with fields: `version`, `rncuVersion`, `generatedAt`, `combinedHash`, `sources`, `flavorMapping`.
3. `sources[0].path` is `".env.production"` (RN-root-relative, forward slashes).
4. `sources[0].sha256` is a 64-char hex string.

```bash
cat node_modules/react-native-config-ultimate/android/rncu.yaml.sha256
```

---

## Step 4 — Build with production env; verify values

```bash
cd android && ./gradlew bundleRelease
```

**Pass criteria:**

1. Build succeeds.
2. Log line `[rncu] sidecar version=1` appears with `--info`.
3. `BuildConfig.API_URL` in the produced AAB equals `"https://api.production.com"`.
4. On second run WITHOUT any file changes: Gradle prints "Configuration cache entry reused" — the cache IS reused.

---

## Step 5 — Switch to staging env WITHOUT clean; verify values changed (bug is fixed)

```bash
# From project root
npx rncu .env.staging

cd android && ./gradlew bundleRelease
```

**Pass criteria:**

1. Build succeeds (Gradle detects sidecar changed → cache invalidated → re-evaluates).
2. `BuildConfig.API_URL` in the produced AAB equals `"https://api.staging.com"` — NOT the production value.
3. `BuildConfig.APP_ENV` equals `"staging"`.

This is the core regression test: verifying that switching environments without `--clean` produces correct values.

---

## Step 6 — Edit `.env.staging` WITHOUT re-running CLI; verify build fails

```bash
# Edit the file directly (simulates a developer changing a value and forgetting to re-run)
echo "API_URL=https://api.staging.com\nAPP_ENV=staging\nNEW_KEY=secret" >> .env.staging

# Build WITHOUT running npx rncu
cd android && ./gradlew bundleRelease
```

**Pass criteria:**

1. Build FAILS at configuration phase — no AAB is produced.
2. Error message contains:
   - `"Source env file(s) changed since the rncu CLI was last run"`
   - `"- .env.staging changed"`
   - `"npx rncu .env.staging"`
3. The word "staging" appears in the `npx rncu` command — the error is actionable.

---

## Additional checks (recommended)

### Gradle version gate

Temporarily downgrade Gradle in `android/gradle/wrapper/gradle-wrapper.properties` to 7.3, then run any Gradle command:

```
react-native-config-ultimate 0.3.0+ requires Gradle 7.4 or newer. Current: 7.3.
```

Restore Gradle version after verifying.

### `manifestPlaceholders` default-on

In `AndroidManifest.xml`, add a placeholder reference (e.g. `android:label="${APP_ENV}"`). With no `rncuManifestPlaceholders` flag in `build.gradle`, the build should succeed and the resolved value should appear in the manifest. Previously (0.2.1–0.2.5) this required `project.ext.set("rncuManifestPlaceholders", true)`.

### `manifestPlaceholders` opt-out

Add `project.ext.set("rncuManifestPlaceholders", false)` to `build.gradle`. The placeholder `${APP_ENV}` in `AndroidManifest.xml` should remain unresolved. `BuildConfig.APP_ENV` should still be set correctly (BuildConfig injection is unconditional).
