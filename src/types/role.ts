import { GuildChannel, Message, Role } from "discord.js";
import ArgumentType from "./base";

export default class RoleType extends ArgumentType<Role> {
    get id(): string {
        return "Role";
    }

    validate(val: string, msg: Message) {
        const matches = val.match(/^(?:<@&)?([0-9]+)>?$/);
        if (matches) return msg.guild?.roles.cache.has(matches[1]) ?? false;
        const search = val.toLowerCase();
        let roles = msg.guild?.roles.cache.filter(nameFilterInexact(search));
        if (roles?.size === 0) return false;
        if (roles?.size === 1) {
            return true;
        }
        const exactRoles = roles?.filter(nameFilterExact(search));
        if (exactRoles?.size === 1) {
            return true;
        }
        return false;
    }

    parse(val: string, msg: Message) {
        const matches = val.match(/^(?:<@&)?([0-9]+)>?$/);
        if (matches) return msg.guild?.roles.cache.get(matches[1]) || null;
        const search = val.toLowerCase();
        const roles = msg.guild?.roles.cache.filter(nameFilterInexact(search));
        if (roles?.size === 0) return null;
        if (roles?.size === 1) return roles.first();
        const exactRoles = roles?.filter(nameFilterExact(search));
        if (exactRoles?.size === 1) return exactRoles.first();
        return null;
    }
}

function nameFilterExact(search: string) {
    return (thing: any) => thing.name.toLowerCase() === search;
}

function nameFilterInexact(search: string) {
    return (thing: any) => thing.name.toLowerCase().includes(search);
}
