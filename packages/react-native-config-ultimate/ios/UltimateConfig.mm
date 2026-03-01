#import "UltimateConfig.h"
#import "ConfigValues.h"

@implementation UltimateConfig
RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

- (NSDictionary *)constantsToExport
{
    return getValues();
}

#ifdef RCT_NEW_ARCH_ENABLED
// New Architecture: TurboModule method exposed via Codegen-generated spec.
// getAll() returns all config values as a JSON-encoded string.
// Using string avoids Codegen limitations with dynamic/indexed object types.
- (NSString *)getAll
{
    NSDictionary *values = getValues();
    NSError *error = nil;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:values
                                                       options:0
                                                         error:&error];
    if (error || !jsonData) {
        return @"{}";
    }
    return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeUltimateConfigSpecJSI>(params);
}
#endif

@end
