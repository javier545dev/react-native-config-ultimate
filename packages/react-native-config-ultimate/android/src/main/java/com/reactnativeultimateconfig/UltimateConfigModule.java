package com.reactnativeultimateconfig;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.module.annotations.ReactModule;

import java.util.HashMap;
import java.util.Map;

@ReactModule(name = UltimateConfigModule.NAME)
public class UltimateConfigModule extends ReactContextBaseJavaModule {
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

  @Override
  @NonNull
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    try {
      Class<?> act = _buildConfig;
      if (act == null) return constants;
      String keys = (String) act.getField("__RNUC_KEYS").get(act);
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
}
