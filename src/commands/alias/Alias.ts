const metadataKey = Symbol("CommandAlias");

export default function Alias(...names: Aliases): (constructor: Function) => void {
    return function registerArgument(constructor: Function): void {
        let properties: Aliases[] = Reflect.getMetadata(metadataKey, constructor);

        if (properties) {
            properties.push(names);
        } else {
            properties = [names];
            Reflect.defineMetadata(metadataKey, properties, constructor);
        }
    };
}

export function getAliases(origin: Function) {
    const properties: Aliases[] = Reflect.getMetadata(metadataKey, origin);
    return properties;
}

type Aliases = string[];

export class AliasManager {
    constructor(private readonly _aliases?: Aliases) {}

    get aliases() {
        return this._aliases;
    }

    private useAliasManager(): boolean {
        return this.aliases != undefined;
    }

    commandShouldInvoke(commandFragment?: string): boolean {
        if (this.aliases == undefined) return false;
        if (commandFragment) return this.aliases.includes(commandFragment);
        return false;
    }
}
