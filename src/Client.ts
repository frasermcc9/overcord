import { Client as BaseClient, ClientOptions } from "discord.js";
import { CommandRegistry } from "./commands/CommandRegistry";
import Dispatcher from "./commands/Dispatcher";

interface Options extends ClientOptions {
    defaultCommandPrefix: string;
    owners: string[];
}

export default class Client extends BaseClient {
    private readonly _registry = new CommandRegistry();
    private readonly _dispatcher = new Dispatcher(this, this.registry);

    constructor(options: Options) {
        super(options);
        options.defaultCommandPrefix ??= "!";

        this.on("message", this.dispatcher.handleRawMessage);
    }

    get registry() {
        return this._registry;
    }

    get dispatcher() {
        return this._dispatcher;
    }
}
