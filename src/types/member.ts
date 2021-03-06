import { GuildChannel, GuildMember, Message } from "discord.js";
import ArgumentType from "./base";

export default class MemberType extends ArgumentType<GuildMember> {
    get id(): string {
        return "Guild Member";
    }

    async validate(val: string, msg: Message) {
        const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/);
        if (matches) {
            try {
                const member = await msg.guild?.members.fetch(await msg.client.users.fetch(matches[1]));
                if (!member) return false;

                return true;
            } catch (err) {
                return false;
            }
        }
        const search = val.toLowerCase();
        let members = msg.guild?.members.cache.filter(memberFilterInexact(search));
        if (members?.size === 0) return false;
        if (members?.size === 1) {
            return true;
        }
        const exactMembers = members?.filter(memberFilterExact(search));
        if (exactMembers?.size === 1) {
            return true;
        }
        //if (exactMembers?.size > 0) members = exactMembers;
        return false;
    }

    parse(val: string, msg: Message) {
        const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/);
        if (matches) return msg.guild?.member(matches[1]) || null;
        const search = val.toLowerCase();
        const members = msg.guild?.members.cache.filter(memberFilterInexact(search));
        if (members?.size === 0) return null;
        if (members?.size === 1) return members.first();
        const exactMembers = members?.filter(memberFilterExact(search));
        if (exactMembers?.size === 1) return exactMembers.first();
        return null;
    }
}

function memberFilterExact(search: string) {
    return (mem: any) =>
        mem.user.username.toLowerCase() === search ||
        (mem.nickname && mem.nickname.toLowerCase() === search) ||
        `${mem.user.username.toLowerCase()}#${mem.user.discriminator}` === search;
}

function memberFilterInexact(search: string) {
    return (mem: any) =>
        mem.user.username.toLowerCase().includes(search) ||
        (mem.nickname && mem.nickname.toLowerCase().includes(search)) ||
        `${mem.user.username.toLowerCase()}#${mem.user.discriminator}`.includes(search);
}
