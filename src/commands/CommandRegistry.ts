import Log from "@frasermcc/log";
import { Message } from "discord.js";
import { resolve, sep } from "path";
import CommandInhibitor from "../inhibitor/CommandInhibitor";
import { getInhibitor } from "../inhibitor/Inhibit";
import AbstractCommand from "./Command";
import Command from "./Command";
const { readdir } = require("fs").promises;

export class CommandRegistry {
    private _commandMap = new Map<string, StatefulCommand[]>();

    constructor() {}

    async recursivelyRegisterCommands(dir: string) {
        this._commandMap = await this.getCommands(dir);
    }

    async recursivelyRegisterEvents(dir: string) {}

    executeCommand(args: { fragments: string[]; message: Message }) {
        this.commandMap.forEach((group) => {
            for (const command of group) {
                const shouldInhibit = command.inhibitor.commandShouldInhibit(args.message);
                if (shouldInhibit) return Log.warn("Inhibiting command...");
                const cmd = new command.cmdConstructor().handle(args);
            }
        });
    }

    private async *getFiles(dir: string): AsyncGenerator<[string, string], any, void> {
        const dirents = await readdir(dir, { withFileTypes: true });
        for (const dirent of dirents) {
            const res = resolve(dir, dirent.name);
            if (dirent.isDirectory()) {
                yield* this.getFiles(res);
            } else {
                yield [res, dir];
            }
        }
    }

    private async getCommands(directory: string): Promise<Map<string, StatefulCommand[]>> {
        const commandMap = new Map<string, StatefulCommand[]>();
        for await (const file of this.getFiles(directory)) {
            try {
                if (/^(?!.*(d)\.ts$).*\.(ts|js)$/.test(file[0])) {
                    const root =
                        file[1]
                            .replace(directory, "")
                            .split(sep)
                            .filter((f) => !!f)[0] ?? "base";

                    const required: CommandConstructor = require(file[0]).default;
                    if (typeof required === "function") {
                        // check if object is a command when constructed
                        const instance = new required();
                        if (!(instance instanceof Command)) {
                            continue;
                        }
                        // add the constructor to the map
                        if (commandMap.get(root) === undefined) {
                            commandMap.set(root, []);
                        }
                        const inhibitor = getInhibitor(required)[0];
                        commandMap.get(root)?.push({ cmdConstructor: required, inhibitor: new CommandInhibitor(inhibitor) });
                    }
                }
            } catch (e) {
                console.log(`Error: ${e}`);
            }
        }
        return commandMap;
    }

    get commandMap() {
        return this._commandMap;
    }
}

interface CommandConstructor {
    new (): AbstractCommand;
}

interface StatefulCommand {
    cmdConstructor: CommandConstructor;
    inhibitor: CommandInhibitor;
}