/**
 * Unit tests for the Example App
 *
 * These tests show how to test React Native components that consume
 * react-native-config-ultimate. The key pattern is to mock the config
 * module so tests don't depend on native code or generated files.
 *
 * Run: yarn test (from packages/example) or npx jest
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// ---------------------------------------------------------------------------
// Mock react-native-config-ultimate
//
// In real apps, mock this in jest.config.js using `moduleNameMapper` or in
// a __mocks__ folder. Here we do it inline for clarity.
//
// The shape must match what rnuc generates — i.e. the keys from your .env.
// ---------------------------------------------------------------------------
jest.mock('react-native-config-ultimate', () => ({
  HELLO: 'world',
  API_URL: 'https://api.example.com',
  APP_ENV: 'test',
}));

// ---------------------------------------------------------------------------
// Mock react-native/Libraries/NewAppScreen (not available in Jest)
// ---------------------------------------------------------------------------
jest.mock('react-native/Libraries/NewAppScreen', () => ({
  Colors: {
    white: '#fff',
    black: '#000',
    light: '#eee',
    dark: '#333',
    lighter: '#f3f3f3',
    darker: '#222',
  },
  Header: () => null,
  LearnMoreLinks: () => null,
  DebugInstructions: () => 'Reload the app',
  ReloadInstructions: () => 'Double tap R',
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('App', () => {
  it('renders without crashing', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<App />);
    });
  });

  it('renders the Config section', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(<App />);
    });

    const json = root!.toJSON();
    const rendered = JSON.stringify(json);

    // The Config section title must be visible
    expect(rendered).toContain('Config');
  });

  it('displays config values from the mocked module', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(<App />);
    });

    // config-values testID renders JSON.stringify(config)
    const configText = root!.root.findAll(
      node =>
        node.props.testID === 'config-values' && node.type === 'Text',
    );

    expect(configText.length).toBeGreaterThan(0);

    const rendered = configText[0].props.children as string;
    const parsed = JSON.parse(rendered);

    expect(parsed.HELLO).toBe('world');
    expect(parsed.API_URL).toBe('https://api.example.com');
    expect(parsed.APP_ENV).toBe('test');
  });

  it('renders section testIDs for e2e targeting', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(<App />);
    });

    // Verify testID anchors exist — these are what Detox/Maestro will target
    const configSection = root!.root.findAll(
      node => node.props.testID === 'section-config',
    );
    expect(configSection.length).toBeGreaterThan(0);

    const configTitle = root!.root.findAll(
      node => node.props.testID === 'section-title-config',
    );
    expect(configTitle.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// How to structure your own component tests
// ---------------------------------------------------------------------------

describe('Pattern: testing components that use config', () => {
  /**
   * When you have a component like:
   *
   *   import config from 'react-native-config-ultimate';
   *   function ApiLabel() {
   *     return <Text>{config.API_URL}</Text>;
   *   }
   *
   * Mock the module at the top of your test file:
   *
   *   jest.mock('react-native-config-ultimate', () => ({
   *     API_URL: 'https://mock-api.test',
   *   }));
   *
   * Or globally in jest.config.js:
   *
   *   moduleNameMapper: {
   *     'react-native-config-ultimate': '<rootDir>/__mocks__/config.ts',
   *   }
   *
   * And in __mocks__/config.ts:
   *
   *   export default {
   *     API_URL: 'https://mock-api.test',
   *     APP_ENV: 'test',
   *   };
   */
  it('demonstrates the mock pattern (always passes)', () => {
    // This test exists solely as documentation.
    // See the comment block above for the pattern.
    expect(true).toBe(true);
  });
});
