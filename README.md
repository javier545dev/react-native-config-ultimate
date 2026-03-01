# react-native-ultimate-config

_Config that works_

[![NPM](https://img.shields.io/npm/l/react-native-ultimate-config)](https://www.npmjs.com/package/react-native-ultimate-config)
[![npm](https://img.shields.io/npm/v/react-native-ultimate-config?color=green&label=version)](https://www.npmjs.com/package/react-native-ultimate-config)
[![npm](https://img.shields.io/npm/dw/react-native-ultimate-config?color=green)](https://www.npmjs.com/package/react-native-ultimate-config)

## Gradle compatibility

| react-native-ultimate-config | gradle |
| ---------------------------- | ------ |
| ^3                           | <=6    |
| ^4 – ^6                      | 7      |
| ^7                           | 8      |

## React Native compatibility

| react-native-ultimate-config | react-native | react  | New Architecture |
| ---------------------------- | ------------ | ------ | ---------------- |
| ^7                           | >=0.60 <1.x  | >=16   | ✅ TurboModules  |
| ^6                           | >=0.60 <1.x  | >=16   | ❌               |

## TL;DR usage

1. install
   | npm | yarn |
   |-|-|
   |`npm install react-native-ultimate-config` | `yarn add react-native-ultimate-config`|
2. [one-off setup for native projects](./docs/quickstart.md)
3. initialize env
   | npm | yarn |
   |-|-|
   |`npx rnuc .env`|`yarn rnuc .env`|
4. build! `react-native run-{ios,android}`

## ☝❗Approach to versioning and breaking changes

This library is using [semver](https://semver.org/) and heavily relying on codegeneration. Many new features and/or bugfixes will require these files to be regenerated. Changes to codegenerated files will not be considered breaking
unless they affect behavior of API or CLI.

Therefore every time this library is updated all files MUST be regenerated using `rnuc` command.

## Table of contents

1. [Features 🎆](#features)
1. [Mission 🥾](#mission)
1. [Quickstart Guide 🏃](./docs/quickstart.md)
1. [API 🧰](./docs/api.md)
1. [Changelog 📓](./packages/react-native-ultimate-config/CHANGELOG.md)
1. [Cookbook 🥦](./docs/cookbook.md)
1. [Troubleshooting 🎱](./docs/troubleshooting.md)
1. [Contributor notes](./docs/contributor-notes.md)
1. [Alternatives](./docs/alternatives.md)

## Features

1. Simple one-off [setup](./docs/quickstart.md) for native projects
1. No need to mess with xcode schemes or android flavors
1. Access from [javascript](./docs/api.md#javascript)
1. Access from native code: [java](./docs/api.md#java) and [objective-c](./docs/api.md#objective-c)
1. Access in build tools: [xcode](./docs/api.md#ios), [gradle](./docs/api.md#buildgradle) and [AndroidManifest.xml](./docs/api.md#androidmanifestxml)
1. [Web support](./docs/api.md#web) (works with React Native for Web)
1. [Hooks](./docs/api.md#hooks)
1. [Monorepo support](./docs/monorepo-tips.md) (yarn workspaces or lerna)
1. **[New Architecture](./docs/api.md#new-architecture)** — TurboModules support (RN 0.68+), fully backward-compatible with old arch
1. **[Multi-env file merging](./docs/api.md#multi-env-file-merging)** — `rnuc .env.base .env.staging` (v7+)
1. **[Dotenv variable expansion](./docs/api.md#dotenv-variable-expansion)** — `API_URL=$BASE_URL/v1` (v7+)
1. **[Schema validation](./docs/api.md#schema-validation)** — fail at build time on missing or invalid vars (v7+)
1. Unit tested with jest (83 tests)
1. Written in TypeScript with strict mode — [exact typings](./docs/api.md#typescript) generated for your env vars
1. Supports [dotenv and yaml](./docs/api.md#files)
1. [Fully typed](./docs/api.md#note-about-types) values available when using yaml config
1. Configure values [per platform](./docs/api.md#per-platform-values) in one file

## Mission

React-Native brings together 3 platforms: ios, android, javascript each of
which have different conventions and approaches how to manage environment
settings.

A typical app is usually operating in some environment defined by server urls
various api keys or feature flags. When dealing with react-native such things
often need to exist in 3 places: ios, android and js code. Even managing things
as simple as application name or bundle id needs to be done in 2 places:
`Info.plist` and `AndroidManifest.xml`

`react-native-ultimate-config` tries to reduce friction in managing these things
by abstracting away from nuances of native projects.

With `react-native-ultimate-config` it is possible to [consume](./docs/api.md) variables in
every place of a typical react-native app:

- javascript
- native code
  - java
  - objective-c
- native build configuration
  - ios
    - build settings
    - infoplist
  - android
    - build config
    - string resources
    - project.ext

```
|-------------------------------------------------------|
|                                                       |
|                     javascript                        |
|                                                       |
|-------------------------------------------------------|
|                          |                            |
|       objective-c        |           java             |
|                          |                            |
|-------------------------------------------------------|
|                          |                            |
|      build settings      |     AndroidManifest.xml    |
|         infoplist        |        build.gradle        |
|                          |                            |
|-------------------------------------------------------|
```
