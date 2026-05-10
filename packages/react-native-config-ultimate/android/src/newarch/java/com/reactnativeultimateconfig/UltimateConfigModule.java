package com.reactnativeultimateconfig;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.annotations.ReactModule;

import org.json.JSONObject;

import java.util.Map;

/**
 * New Architecture (TurboModules) implementation of UltimateConfig.
 *
 * Extends the Codegen-generated NativeUltimateConfigSpec which provides
 * the TurboModule binding. Implements getAll() which returns config
 * values as a JSON string (matching the TypeScript spec).
 */
@ReactModule(name = UltimateConfigModule.NAME)
public class UltimateConfigModule extends NativeUltimateConfigSpec {
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

  /**
   * TurboModule method: returns all config values as a JSON string.
   * This matches the TypeScript spec: getAll(): string
   */
  @Override
  @NonNull
  public String getAll() {
    Map<String, Object> values = UltimateConfigHelper.readConfigValues();
    try {
      JSONObject json = new JSONObject(values);
      return json.toString();
    } catch (Exception e) {
      Log.w(NAME, "Failed to serialize config to JSON: " + e.getMessage());
      return "{}";
    }
  }
}
