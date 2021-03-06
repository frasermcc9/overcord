import "reflect-metadata";
import ArgumentType from "../../types/base";
import Log from "@frasermcc/log";
import { Message } from "discord.js";

const metadataKey = Symbol("CommandArgument");

export default function Argument<T>(
    settings?: ArgumentArgs<T>
): (target: { [k: string]: any }, propertyKey: string) => void {
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
    if (!properties) return;

    for (const key of properties) {
        if (Object.prototype.hasOwnProperty.call(origin, key.name)) {
            origin[key.name] = undefined;
        }
    }
}

export async function setArguments(
    origin: { [k: string]: any },
    message: Message,
    ...props: string[]
): Promise<string | undefined> {
    const properties: CommandArgumentMetadata<any>[] = Reflect.getMetadata(metadataKey, origin);
    for (let index = 0; index < properties?.length ?? 0; index++) {
        const key = properties[index];
        const newProp = props[index];

        if (!((await key.settings.type?.validate(newProp, message)) ?? true)) {
            return `Cannot use '${newProp}' as a ${key.settings.type?.id} type.`;
        }

        if (key.settings.validate && !key.settings.validate(newProp)) {
            return `Cannot use '${newProp}' as it fails the validation ${key.settings.validate}.`;
        }

        const parsed = key.settings.type?.parse(newProp, message);
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
