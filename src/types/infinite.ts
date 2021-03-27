import { Message } from "discord.js";
import ArgumentType from "./base";

export default class InfiniteType<T> extends ArgumentType<T[]> {
    private _type: ArgumentType<T>;

    constructor(argType: ArgumentType<T>) {
        super();
        this._type = argType;
    }

    get id(): string {
        return "InfiniteType";
    }

    async validate(val: string, msg: Message) {
        const args = val.split(" ");
        for (const arg of args) {
            if (!(await this._type.validate(arg, msg))) {
                return false;
            }
        }
        return true;
    }

    async parse(val: string, msg: Message) {
        const args = val.split(" ");
        const returnArgs: T[] = [];
        for (const arg of args) {
            const parsed = await this._type.parse(arg, msg);
            if (parsed == undefined) continue;
            returnArgs.push(parsed);
        }
        return returnArgs;
    }

    async arrayParser(args: string[], msg: Message) {
        const returnArgs: T[] = [];
        for (const arg of args) {
            const parsed = await this._type.parse(arg, msg);
            if (parsed == undefined) continue;
            returnArgs.push(parsed);
        }
        return returnArgs;
    }
}
