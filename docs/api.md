# API

Table of contents

1. [Files](#files)
   1. [Dotenv variable expansion](#dotenv-variable-expansion)
   1. [Per platform values](#per-platform-values)
1. [CLI](#cli)
   1. [Multi-env file merging](#multi-env-file-merging)
   1. [Advanced options for monorepo](#advanced-options-for-monorepo)
   1. [RC file](#rc-file)
      1. [Hooks](#hooks)
      1. [Schema validation](#schema-validation)
      1. [JS override](#js-override)
1. [New Architecture](#new-architecture)
1. [Javascript](#javascript)
1. [Typescript](#typescript)
1. [ios](#ios)
   1. [Build settings](#build-settings)
   1. [Info.plist](#infoplist)
   1. [Objective-C](#objective-c)
   1. [Swift](#swift)
1. [Android](#android)
   1. [build.gradle](#buildgradle)
   1. [AndroidManifest.xml](#androidmanifestxml)
   1. [Java](#java)
   1. [Kotlin](#kotlin)
1. [Note about types](#note-about-types)

## Files

Environment data can be read from both dotenv and YAML files. The format is automatically detected by the CLI based on file extension: `.yaml` or `.yml` → YAML; anything else → dotenv.

Example of configuration in env file:

```
HELLO=world
TEST=100
```

Equivalent config with YAML:

```yaml
HELLO: world
TEST: 100
```

### Dotenv variable expansion

Variable references using `$VAR` syntax are automatically expanded in dotenv files:

```env
BASE_URL=https://api.example.com
API_URL=$BASE_URL/v1
AUTH_URL=$BASE_URL/auth
```

This also works across files when [merging multiple env files](#multi-env-file-merging):

```env
# .env.base
BASE_URL=https://api.example.com

# .env.staging
API_URL=$BASE_URL/v1   # → https://api.example.com/v1
```

> **Note:** Variable expansion is only applied to dotenv-format files. YAML files use their own native anchor/alias syntax (`*anchor`).

### Per platform values

When using YAML it is possible to specify values per platform:

```yaml
HELLO: world
TEST: 100
API_KEY:
  ios: abcdef
  android: tuvxyz
  web: 123456
```

☝ both keys must exist in the mapping

## CLI

Inject environment data with a single command:

| npm             | yarn             |
| --------------- | ---------------- |
| `npx rncu .env` | `yarn rncu .env` |

### Multi-env file merging

Pass multiple env files to merge them. Files are processed left-to-right; **the last file wins** for any conflicting keys.

```bash
# Base config + environment-specific override
npx rncu .env.base .env.staging

# Base config + local secrets (gitignored)
npx rncu .env.base .env.local

# Three-level merge
npx rncu .env.base .env.staging .env.local
```

Example:

```env
# .env.base
APP_NAME=MyApp
API_URL=https://api.example.com
DEBUG=false

# .env.staging
API_URL=https://staging.api.example.com
DEBUG=true
```

Result of `rncu .env.base .env.staging`:
```
APP_NAME=MyApp                           # from .env.base
API_URL=https://staging.api.example.com  # overridden by .env.staging
DEBUG=true                               # overridden by .env.staging
```

> **Tip:** Add environment-specific files (`.env.staging`, `.env.prod`) to git and keep `.env.local` in `.gitignore` for local secrets.

### Advanced options for monorepo

1. `--project-root`: path to the root of the project for which injection is performed
1. `--lib-root`: path to where library is installed

Considering typical monorepo folder structure:

```
|-- package.json
|-- node_modules
    |-- react-native-ultimate-config
|-- packages
    |-- my_app
    |-- package1
    |-- package2
    |-- packageN
```

When injecting config for `my_app` the command should be:

```bash
yarn rncu --project-root . --lib-root ../../node_modules/react-native-ultimate-config .env
```

## RC file

### Hooks

When file `.rncurc.js` exists in project root it will be loaded when
`rncu` CLI is executed. A single function `on_env` will be invoked with env
data loaded from the file. Object returned from the function will be used
instead of original env data. When function returns `undefined` original data
will be used.

```js
module.exports = {
  on_env: async function (env) {
    // this will be invoked with data of loaded env file
  },
};
```

### Schema validation

Define a `schema` in `.rncurc.js` to validate env vars at **build time**. The build will fail with a clear error message listing all problems at once if any variable fails validation.

Validation runs **after** the `on_env` hook, so the hook can inject or transform variables before they are checked.

```js
// .rncurc.js
module.exports = {
  schema: {
    // Required string
    API_KEY: { type: 'string', required: true },

    // Required number — fails if value cannot be parsed as a number
    TIMEOUT_MS: { type: 'number', required: true },

    // Optional boolean — accepted values: true/false/1/0 (case-insensitive)
    DEBUG: { type: 'boolean' },

    // String with regex pattern constraint
    ENV_NAME: {
      type: 'string',
      required: true,
      pattern: '^(dev|staging|prod)$',
    },
  },
};
```

When validation fails, the build exits with all errors listed at once:

```
❌ react-native-ultimate-config: env validation failed:
  • Missing required env var: API_KEY
  • TIMEOUT_MS must be a number, got "fast"
  • ENV_NAME does not match pattern /^(dev|staging|prod)$/, got "production"
```

#### Schema field options

| Field | Type | Description |
|-------|------|-------------|
| `type` | `'string' \| 'number' \| 'boolean'` | Expected type. All env values are strings by default; `number` and `boolean` validate parsability. |
| `required` | `boolean` | If `true`, the build fails when the var is missing or empty. Default: `false`. |
| `pattern` | `string` | A regex pattern the value must match (applied to the string representation). |

### JS override

When rc file contains boolean field `js_override` `react-native-ultimate-config` will generate js code overriding values passed from native code. [Scenarios why this may be needed](./cookbook.md#override-native-values-in-js)

```js
module.exports = {
  js_override: true,
};
```

## New Architecture

`react-native-ultimate-config` v7 supports **both** the Old Architecture (Bridge / NativeModules) and the New Architecture (TurboModules) with the same API. No configuration required — the library auto-detects which architecture is active.

| Architecture | React Native | How it works |
|---|---|---|
| Old (Bridge) | >=0.60 | `NativeModules.UltimateConfig.getConstants()` |
| New (TurboModules) | >=0.68 | TurboModule spec via Codegen |

The JS API is identical in both cases:

```typescript
import config from 'react-native-ultimate-config';
config.MY_VAR; // works on old arch and new arch
```

## Javascript

Get your values in javascript!

```javascript
// import module
import config from "react-native-ultimate-config";

// access variables
config.MY_CONFIG;
```

## Typescript

`index.d.ts` is automatically generated by `rncu` with **exact types** derived from your env file. No manual type declarations needed.

```typescript
// Generated index.d.ts (example)
export interface ConfigVariables {
  API_URL: string;
  TIMEOUT_MS: number;   // typed as number when using YAML
  DEBUG: boolean;       // typed as boolean when using YAML
}
declare const UltimateConfig: ConfigVariables;
export default UltimateConfig;
```

For dotenv files, all values are typed as `string`. For YAML files, the actual type (`string`, `number`, `boolean`) is inferred from the value.

## ios

### Build settings

All values from env file are exposed to Build Settings.

### Info.plist

All values from env file are exposed to Build Settings and therefore
automatically available in info plist.

Example: set app name from config

env file:

```env
APP_NAME=example
```

update info plist and observe app name changed:

![update app name](./api.assets/ios.info.1.png)
![update app name](./api.assets/ios.info.2.png)

### Objective-C

```objc
#import <react-native-ultimate-config/ConfigValues.h>

// Access variables directly
NSLog(@"App name: %@", APP_NAME);
NSLog(@"API URL: %@", API_URL);

// Use in conditionals
if ([DEBUG isEqualToString:@"true"]) {
    NSLog(@"Debug mode enabled");
}
```

### Swift

To access config values in Swift, you need to create a bridging header or access them through the generated constants.

#### Option 1: Using Bridging Header (Recommended)

1. Create or update your bridging header (`YourApp-Bridging-Header.h`):

```objc
#import <react-native-ultimate-config/ConfigValues.h>
```

2. Access values in Swift:

```swift
import Foundation

class MyService {
    func configure() {
        // Access string values
        let appName = APP_NAME as String
        let apiUrl = API_URL as String
        
        print("App: \(appName)")
        print("API: \(apiUrl)")
        
        // Use in your code
        configureNetwork(baseUrl: apiUrl)
    }
}
```

#### Option 2: Create a Swift wrapper

Create a type-safe Swift wrapper for your config values:

```swift
// Config.swift
import Foundation

struct Config {
    static var appName: String {
        return APP_NAME as String
    }
    
    static var apiUrl: String {
        return API_URL as String
    }
    
    static var debug: Bool {
        return (DEBUG as? String)?.lowercased() == "true"
    }
    
    static var timeout: Int {
        return Int(TIMEOUT_MS as? String ?? "5000") ?? 5000
    }
}

// Usage
let url = Config.apiUrl
if Config.debug {
    print("Debug mode")
}
```

#### Option 3: Access via Info.plist

Since all values are exposed to Build Settings, they're available in Info.plist. Add your variables to Info.plist and access them via Bundle:

```swift
// In Info.plist, add: APP_NAME = $(APP_NAME)

extension Bundle {
    var appName: String {
        return infoDictionary?["APP_NAME"] as? String ?? ""
    }
    
    var apiUrl: String {
        return infoDictionary?["API_URL"] as? String ?? ""
    }
}

// Usage
let appName = Bundle.main.appName
```

## Android

Gradle plugin of a library injects environment variables into as:

1. `BuildConfig` entries
1. stirng resources
1. `project.ext.env` of `build.gradle`

### build.gradle

you can access config variales with simple

```gradle
project.config.get("APP_NAME")
```

### AndroidManifest.xml

All values from environment are made available as resources and [manifest placeholders](https://developer.android.com/studio/build/manifest-build-variables)

They are accessible as:

#### a string resource

```xml
      <activity
        ...
        android:label="@string/APP_NAME"
        />
        ...
      </activity>
```

#### a placeholder variable

```xml
      <activity
        ...
        android:label="${APP_NAME}"
        />
        ...
      </activity>
```

### Java

All variables are exposed via `BuildConfig`. They are accessible as:

```java
package com.example;

import android.os.Bundle;
import android.util.Log;
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  @Override
  protected String getMainComponentName() {
    return "example";
  }

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Access config values
    Log.d("Config", "App name: " + BuildConfig.APP_NAME);
    Log.d("Config", "API URL: " + BuildConfig.API_URL);
    
    // Use in conditionals
    if (BuildConfig.DEBUG) {
      Log.d("Config", "Debug mode enabled");
    }
  }
}
```

### Kotlin

All variables are exposed via `BuildConfig` and can be accessed directly in Kotlin:

```kotlin
package com.example

import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "example"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Access config values
        Log.d("Config", "App name: ${BuildConfig.APP_NAME}")
        Log.d("Config", "API URL: ${BuildConfig.API_URL}")
        
        // Use in conditionals
        if (BuildConfig.DEBUG) {
            Log.d("Config", "Debug mode enabled")
        }
    }
}
```

#### Type-safe Kotlin wrapper (Optional)

Create a type-safe wrapper for cleaner access:

```kotlin
// Config.kt
package com.example

object Config {
    val appName: String
        get() = BuildConfig.APP_NAME
    
    val apiUrl: String
        get() = BuildConfig.API_URL
    
    val debug: Boolean
        get() = BuildConfig.DEBUG
    
    val timeoutMs: Int
        get() = BuildConfig.TIMEOUT_MS.toIntOrNull() ?: 5000
}

// Usage
class MyService {
    fun configure() {
        val url = Config.apiUrl
        
        if (Config.debug) {
            Log.d("MyService", "Debug mode - using $url")
        }
    }
}
```

#### Access in Jetpack Compose

```kotlin
@Composable
fun AppInfo() {
    Column {
        Text(text = "App: ${BuildConfig.APP_NAME}")
        Text(text = "Version: ${BuildConfig.VERSION_NAME}")
        
        if (BuildConfig.DEBUG) {
            Text(
                text = "Debug Mode",
                color = Color.Red
            )
        }
    }
}
```

## Web

Variables are exported as an object from `react-native-ultimate-config`:

```javascript
// import module
import config from "react-native-ultimate-config";

// access variables
config.MY_CONFIG;
```

This functionality relies on the [package.json browser field](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#browser), see the [quickstart guide](./quickstart.md) for details.

## Note about types

If yaml file is used for configuration then it is possible to pick up types of variables, however not every place can deal with all types or deal with types at all. Please consult with the following table to know what's available:

| place               | types available | notes                                                                                                                                                                                    |
| ------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| javascript          | yes             | -                                                                                                                                                                                        |
| infoplist           | no              | all values are strings                                                                                                                                                                   |
| objective-c         | yes             | -                                                                                                                                                                                        |
| swift               | yes             | requires bridging header or wrapper                                                                                                                                                      |
| build.gradle        | yes             | -                                                                                                                                                                                        |
| AndroidManifest.xml | yes\*           | floating point values are available as `@string` resources since there are no such type available in resources: https://developer.android.com/guide/topics/resources/available-resources |
| Java                | yes             | -                                                                                                                                                                                        |
| Kotlin              | yes             | same as Java, via BuildConfig                                                                                                                                                            |
