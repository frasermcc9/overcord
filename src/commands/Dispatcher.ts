import { Message } from "discord.js";
import Client from "../Client";
import { CommandRegistry } from "./CommandRegistry";

export default class Dispatcher {
    private client: Client;
    private registry: CommandRegistry;

    constructor(client: Client, registry: CommandRegistry) {
        this.client = client;
        this.registry = registry;
    }

    handleRawMessage(message: Message) {
        const content = message.content.trim();
        const prefix = this.client.getPrefixForGuild(message.guild);
        if (!content.startsWith(prefix)) {
            return;
        }
        const cleanContent = content.replace(prefix, "");
        const fragments = cleanContent.split(/\s+/);
        this.registry.executeCommand({ fragments, message });
    }
}
