import Log from "@frasermcc/log";
import { Client as BaseClient, ClientOptions, Guild } from "discord.js";
import { CommandRegistry } from "../commands/CommandRegistry";
import Dispatcher from "../commands/Dispatcher";
import { Logger } from "../util/LoggingMixin";
import GuildSettingsManager from "./GuildSettings";

interface Options extends ClientOptions {
    defaultCommandPrefix: string;
    owners: string[];
    loggingMixin?: Logger;
}

export default class Client extends BaseClient {
    private readonly _registry;
    private readonly _dispatcher;

    private readonly _guildSettings;
    private readonly _owners: Set<string>;

    private readonly _loggingMixin;

    constructor(options: Options) {
        super(options);
        this._owners = new Set(options.owners);
        this._registry = new CommandRegistry(this);
        this._dispatcher = new Dispatcher(this, this.registry);
        this._guildSettings = new GuildSettingsManager(options.defaultCommandPrefix ?? "!");
        this._loggingMixin = options.loggingMixin;

        this.on("message", (m) => this.dispatcher.handleRawMessage(m));
    }

    isOwner(id: string) {
        return this._owners.has(id);
    }

    get guildSettingsManager() {
        return this._guildSettings;
    }

    get registry() {
        return this._registry;
    }

    get dispatcher() {
        return this._dispatcher;
    }

    get logger() {
        return this._loggingMixin;
    }

    /**
     * @deprecated
     */
    get prefix() {
        Log.error(
            "Accessing prefixes inside client is deprecated. Please access it from guildSettingsManager inside client."
        );
        return this.guildSettingsManager.prefix;
    }

    /**
     * @deprecated
     * @param guild
     */
    getPrefixForGuild(guild: Guild | null): string {
        Log.error(
            "Accessing guild prefixes inside client is deprecated. Please access it from guildSettingsManager inside client."
        );
        if (!guild) return this.prefix;
        return this.guildSettingsManager.getPrefixForGuild(guild);
    }

    /**
     * @deprecated
     * @param guild
     * @param prefix
     */
    setPrefixForGuild(guild: Guild, prefix: string): void {
        Log.error(
            "Setting guild prefixes inside client is deprecated. Please access it from guildSettingsManager inside client."
        );
        this.guildSettingsManager.setPrefixForGuild(guild, prefix);
    }
}
