import { ClientEvents } from "discord.js";

export default interface DiscordEvent<T extends keyof ClientEvents> {
    firesOn: T;
    callback: (...args: ClientEvents[T]) => void;
}
