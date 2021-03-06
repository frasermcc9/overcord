import { Message } from "discord.js";
import { InhibitionSettings } from "./Inhibit";

export default class CommandInhibitor {
    private useInhibitor = true;

    private limitBy;
    private maxUsesPerPeriod;
    private periodDuration;

    private inhibitionMap;

    constructor(settings?: InhibitionSettings) {
        if (settings == undefined) {
            this.useInhibitor = false;
        }
        this.limitBy = settings?.limitBy ?? "USER";
        this.maxUsesPerPeriod = settings?.maxUsesPerPeriod ?? 1;
        this.periodDuration = settings?.periodDuration ?? 5;

        this.inhibitionMap = new Map<string, number>();
    }

    get inhibitionSettings(): InhibitionSettings {
        return { limitBy: this.limitBy, maxUsesPerPeriod: this.maxUsesPerPeriod, periodDuration: this.periodDuration };
    }

    getIdContext(commandMessage: Message): string {
        switch (this.limitBy) {
            case "USER":
                return commandMessage.author.id;
            case "CHANNEL":
                return commandMessage.channel.id;
            case "GUILD":
                // either use a guild, or channel if this is a DM.
                return commandMessage.guild?.id ?? commandMessage.channel.id;
            default:
                return commandMessage.author.id;
        }
    }

    commandShouldInhibit(commandMessage: Message): boolean {
        if (!this.useInhibitor) return false;

        const id = this.getIdContext(commandMessage);
        const usages = this.inhibitionMap?.get(id);

        if (usages === this.maxUsesPerPeriod) return true;
        this.inhibitionMap?.set(id, (usages ?? 0) + 1);

        setTimeout(() => {
            this.inhibitionMap?.set(id, (usages ?? 1) - 1);
        }, this.periodDuration * 1000);

        return false;
    }
}
