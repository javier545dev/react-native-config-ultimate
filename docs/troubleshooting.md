# Troubleshooting

This document covers common errors and pitfalls when implementing the library in a project.

## Build fails on missing config files

After following the steps in the [quickstart guide](./quickstart.md) your builds depend on the generated config files. When these files are missing, you may see build errors like:

> yaml file at path /X/Y/node_modules/react-native-config-ultimate/android/rncu.yaml does not exist

Or

> /X/Y/node_modules/react-native-config-ultimate/ios/ConfigValues.h:1:2: error: "invoke bin.js with env file before compiling native project"

When this happens, all you need to do is trigger the script that generates the required config files:

```bash
yarn rncu <env file>
```

☝️ Note that the generated config files are not persistent in your codebase (and they should not be). This can lead to builds failing when:

- Cleaning your local working directory (e.g. when re-installing node-modules).
- Initiating the project on a new machine.
- Building the project on a CI server.

To prevent this, simply add the `yarn rncu <env file>` command in your workflow before building.

### 🧹 Example: cleaning your local working directory

```json
// package.json

{
  "scripts": {
    "clean": "rm -rf node_modules && yarn && yarn rncu <env file>"
  }
}
```

### 🤖 Example: building the project on AppCenter

AppCenter allows you to customize your builds by adding [build scripts](https://docs.microsoft.com/en-us/appcenter/build/custom/scripts/). When configured we can use the post-clone script to generate the config files before the app is built:

```sh
# appcenter-post-clone.sh

echo "Installing yarn dependencies..."
yarn install

echo "Generating config files..."
yarn rncu <env file>
```

Other Build/CI services will have different approaches, but the concept is the same: make sure the config files are generated _before_ the build step.

## Android: "DEBUG" variable causes build error

If you have a variable named `DEBUG` in your `.env` file:

```
DEBUG=true
```

Android builds will fail with:

```
error: incompatible types: boolean cannot be converted to String
  public static final String DEBUG = false;
```

**Cause**: Android's `BuildConfig` class already has a built-in `DEBUG` boolean field. The library tries to create a String field with the same name, causing a conflict.

**Solution**: Rename your variable to something else:

```diff
- DEBUG=true
+ DEBUG_MODE=true
```

Then access it as `Config.DEBUG_MODE` in your code.

## CLI: "command not found" or "use strict: command not found"

If running `npx rncu .env` fails with:

```
/path/to/node_modules/.bin/rncu: line 1: use strict: command not found
```

**Cause**: The CLI script is missing the shebang (`#!/usr/bin/env node`), so the OS tries to run it as a bash script instead of Node.js.

**Solution**: 

1. If you're using a published version, try reinstalling:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. If developing locally, rebuild the library:
   ```bash
   cd packages/react-native-config-ultimate
   npm run build
   ```

## Monorepo: Android can't find gradle-plugin or react-native

In monorepos with hoisted dependencies (npm workspaces, yarn workspaces, pnpm), Android may fail with:

```
Included build '.../node_modules/@react-native/gradle-plugin' does not exist
```

Or:

```
.../node_modules/react-native/ReactAndroid/gradle.properties (No such file or directory)
```

**Cause**: Android Gradle Plugin expects `react-native` and `@react-native/*` packages to be in the project's local `node_modules/`, but in monorepos they're hoisted to the root.

**Solution**: Create symlinks in your app's `node_modules/`:

```bash
cd packages/your-app/node_modules
ln -sf ../../../node_modules/react-native react-native
ln -sf ../../../node_modules/@react-native @react-native
```

Or add this to your `postinstall` script in `package.json`.

## iOS: ConfigValues.h not generated

If iOS build fails with:

```
#error "react-native-config-ultimate: ConfigValues.h not generated. Run: npx rncu .env from your project root before building iOS."
```

**Cause**: The `rncu` CLI hasn't been run, or it wrote to the wrong location.

**Solution**:

1. Run the CLI from your project root:
   ```bash
   npx rncu .env
   ```

2. Verify the file was generated:
   ```bash
   cat node_modules/react-native-config-ultimate/ios/ConfigValues.h
   ```
   
   It should contain your env variables, not the error message.

3. In monorepos, you may need to specify the library path:
   ```bash
   # If using npm workspaces
   node -e "
   const main = require('react-native-config-ultimate/lib/commonjs/main').default;
   main(process.cwd(), require.resolve('react-native-config-ultimate').replace('/src/index.ts',''), ['.env']);
   "
   ```

## Android: Empty config object `{}`

If your app shows `Config values: {}` (empty object) on Android:

**Cause 1**: Missing `setBuildConfig` call in `MainApplication`.

**Solution**: Add to `MainApplication.kt`:

```kotlin
import com.reactnativeultimateconfig.UltimateConfigModule

override fun onCreate() {
  super.onCreate()
  UltimateConfigModule.setBuildConfig(BuildConfig::class.java)
  // ... rest of onCreate
}
```

**Cause 2**: Missing `rncu.gradle` apply in `app/build.gradle`.

**Solution**: Add at the top of `android/app/build.gradle`:

```gradle
apply from: project(':react-native-config-ultimate').projectDir.getPath() + "/rncu.gradle"
```

**Cause 3**: The config files weren't regenerated after changing `.env`.

**Solution**: Run `npx rncu .env` and rebuild the app (a hot reload won't work for native changes).
