const metadataKey = Symbol("CommandAlias");

export default function Alias(...names: AliasIn[]): (constructor: Function) => void {
  return function registerArgument(constructor: Function): void {
    let properties: Aliases[] = Reflect.getMetadata(metadataKey, constructor);

    if (properties) {
      properties.push(names.map((n) => regexTransform(n, true)));
    } else {
      properties = [names.map((n) => regexTransform(n, true))];
      Reflect.defineMetadata(metadataKey, properties, constructor);
    }
  };
}

export function Alias_DISABLE_TRANSFORM(...names: AliasIn[]): (constructor: Function) => void {
  return function registerArgument(constructor: Function): void {
    let properties: Aliases[] = Reflect.getMetadata(metadataKey, constructor);

    if (properties) {
      properties.push(names.map((n) => regexTransform(n, false)));
    } else {
      properties = [names.map((n) => regexTransform(n, false))];
      Reflect.defineMetadata(metadataKey, properties, constructor);
    }
  };
}

const regexTransform = (input: AliasIn, transform?: boolean) => {
  const stringified = typeof input === "string" ? input : input.source;
  if (transform) {
    return new RegExp("^" + stringified + "$", "i");
  }
  return new RegExp(stringified);
};

export function getAliases(origin: Function) {
  const properties: Aliases[] = Reflect.getMetadata(metadataKey, origin);
  return properties;
}

export type AliasIn = string | RegExp;
export type Aliases = RegExp[];

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

    if (commandFragment) {
      return this.aliases.some((alias) => alias.test(commandFragment));
    }
    return false;
  }
}
