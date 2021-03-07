import Log from "@frasermcc/log";
import { Message } from "discord.js";
import { resolve, sep } from "path";
import CommandInhibitor from "./inhibitor/CommandInhibitor";
import { getInhibitor } from "./inhibitor/Inhibit";
import { AliasManager, getAliases } from "./alias/Alias";
import AbstractCommand from "./Command";
import Command from "./Command";
import { getPermissions, PermissionManager } from "./permissions/Permit";
import DiscordEvent from "../events/BaseEvent";
import Client from "../Client";
const { readdir } = require("fs").promises;

export class CommandRegistry {
    private _commandMap = new Map<string, StatefulCommand[]>();
    private _eventMap = new Map<string, DiscordEvent<any>[]>();

    constructor(private readonly client: Client) {}

    async recursivelyRegisterCommands(dir: string) {
        this._commandMap = await this.getCommands(dir);
    }

    async recursivelyRegisterEvents(dir: string) {
        this._eventMap = await this.getEvents(dir);
    }

    executeCommand(args: { fragments: string[]; message: Message }) {
        this.commandMap.forEach((group) => {
            for (const command of group) {
                const cmd = new command.cmdConstructor().handle({
                    ...args,
                    inhibitor: command.inhibitor,
                    aliasManager: command.aliases,
                    permissionManager: command.permissionManager,
                });
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
                        const inhibitorMetadata = getInhibitor(required);
                        const aliasesMetadata = getAliases(required);
                        const permissionMetadata = getPermissions(required);

                        const inhibitor = inhibitorMetadata?.length > 0 ? inhibitorMetadata[0] : undefined;
                        const aliases = aliasesMetadata?.length > 0 ? aliasesMetadata[0] : undefined;
                        const permissions = permissionMetadata?.length > 0 ? permissionMetadata[0] : undefined;

                        commandMap.get(root)?.push({
                            cmdConstructor: required,
                            inhibitor: inhibitor ? new CommandInhibitor(inhibitor) : undefined,
                            aliases: aliases ? new AliasManager(aliases) : undefined,
                            permissionManager: permissions ? new PermissionManager(permissions) : undefined,
                        });
                    }
                }
            } catch (e) {
                console.log(`Error: ${e}`);
            }
        }
        return commandMap;
    }

    private async getEvents(directory: string): Promise<Map<string, DiscordEvent<any>[]>> {
        const eventMap = new Map<string, DiscordEvent<any>[]>();
        for await (const file of this.getFiles(directory)) {
            try {
                if (/^(?!.*(d)\.ts$).*\.(ts|js)$/.test(file[0])) {
                    const root =
                        file[1]
                            .replace(directory, "")
                            .split(sep)
                            .filter((f) => !!f)[0] ?? "base";

                    const required: DiscordEvent<any> = require(file[0]).default;
                    if (typeof required === "object" && required.callback && required.firesOn) {
                        // add the constructor to the map
                        if (eventMap.get(root) === undefined) {
                            eventMap.set(root, []);
                        }
                        this.client.on(required.firesOn, required.callback);
                        eventMap.get(root)?.push(required);
                    }
                }
            } catch (e) {
                console.log(`Error: ${e}`);
            }
        }
        return eventMap;
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
    inhibitor?: CommandInhibitor;
    aliases?: AliasManager;
    permissionManager?: PermissionManager;
}
