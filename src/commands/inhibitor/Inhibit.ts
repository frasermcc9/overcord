const metadataKey = Symbol("CommandInhibitor");

export default function Inhibit(settings: InhibitionSettings): (constructor: Function) => void {
    return function registerArgument(constructor: Function): void {
        let properties: InhibitionSettings[] = Reflect.getMetadata(metadataKey, constructor);

        settings.limitBy ??= "USER";

        if (properties) {
            properties.push(settings);
        } else {
            properties = [settings];
            Reflect.defineMetadata(metadataKey, properties, constructor);
        }
    };
}

export function getInhibitor(origin: Function) {
    const properties: InhibitionSettings[] = Reflect.getMetadata(metadataKey, origin);
    return properties;
}

export interface InhibitionSettings {
    /** What construct the limiter will apply to. For example, "GUILD" means
     *  the command will be limited at a guild level.
     *  @default "USER"
     */
    limitBy?: "USER" | "CHANNEL" | "GUILD";
    /** The number of times the command can be used per `periodDuration`
     *  seconds.
     *  @default 1
     */
    maxUsesPerPeriod?: number;
    /** The number of seconds after using a command in which the inhibitor will
     *  reset its count. For example, with `maxUsesPerPeriod: 2, periodDuration:
     *  10`, then each use will add to a counter. 10s after execution, the
     *  counter will be reduced by 1. Should a command execution increase the
     *  counter above 2, then it will be inhibited.
     *  @default 5
     */
    periodDuration?: number;
}
