import { Client as BaseClient, ClientOptions, Guild } from "discord.js";
import { CommandRegistry } from "./commands/CommandRegistry";
import Dispatcher from "./commands/Dispatcher";

interface Options extends ClientOptions {
    defaultCommandPrefix: string;
    owners: string[];
}

export default class Client extends BaseClient {
    private readonly _registry;
    private readonly _dispatcher;

    private readonly _defaultPrefix;
    private readonly _prefixMap = new Map<string, string>();

    constructor(options: Options) {
        super(options);

        this._registry = new CommandRegistry(this);
        this._dispatcher = new Dispatcher(this, this.registry);

        options.defaultCommandPrefix ??= "!";
        this._defaultPrefix = options.defaultCommandPrefix;

        this.on("message", (m) => this.dispatcher.handleRawMessage(m));
    }

    getPrefixForGuild(guild: Guild | null): string {
        if (!guild) return this.prefix;
        return this._prefixMap.get(guild.id) ?? this.prefix;
    }

    setPrefixForGuild(guild: Guild, prefix: string): void {
        this._prefixMap.set(guild.id, prefix);
    }

    get registry() {
        return this._registry;
    }

    get dispatcher() {
        return this._dispatcher;
    }

    get prefix() {
        return this._defaultPrefix;
    }
}
