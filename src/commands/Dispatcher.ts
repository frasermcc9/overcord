import { Message } from "discord.js";
import Client from "../client/Client";
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
        const prefix = this.client.guildSettingsManager.getPrefixForGuild(message.guild);
        if (!content.startsWith(prefix)) {
            return;
        }
        const cleanContent = content.replace(prefix, "");
        const cleanedSpace = cleanContent.replace(/\s+/g, " ");
        const fragments = Array.from(cleanedSpace.matchAll(/"[^"]+"|[^\s]+/g)).map((s) =>
            s.toString().replace(/"/g, "")
        );
        this.registry.executeCommand({ fragments, message });
    }
}
