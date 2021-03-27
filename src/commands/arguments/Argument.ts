import "reflect-metadata";
import ArgumentType from "../../types/base";
import Log from "@frasermcc/log";
import { Message } from "discord.js";
import { join } from "path";
import InfiniteType from "../../types/infinite";
import { StringType } from "../../types";

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
    ...givenArgs: string[]
): Promise<[string, string] | undefined> {
    const expectedArgs: CommandArgumentMetadata<any>[] | undefined = Reflect.getMetadata(metadataKey, origin);

    if (!expectedArgs) return;

    // if (givenArgs.length < expectedArgs.length) {const argHelp =
    //     expectedArgs.map((v) => ` - ${v.name}:
    //     ${v.settings.type?.id}`).join("\n "); return `Incorrect usage.
    //     Correct usage:\n(command)\n${argHelp}`;
    // }

    for (let index = 0; index < expectedArgs?.length ?? 0; index++) {
        const key = expectedArgs[index];
        const newProp = givenArgs[index];

        if (!newProp && key.settings.default) {
            origin[key.name] = key.settings.default(message);
            continue;
        }

        if (!newProp && key.settings.optional) {
            origin[key.name] = undefined;
            continue;
        }

        if (key.settings.infinite) {
            let j = index;
            let values: string[] = [];
            let newPropTemp = newProp;
            while (newPropTemp) {
                values.push(newPropTemp);
                j++;
                newPropTemp = givenArgs[j];
            }

            for (const givenArg of values) {
                try {
                    if (!((await key.settings.type?.validate(givenArg, message)) ?? true)) {
                        return generateHelp(
                            `Cannot use '${givenArg}' as a ${key.settings.type?.id} type`,
                            expectedArgs
                        );
                    }
                    if (key.settings.validate && !key.settings.validate(givenArg)) {
                        return generateHelp(
                            `Cannot use '${givenArg}' as it fails the validation ${key.settings.validate}`,
                            expectedArgs
                        );
                    }
                } catch {
                    return generateHelp(
                        `Cannot use '${givenArg}' as it fails the validation ${key.settings.validate}`,
                        expectedArgs
                    );
                }
            }
            const parser = new InfiniteType(key.settings.type ?? new StringType());
            const parsed = await parser.arrayParser(values, message);
            origin[key.name] = parsed;
            break;
        }

        if (!((await key.settings.type?.validate(newProp, message)) ?? true)) {
            return generateHelp(`Cannot use '${newProp}' as a ${key.settings.type?.id} type`, expectedArgs);
        }

        try {
            if (key.settings.validate && !key.settings.validate(newProp)) {
                return generateHelp(
                    `Cannot use '${newProp}' as it fails the validation ${key.settings.validate}`,
                    expectedArgs
                );
            }
        } catch {
            return generateHelp(
                `Cannot use '${newProp}' as it fails the validation ${key.settings.validate}`,
                expectedArgs
            );
        }

        const parsed = await key.settings.type?.parse(newProp, message);
        origin[key.name] = parsed;
    }
    return;
}

const generateHelp = (specificProblem: string, expectedArgs: CommandArgumentMetadata<any>[]): [string, string] => {
    const argHelp = expectedArgs.map((v) => ` - ${v.name}: ${v.settings.type?.id}`).join("\n");
    return [`(command)\n${argHelp}`, `Your error: ${specificProblem}`];
};

interface CommandArgumentMetadata<T> {
    name: string;
    settings: ArgumentArgs<T>;
}

interface ArgumentArgs<T> {
    type?: ArgumentType<T>;
    validate?: (s: T) => boolean;
    default?: (m: Message) => T;
    optional?: boolean;
    infinite?: boolean;
}
