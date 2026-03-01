/**
 * Detox E2E Tests — Config Display
 *
 * WHAT IT TESTS:
 *   Verifies that react-native-config-ultimate correctly delivers .env values
 *   to the running native app, covering both the JS layer (config object) and
 *   the UI layer (values rendered on screen).
 *
 * PREREQUISITES:
 *   1. Install Detox:
 *        npm install --save-dev detox @types/detox
 *
 *   2. Install xcpretty (iOS only):
 *        gem install xcpretty
 *
 *   3. Generate native config files with your env:
 *        cd packages/example
 *        npx rnuc .env
 *
 *   4. Build the app:
 *        iOS:     npx detox build --configuration ios.sim.debug
 *        Android: npx detox build --configuration android.emu.debug
 *
 * RUN:
 *   iOS:     npx detox test --configuration ios.sim.debug
 *   Android: npx detox test --configuration android.emu.debug
 *
 * TIPS:
 *   - Use --reuse flag to reuse a running simulator: --reuse
 *   - Use --take-screenshots all to capture screenshots on each step
 *   - Use --record-videos all to record a video of the test run
 */

describe('Config Display', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  // ── Basic rendering ──────────────────────────────────────────────────────

  it('should render the Config section title', async () => {
    await expect(element(by.id('section-title-config'))).toBeVisible();
  });

  it('should render the Config section body with JSON values', async () => {
    await expect(element(by.id('section-body-config'))).toBeVisible();
  });

  it('should display the HELLO key from .env', async () => {
    // The app renders JSON.stringify(config), so for HELLO=world
    // the text "HELLO" and "world" will both be visible.
    await expect(element(by.id('config-values'))).toBeVisible();

    // Verify the text contains the expected key from .env
    await expect(
      element(by.id('config-values').and(by.text(/HELLO/))),
    ).toExist();
  });

  // ── Scroll behavior ──────────────────────────────────────────────────────

  it('should be able to scroll past the Config section', async () => {
    await element(by.id('section-config')).swipe('up', 'fast', 0.5);
    await expect(element(by.text('Step One'))).toBeVisible();
  });

  // ── Dark mode ────────────────────────────────────────────────────────────

  it('should render correctly in dark mode', async () => {
    await device.setStatusBar({ style: 'dark' });

    // Relaunch with dark appearance
    await device.launchApp({
      newInstance: true,
      launchArgs: { UIUserInterfaceStyle: 'dark' }, // iOS
    });

    await expect(element(by.id('section-title-config'))).toBeVisible();

    // Restore light mode
    await device.launchApp({ newInstance: true });
  });
});

// ── Multi-env switching ──────────────────────────────────────────────────────
//
// This describe block shows the pattern for testing env switching.
// In practice, you run detox with different builds:
//
//   Build 1: npx rnuc .env.staging  → detox build → detox test --config staging
//   Build 2: npx rnuc .env.prod     → detox build → detox test --config prod
//
// You can also use detox's `appLaunchArgs` to pass env-specific flags if
// your native code reads them, but for rnuc the switch happens at build time.
//
describe('Pattern: environment-specific assertions', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should show config values that match the built .env file', async () => {
    // This test is intentionally generic — the actual values depend on
    // which .env file you used when running `npx rnuc`.
    //
    // For a staging build (npx rnuc .env.staging where APP_ENV=staging):
    //   await expect(element(by.text('"APP_ENV":"staging"'))).toBeVisible();
    //
    // For a production build (npx rnuc .env.production where APP_ENV=production):
    //   await expect(element(by.text('"APP_ENV":"production"'))).toBeVisible();
    //
    // Generic assertion: the config section always renders
    await expect(element(by.id('section-config'))).toBeVisible();
  });
});
