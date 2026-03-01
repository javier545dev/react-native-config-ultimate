require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-config-ultimate"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-config-ultimate
                  A community-maintained fork of react-native-ultimate-config
                  by Max Komarychev. Adds New Architecture (TurboModules),
                  multi-env merging, dotenv expansion, schema validation,
                  and CLI watch mode.
                   DESC
  s.homepage     = "https://github.com/javier545dev/react-native-config-ultimate"
  s.license      = "MIT"
  s.authors      = { "Javier Fuentes" => "javierfuentes545@gmail.com" }
  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/javier545dev/react-native-config-ultimate.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm}"

  s.dependency "React-Core"

  # install_modules_dependencies handles all New Architecture dependencies automatically:
  # React-Codegen, RCT-Folly, RCTRequired, RCTTypeSafety, ReactCommon/turbomodule/core,
  # React-NativeModulesApple (provides RCTTurboModule.h), and sets compiler flags.
  # This is the canonical approach since RN 0.71.
  install_modules_dependencies(s)
end
