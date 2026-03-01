const path = require('path');
const { getConfig } = require('react-native-builder-bob/babel-config');
const pkg = require('../react-native-config-ultimate/package.json');

const root = path.resolve(__dirname, '..', 'react-native-config-ultimate');

module.exports = getConfig(
  {
    presets: ['module:@react-native/babel-preset'],
  },
  { root, pkg }
);
