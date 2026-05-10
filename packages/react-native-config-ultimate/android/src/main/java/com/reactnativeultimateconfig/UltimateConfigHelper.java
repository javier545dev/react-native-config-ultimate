package com.reactnativeultimateconfig;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.HashMap;
import java.util.Map;

/**
 * Shared helper for reading config values from the app's BuildConfig class.
 * Used by both Old Architecture (Bridge) and New Architecture (TurboModules)
 * implementations to avoid code duplication.
 */
final class UltimateConfigHelper {
  private static final String TAG = "UltimateConfig";

  @Nullable
  private static Class<?> _buildConfig;

  static void setBuildConfig(Class<?> buildConfig) {
    _buildConfig = buildConfig;
  }

  @Nullable
  static Class<?> getBuildConfig() {
    return _buildConfig;
  }

  /**
   * Read config values from the app's BuildConfig class.
   * The rncu CLI generates fields in BuildConfig via rncu.yaml → build.gradle.
   */
  @NonNull
  static Map<String, Object> readConfigValues() {
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
            Log.e(TAG, msg);
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
      Log.w(TAG, "Failed to read config constants from BuildConfig: " + e.getMessage());
    }
    return constants;
  }

  private UltimateConfigHelper() {} // prevent instantiation
}
