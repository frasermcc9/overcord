import { Message } from "discord.js";
import Client from "../Client";
import { CommandRegistry } from "./CommandRegistry";

export default class Dispatcher {
    constructor(private readonly client: Client, private readonly registry: CommandRegistry) {}

    handleRawMessage(message: Message) {
        const fragments = message.content.split(/\s+/);
        this.registry.executeCommand({ fragments, message });
    }
}
