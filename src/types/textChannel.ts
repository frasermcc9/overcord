import { GuildChannel, Message, TextChannel } from "discord.js";
import ArgumentType from "./base";

export default class TextChannelType extends ArgumentType<TextChannel> {
    get id(): string {
        return "Text Channel";
    }

    validate(val: string, msg: Message) {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) {
            try {
                const channel = msg.client.channels.resolve(matches[1]);
                if (!channel || channel.type !== "text") return false;

                return true;
            } catch (err) {
                return false;
            }
        }
        if (!msg.guild) return false;
        const search = val.toLowerCase();
        let channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0) return false;
        if (channels.size === 1) {
            return true;
        }
        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) {
            return true;
        }
        return false;
    }

    parse(val: string, msg: Message) {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) return (msg.client.channels.resolve(matches[1]) as TextChannel) || null;
        if (!msg.guild) return null;
        const search = val.toLowerCase();
        const channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0) return null;
        if (channels.size === 1) return channels.first() as TextChannel;
        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) return exactChannels.first() as TextChannel;
        return null;
    }
}

function channelFilterExact(search: string) {
    return (chan: GuildChannel) => chan.type === "text" && chan.name.toLowerCase() === search;
}

function channelFilterInexact(search: string) {
    return (chan: GuildChannel) => chan.type === "text" && chan.name.toLowerCase().includes(search);
}
