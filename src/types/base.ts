import { Message } from "discord.js";

/** A type for command arguments */
export default abstract class ArgumentType<T> {
    abstract get id(): string;

    validate(val: string, msg: Message): Promise<boolean> | boolean {
        throw new Error(`${this.constructor.name} doesn't have a validate() method.`);
    }

    parse(val: string, msg: Message): T | null | undefined {
        throw new Error(`${this.constructor.name} doesn't have a parse() method.`);
    }
}
