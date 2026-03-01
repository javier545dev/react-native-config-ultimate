/**
 * TurboModule spec for react-native-ultimate-config
 * This file is read by React Native Codegen to generate native bindings.
 * Do not rename or move this file - Codegen relies on the "Native" prefix.
 */
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export type ConfigValue = string | number | boolean;

export interface Spec extends TurboModule {
  readonly getConstants: () => Record<string, ConfigValue>;
}

export default TurboModuleRegistry.get<Spec>('UltimateConfig');
