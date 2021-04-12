import { Guild } from "discord.js";

export default class GuildSettingsManager {
    constructor(defaultPrefix: string) {
        this._defaultPrefix = defaultPrefix;
    }

    private readonly _defaultPrefix;
    private readonly _prefixMap = new Map<string, string>();

    getPrefixForGuild(guild: Guild | string | null): string {
        if (!guild) return this.prefix;
        if (typeof guild !== "string") guild = guild.id;
        return this._prefixMap.get(guild) ?? this.prefix;
    }

    setPrefixForGuild(guild: Guild | string, prefix: string): void {
        if (typeof guild !== "string") guild = guild.id;
        this._prefixMap.set(guild, prefix);
    }

    get prefix() {
        return this._defaultPrefix;
    }

    /**
     * Groups that will never execute in the server.
     *
     */
    private readonly _disabledGroups = new Map<string, Set<string>>();

    groupIsEnabled(guild: Guild | string, groupName: string) {
        guild = guildToId(guild);
        return !this._disabledGroups.get(guild)?.has(groupName.toLowerCase());
    }

    disableGroupInGuild({
        groupName,
        guild,
        shouldBeDisabled,
    }: {
        guild: Guild | string;
        groupName: string;
        shouldBeDisabled: boolean;
    }) {
        guild = guildToId(guild);
        groupName = groupName.toLowerCase();
        if (!this._disabledGroups.has(guild)) {
            this._disabledGroups.set(guild, new Set());
        }
        const disabledGroups = this._disabledGroups.get(guild);
        if (shouldBeDisabled) {
            return disabledGroups?.add(groupName);
        }
        return disabledGroups?.delete(groupName);
    }

    toggleCommandGroupStatus(guild: Guild | string, groupName: string): boolean {
        guild = guildToId(guild);
        groupName = groupName.toLowerCase();
        if (!this._disabledGroups.has(guild)) {
            this._disabledGroups.set(guild, new Set());
        }
        const disabledGroups = this._disabledGroups.get(guild);
        if (disabledGroups?.delete(groupName)) {
            return true;
        }
        disabledGroups?.add(groupName);
        return false;
    }
}

const guildToId = (guild: Guild | string) => {
    if (typeof guild === "string") {
        return guild;
    }
    return guild.id;
};
