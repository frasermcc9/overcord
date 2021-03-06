import { GuildChannel, Message } from "discord.js";
import ArgumentType from "./base";

export default class ChannelArgumentType extends ArgumentType<GuildChannel> {
    get id(): string {
        return "Guild Channel";
    }

    validate(val: string, msg: Message) {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) return msg.guild?.channels.cache.has(matches[1]) ?? false;
        const search = val.toLowerCase();
        let channels = msg.guild?.channels.cache.filter(nameFilterInexact(search));
        if (channels?.size === 0) return false;
        if (channels?.size === 1) {
            return true;
        }
        const exactChannels = channels?.filter(nameFilterExact(search));
        if (exactChannels?.size === 1) {
            return true;
        }
        if (exactChannels && exactChannels.size > 0) channels = exactChannels;
        return false;
        // return channels && channels.size <= 15
        //     ? `${disambiguation(
        //           channels?.map((chan) => escapeMarkdown(chan.name)),
        //           "channels",
        //           null
        //       )}\n`
        //     : "Multiple channels found. Please be more specific.";
    }

    parse(val: string, msg: Message) {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) return msg.guild?.channels.cache.get(matches[1]) || null;
        const search = val.toLowerCase();
        const channels = msg.guild?.channels.cache.filter(nameFilterInexact(search));
        if (channels?.size === 0) return null;
        if (channels?.size === 1) return channels.first();
        const exactChannels = channels?.filter(nameFilterExact(search));
        if (exactChannels?.size === 1) return exactChannels.first();
        return null;
    }
}

function nameFilterExact(search: string) {
    return (thing: any) => thing?.name?.toLowerCase() === search;
}

function nameFilterInexact(search: string) {
    return (thing: any) => thing?.name?.toLowerCase().includes(search);
}
