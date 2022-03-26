const metadataKey = Symbol("GuildOnlyKey");

export function GuildOnly(): (constructor: Function) => void {
    return function registerOwnerOnly(constructor: Function): void {
        let properties: boolean[] = Reflect.getMetadata(metadataKey, constructor);

        if (properties) {
            properties.push(true);
        } else {
            properties = [true];
            Reflect.defineMetadata(metadataKey, properties, constructor);
        }
    };
}
