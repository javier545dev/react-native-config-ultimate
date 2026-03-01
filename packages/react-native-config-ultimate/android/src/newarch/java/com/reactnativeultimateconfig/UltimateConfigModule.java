package com.reactnativeultimateconfig;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.annotations.ReactModule;

import org.json.JSONObject;

import java.util.HashMap;
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

  @Nullable
  private static Class<?> _buildConfig;

  public static void setBuildConfig(Class<?> buildConfig) {
    _buildConfig = buildConfig;
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
   * Read config values from the app's BuildConfig class.
   * The rncu CLI generates fields in BuildConfig via rncu.yaml → build.gradle.
   */
  @NonNull
  private Map<String, Object> readConfigValues() {
    final Map<String, Object> constants = new HashMap<>();
    try {
      Class<?> act = _buildConfig;
      if (act == null) return constants;
      
      // Try both key names for backwards compatibility
      String keys = null;
      try {
        keys = (String) act.getField("__RNCU_KEYS").get(act);
      } catch (NoSuchFieldException e1) {
        try {
          keys = (String) act.getField("__RNUC_KEYS").get(act);
        } catch (NoSuchFieldException e2) {
          String msg = "react-native-config-ultimate: Neither __RNCU_KEYS nor __RNUC_KEYS found in BuildConfig. " +
                       "Did you run 'npx rncu <env-file>' and rebuild?";
          if (BuildConfig.DEBUG) {
            throw new RuntimeException(msg);
          } else {
            Log.e(NAME, msg);
          }
        }
      }
      
      if (keys == null || keys.isEmpty()) return constants;
      for (String k : keys.split(",")) {
        Object value = act.getField(k).get(act);
        if (value != null) {
          constants.put(k, value);
        }
      }
    } catch (Exception e) {
      Log.w(NAME, "Failed to read config constants from BuildConfig: " + e.getMessage());
    }
    return constants;
  }

  /**
   * TurboModule method: returns all config values as a JSON string.
   * This matches the TypeScript spec: getAll(): string
   */
  @Override
  @NonNull
  public String getAll() {
    Map<String, Object> values = readConfigValues();
    try {
      JSONObject json = new JSONObject(values);
      return json.toString();
    } catch (Exception e) {
      Log.w(NAME, "Failed to serialize config to JSON: " + e.getMessage());
      return "{}";
    }
  }
}
