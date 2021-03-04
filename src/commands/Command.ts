import Log from "@frasermcc/log";
import { Message } from "discord.js";
import { clearArguments, setArguments } from "../annotations/Argument";

export default abstract class DiscordCommand {
    constructor() {}

    public readonly handle = ({ fragments, message }: { fragments: string[]; message: Message }): void => {
        if (!this.commandShouldInvoke(fragments[0])) return;
        const issue = setArguments(this, ...fragments.slice(1));
        if (issue) return this.error(message, issue);
        this.execute();
        this.internalCommandDidExecute();
    };

    protected commandShouldInvoke(commandMessage: string): boolean {
        return false;
    }

    public readonly internalCommandDidExecute = () => {
        clearArguments(this);
        this.commandDidExecute();
    };

    protected commandDidExecute() {}

    abstract execute(): any;

    protected error(sourceMessage: Message, issue: string): any {
        Log.warn(issue);
    }
}
