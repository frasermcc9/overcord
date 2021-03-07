import { Message } from "discord.js";

/** A type for command arguments */
export default abstract class ArgumentType<T> {
    abstract get id(): string;

    abstract validate(val: string, msg: Message): Promise<boolean> | boolean;

    abstract parse(val: string, msg: Message): Promise<T> | T | null | undefined;
}
