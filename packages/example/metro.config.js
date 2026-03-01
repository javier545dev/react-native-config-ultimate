const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../../");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
	watchFolders: [
		repoRoot, // needed so Metro can resolve hoisted packages from root node_modules
	],
	resolver: {
		nodeModulesPaths: [
			path.resolve(repoRoot, "node_modules"), // resolve hoisted deps (e.g. @babel/runtime)
		],
	},
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
