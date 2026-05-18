/**
 * React Native CLI configuration for the example app.
 *
 * IMPORTANT: We intentionally do NOT override the dependency paths here.
 * This allows React Native's autolink to resolve `react-native-config-ultimate`
 * from node_modules (the npm package), simulating how real users consume the library.
 *
 * Previous versions incorrectly forced the path to the local workspace package,
 * which caused Android Gradle to read rncu.yaml from the wrong location.
 *
 * @see https://reactnative.dev/docs/next/native-modules-autolinking
 */
module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: true,
    },
  },
  // Let autolink resolve the package from node_modules (the npm version)
};
