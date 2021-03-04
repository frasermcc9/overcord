import "reflect-metadata";
import ArgumentType from "../types/base";
import Log from "@frasermcc/log";

const metadataKey = Symbol("CommandArgument");

export default function Argument<T>(settings?: ArgumentArgs<T>): (target: { [k: string]: any }, propertyKey: string) => void {
    return function registerArgument(target: object, propertyKey: string): void {
        let properties: CommandArgumentMetadata<T>[] = Reflect.getMetadata(metadataKey, target);

        if (properties) {
            properties.push({ name: propertyKey, settings: settings ?? {} });
        } else {
            properties = [{ name: propertyKey, settings: settings ?? {} }];
            Reflect.defineMetadata(metadataKey, properties, target);
        }
    };
}

export function getArguments(origin: { [k: string]: any }): object {
    const properties: CommandArgumentMetadata<any>[] = Reflect.getMetadata(metadataKey, origin);
    const result: { [k: string]: any } = {};

    for (const key of properties) {
        if (Object.prototype.hasOwnProperty.call(origin, key.name)) {
            result[key.name] = origin[key.name];
        }
    }

    return result;
}

export function clearArguments(origin: { [k: string]: any }): void {
    const properties: CommandArgumentMetadata<any>[] = Reflect.getMetadata(metadataKey, origin);
    for (const key of properties) {
        if (Object.prototype.hasOwnProperty.call(origin, key.name)) {
            origin[key.name] = undefined;
        }
    }
}

export function setArguments(origin: { [k: string]: any }, ...props: string[]): string | undefined {
    const properties: CommandArgumentMetadata<any>[] = Reflect.getMetadata(metadataKey, origin);
    for (let index = 0; index < properties.length; index++) {
        const key = properties[index];
        const newProp = props[index];

        if (!(key.settings.type?.validate(newProp) ?? true)) {
            return `Cannot use '${newProp}' as a ${key.settings.type?.id} type.`;
        }

        if (key.settings.validate && !key.settings.validate(newProp)) {
            return `Cannot use '${newProp}' as it fails the validation ${key.settings.validate}.`;
        }

        const parsed = key.settings.type?.parse(newProp);
        origin[key.name] = parsed;
    }
    return;
}

interface CommandArgumentMetadata<T> {
    name: string;
    settings: ArgumentArgs<T>;
}

interface ArgumentArgs<T> {
    type?: ArgumentType<T>;
    validate?: (s: T) => boolean;
}
