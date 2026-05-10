package com.reactnativeultimateconfig;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.module.annotations.ReactModule;

import java.util.Map;

/**
 * Old Architecture (Bridge) implementation of UltimateConfig.
 *
 * This module exposes config values via getConstants() which React Native's
 * bridge reads at module initialization time.
 */
@ReactModule(name = UltimateConfigModule.NAME)
public class UltimateConfigModule extends ReactContextBaseJavaModule {
  public static final String NAME = "UltimateConfig";

  public static void setBuildConfig(Class<?> buildConfig) {
    UltimateConfigHelper.setBuildConfig(buildConfig);
  }

  public UltimateConfigModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @Override
  @NonNull
  public Map<String, Object> getConstants() {
    return UltimateConfigHelper.readConfigValues();
  }
}
