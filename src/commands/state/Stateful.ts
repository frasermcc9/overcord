import "reflect-metadata";

const metadataKey = Symbol("StatefulMetadata");

type Decorated = (target: { [k: string]: any }, propertyKey: string) => void;

interface StatefulData<S> extends StatefulArgs<S> {
  name: string;
  state: S;
}

interface StatefulArgs<S> {
  initialState: S;
  onUpdate?: (value: S, id?: string) => void;
  domain?: "GLOBAL" | "GUILD" | "USER";
}

interface SetStateRequired {
  author: {
    id: string;
  };
  guild: {
    id: string;
  } | null;
}

export type State<S> = [() => S, (value: S) => void];

export default function Stateful<S>({ initialState, domain, onUpdate }: StatefulArgs<S>): Decorated {
  return function registerState(target, propertyKey: string): void {
    let properties: StatefulData<S>[] = Reflect.getMetadata(metadataKey, target);
    domain ??= "GLOBAL";

    if (domain === "GLOBAL") {
      //@ts-ignore
      target.constructor.stateContainer = { [propertyKey]: initialState };
    } else {
      //@ts-ignore
      target.constructor.stateContainer = { [propertyKey]: {} };
    }

    if (properties) {
      properties.push({ name: propertyKey, onUpdate, domain, initialState, state: initialState });
    } else {
      properties = [{ name: propertyKey, onUpdate, domain, initialState, state: initialState }];
      Reflect.defineMetadata(metadataKey, properties, target);
    }
  };
}

export function getStatefulFields(origin: { [k: string]: any }): object {
  const properties: StatefulData<any>[] = Reflect.getMetadata(metadataKey, origin);
  const result: { [k: string]: any } = {};

  for (const key of properties) {
    if (Object.prototype.hasOwnProperty.call(origin, key.name)) {
      result[key.name] = origin[key.name];
    }
  }

  return result;
}

export async function setState(origin: { [k: string]: any }, data: SetStateRequired) {
  const properties: StatefulData<any>[] = Reflect.getMetadata(metadataKey, origin);
  if (!properties) return;

  for (const statefulField of properties) {
    const setState = (newValue: any) => {
      const { domain, onUpdate } = statefulField;
      let id;
      //@ts-ignore
      let container = origin.constructor.stateContainer[statefulField.name];
      if (domain === "GLOBAL") {
        container = newValue;
      } else if (domain === "GUILD") {
        container[data.guild?.id ?? data.author.id] = newValue;
        id = data.guild?.id ?? data.author.id;
      } else if (domain === "USER") {
        container[data.author.id] = newValue;
        id = data.author.id;
      }

      if (onUpdate) {
        onUpdate(newValue, id);
      }
    };
    //@ts-ignore
    const getState = () => {
      const { domain, initialState } = statefulField;
      //@ts-ignore
      let container = origin.constructor.stateContainer[statefulField.name];
      if (domain === "GLOBAL") {
        return container;
      } else if (domain === "GUILD") {
        return container[data.guild?.id ?? data.author.id] ?? initialState;
      } else if (domain === "USER") {
        return container[data.author.id] ?? initialState;
      }
    };

    origin[statefulField.name] = [getState, setState];
  }
}
