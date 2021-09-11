//#region Name

import { SlashCommandLoaderException } from "../../errors/SlashCommandLoaderException";

const nameMetadataKey = Symbol("SlashNamed");

export const Named = (name: string): ((constructor: Function) => void) => {
  return (constructor: Function): void => {
    let properties = Reflect.getMetadata(nameMetadataKey, constructor);

    if (properties) {
      properties.push(name);
    } else {
      properties = [name];
      Reflect.defineMetadata(nameMetadataKey, properties, constructor);
    }
  };
};

export const getName = (origin: Function) => {
  const properties: string[] = Reflect.getMetadata(nameMetadataKey, origin);
  if (!properties?.[0]) {
    throw new SlashCommandLoaderException(
      `${origin.name} does not have the @Named() decorator, cannot load this slash command!`
    );
  }
  return properties[0];
};

// #endregion

//#region Description

const describedMetadataKey = Symbol("SlashDescribed");

export const Described = (description: string): ((constructor: Function) => void) => {
  return (constructor: Function): void => {
    let properties = Reflect.getMetadata(describedMetadataKey, constructor);

    if (properties) {
      properties.push(description);
    } else {
      properties = [description];
      Reflect.defineMetadata(describedMetadataKey, properties, constructor);
    }
  };
};

export const getDescription = (origin: Function) => {
  const properties: string[] = Reflect.getMetadata(nameMetadataKey, origin);
  if (!properties?.[0]) {
    throw new SlashCommandLoaderException(
      `${origin.name} does not have the @Described() decorator, cannot load this slash command!`
    );
  }
  return properties[0];
};

//#endregion

//#region Domain

const domainMetadataKey = Symbol("SlashDomain");

export const Domain = (...domains: string[]): ((constructor: Function) => void) => {
  return (constructor: Function): void => {
    let properties = Reflect.getMetadata(domainMetadataKey, constructor);

    if (properties) {
      properties.push(domains);
    } else {
      properties = [domains];
      Reflect.defineMetadata(domainMetadataKey, properties, constructor);
    }
  };
};

export const getDomain = (origin: Function) => {
  const properties: string[][] = Reflect.getMetadata(domainMetadataKey, origin);
  return properties?.[0] ?? "";
};

//#endregion

//#region Exports

export default { getDescription, getName, getDomain };

//#endregion
