import Log from "@frasermcc/log";

const metadataKey = Symbol("CommandPathArgument");

export default function PathArgument<T>(
  unmarshal?: (s: string) => T
): (target: { [k: string]: any }, propertyKey: string) => void {
  return function registerPathArgument(target: object, propertyKey: string): void {
    let properties: PathArgumentMetadata<T>[] = Reflect.getMetadata(metadataKey, target);

    if (unmarshal === undefined) {
      //@ts-ignore
      unmarshal = (s: string) => s;
    }

    if (properties) {
      properties.push({ converter: unmarshal!, name: propertyKey });
    } else {
      properties = [{ converter: unmarshal!, name: propertyKey }];
      Reflect.defineMetadata(metadataKey, properties, target);
    }
  };
}

export async function setPathArgs(
  origin: { [k: string]: any },
  givenCommandName: string,
  regex: RegExp
): Promise<void> {
  const expectedArgs: PathArgumentMetadata<any>[] | undefined = Reflect.getMetadata(metadataKey, origin);

  const groups = givenCommandName.match(regex)?.groups;
  for (const match in groups) {
    const val = groups[match];

    const argument = expectedArgs?.find((a) => a.name === match);
    if (!argument) {
      Log.error(`No path argument found for ${match}`);
      continue;
    }
    const typedVal = argument?.converter(val);

    origin[argument.name] = typedVal;
  }
}

interface PathArgumentMetadata<T> {
  name: string;
  converter: (s: string) => T;
}
