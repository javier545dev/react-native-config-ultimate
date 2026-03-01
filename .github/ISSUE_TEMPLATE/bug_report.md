---
name: Bug report
about: Create a report to help us improve
title: ""
labels: bug::triage-needed
assignees: ""
---

<!-- 👋👋👋 Thank you for reporting a bug. Provide as much information as possible
according to the template below.
-->

# Describe the bug

A clear and concise description of what the bug is.

# Steps to Reproduce

Steps to reproduce the behavior.

Please consider creating small project that demonstrates the problem.
Having done clean setup helps pinpointing the problem.

# Expected behavior

A clear and concise description of what you expected to happen.

# Stacktraces, logs, screenshots

Post stacktraces, logs or screenshots. The more information is available
is better.

# Environment

## Integration option

- [ ] I am using `rncu` CLI to inject environment (default integration option
      from [quickstart guide](../../docs/quickstart.md))
- [ ] I am using scheme/flavor based integration (experimental integration
      option from cookbook:
      [scheme](../../docs/cookbook.md#using-multiple-schemes-ios),
      [flavors](../../docs/cookbook.md#using-multiple-flavors-android))
- [ ] I am using `react-native-config-ultimate` within monorepo managed with
      Lerna or Yarn Workspaces [Monorepo support](../../docs/api.md#advanced-options-for-monorepo)

## Env file

- [ ] I am using dotenv file as a source for variables
- [ ] I am using YAML file as a source for variables

### Example of env file that is causing problems

```
❗PROVIDE EXAMPLE OF ENV FILE
```

## OS

- [ ] ios
- [ ] android

## Packages

- version of `react-native`: ❗ _INSERT VERSION HERE_
- version of `react-native-config-ultimate`: ❗*INSERT VERSION HERE*

Run `react-native info` and post below:

```
PASTE OUTPUT OF `react-native info` HERE
```

# Additional context

Add any other context about the problem here.
