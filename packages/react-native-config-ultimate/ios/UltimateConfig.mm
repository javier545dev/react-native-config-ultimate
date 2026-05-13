#import "UltimateConfig.h"
#import "ConfigValues.h"
#import <React/RCTLog.h>

// Mirror Android's runtime warning: if getValues() is empty, the consumer
// either skipped `npx rncu <env-file>` before building, or generated the
// header with an empty source. Without this warning the JS side just sees
// Config.MY_VAR === undefined with no clue why. Fire once per process so
// it doesn't spam the log on every getAll() call.
static NSDictionary *getValuesChecked()
{
    static dispatch_once_t onceToken;
    static NSDictionary *cached = nil;
    dispatch_once(&onceToken, ^{
        cached = getValues();
        if (cached.count == 0) {
            RCTLogWarn(@"[UltimateConfig] No config values found. Did you run "
                       @"`npx rncu <env-file>` and rebuild the iOS app? "
                       @"Required on both Old and New Architecture.");
        }
    });
    return cached;
}

@implementation UltimateConfig
RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

- (NSDictionary *)constantsToExport
{
    return getValuesChecked();
}

#ifdef RCT_NEW_ARCH_ENABLED
// New Architecture: TurboModule method exposed via Codegen-generated spec.
// getAll() returns all config values as a JSON-encoded string.
// Using string avoids Codegen limitations with dynamic/indexed object types.
- (NSString *)getAll
{
    NSDictionary *values = getValuesChecked();
    NSError *error = nil;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:values
                                                       options:0
                                                         error:&error];
    if (error || !jsonData) {
        return @"{}";
    }
    NSString *result = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    return result ?: @"{}";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeUltimateConfigSpecJSI>(params);
}
#endif

@end
