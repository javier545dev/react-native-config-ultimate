/**
 * TurboModule spec for react-native-config-ultimate
 * This file is read by React Native Codegen to generate native bindings.
 * Do not rename or move this file - Codegen relies on the "Native" prefix.
 *
 * NOTE: We use getAll(): string instead of getConstants(): {} because:
 * - Codegen requires getConstants() to have a concrete return type with named fields
 * - Config keys are dynamic (generated from .env at build time), so a fixed type is impossible
 * - getAll() returns all config values as a JSON-encoded string, which Codegen handles perfectly
 * - This gives us a working TurboModule binding for New Architecture
 */
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Returns all config values as a JSON-encoded string.
  // Using string avoids Codegen limitations with dynamic/indexed object types.
  readonly getAll: () => string;
}

export default TurboModuleRegistry.get<Spec>('UltimateConfig');
