import Log from "@frasermcc/log";
import { Message } from "discord.js";
import { resolve, sep } from "path";
import CommandInhibitor from "./inhibitor/CommandInhibitor";
import { getInhibitor } from "./inhibitor/Inhibit";
import { Aliases, AliasManager, getAliases } from "./alias/Alias";
import AbstractCommand from "./Command";
import Command from "./Command";
import { getOwnerOnly, getPermissions, PermissionManager } from "./permissions/Permit";
import DiscordEvent from "../events/BaseEvent";
import Client from "../client/Client";
const { readdir } = require("fs").promises;

export class CommandRegistry {
    /**
     * Command map containing the mapping from command names to the stateful
     * command object. Each alias has its own entry. Aliases of the same command
     * will point to the same StatefulCommand object.
     */
    private _commandMap = new Map<string, StatefulCommand>();
    private _eventMap = new Map<string, DiscordEvent<any>[]>();

    constructor(private readonly client: Client) {}

    async recursivelyRegisterCommands(dir: string) {
        this._commandMap = await this.getCommands(dir);
    }

    async recursivelyRegisterEvents(dir: string) {
        this._eventMap = await this.getEvents(dir);
    }

    executeCommand(args: { fragments: string[]; message: Message }) {
        const commandName = args.fragments[0].toLowerCase();
        const statefulCommand = this._commandMap.get(commandName);
        if (!statefulCommand) return;

        const group = statefulCommand.group;
        if (args.message.guild) {
            if (!this.client.guildSettingsManager.groupIsEnabled(args.message.guild, group)) {
                return;
            }
        }

        new statefulCommand.cmdConstructor().handle({
            ...args,
            inhibitor: statefulCommand.inhibitor,
            aliasManager: statefulCommand.aliases,
            permissionManager: statefulCommand.permissionManager,
            client: this.client,
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

    private async getCommands(directory: string): Promise<Map<string, StatefulCommand>> {
        const invalidFileFound = (file: string) =>
            Log.warn(`Found file ${file} in command directory that is not a command.`);

        const commandMap = new Map<string, StatefulCommand>();
        for await (const file of this.getFiles(directory)) {
            try {
                if (/^(?!.*(d)\.ts$).*\.(ts|js)$/.test(file[0]) !== true) {
                    //invalidFileFound(file[0]);
                    continue;
                }
                const root =
                    file[1]
                        .replace(directory, "")
                        .split(sep)
                        .filter((f) => !!f)[0] ?? "base";

                const required: CommandConstructor = require(file[0]).default;
                if (typeof required !== "function") {
                    invalidFileFound(file[0]);
                    continue;
                }

                const instance = new required();
                if (!(instance instanceof Command)) {
                    invalidFileFound(file[0]);
                    continue;
                }

                const [command, aliases] = this.parseMetadata(required, root);

                aliases?.forEach((alias) => {
                    alias = alias.toLowerCase();
                    commandMap.has(alias) &&
                        Log.critical(
                            `Multiple commands exist with alias ${alias}. Please ensure all commands are uniquely named.`
                        );
                    commandMap.set(alias, command);
                });
            } catch (e) {
                Log.error("Error when loading commands", "Command Registry", e);
            }
        }
        return commandMap;
    }

    private parseMetadata(required: CommandConstructor, root: string): [StatefulCommand, Aliases | undefined] {
        const inhibitorMetadata = getInhibitor(required);
        const aliasesMetadata = getAliases(required);
        const permissionMetadata = getPermissions(required);
        const ownerMetadata = getOwnerOnly(required);

        const inhibitor = inhibitorMetadata?.length > 0 ? inhibitorMetadata[0] : undefined;
        const aliases = aliasesMetadata?.length > 0 ? aliasesMetadata[0] : undefined;
        const permissions = permissionMetadata?.length > 0 ? permissionMetadata[0] : undefined;
        const ownerOnly = ownerMetadata?.length > 0 ? ownerMetadata[0] : undefined;

        return [
            {
                cmdConstructor: required,
                inhibitor: inhibitor ? new CommandInhibitor(inhibitor) : undefined,
                aliases: aliases ? new AliasManager(aliases) : undefined,
                permissionManager: permissions ? new PermissionManager(permissions, ownerOnly) : undefined,
                group: root,
            },
            aliases,
        ];
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

    get commandGroups() {
        return [...this._commandMap.keys()];
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
    group: string;
}

//TODO Create command group caching mechanism
