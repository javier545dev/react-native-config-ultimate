package com.reactnativeultimateconfig;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

/**
 * React Native package for UltimateConfig.
 *
 * Extends TurboReactPackage to support both the Old Architecture (Bridge)
 * and the New Architecture (TurboModules / JSI). When IS_NEW_ARCHITECTURE_ENABLED
 * is true the module is registered as a TurboModule; otherwise it runs as a
 * classic bridge module.
 */
public class UltimateConfigPackage extends TurboReactPackage {

  @Nullable
  @Override
  public NativeModule getModule(@NonNull String name, @NonNull ReactApplicationContext reactContext) {
    if (UltimateConfigModule.NAME.equals(name)) {
      return new UltimateConfigModule(reactContext);
    }
    return null;
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
      boolean isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      moduleInfos.put(
        UltimateConfigModule.NAME,
        new ReactModuleInfo(
          UltimateConfigModule.NAME,
          UltimateConfigModule.NAME,
          false,  // canOverrideExistingModule
          false,  // needsEagerInit
          isTurboModule,  // isCxxModule — true for TurboModules
          isTurboModule   // isTurboModule
        )
      );
      return moduleInfos;
    };
  }
}
