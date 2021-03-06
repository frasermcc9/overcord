import Log from "@frasermcc/log";
import { Message } from "discord.js";
import { clearArguments, setArguments } from "./arguments/Argument";
import CommandInhibitor from "./inhibitor/CommandInhibitor";
import { AliasManager } from "./alias/Alias";
import { PermissionManager } from "./permissions/Permit";

export default abstract class AbstractCommand {
    constructor() {}

    public readonly handle = ({
        fragments,
        message,
        aliasManager,
        inhibitor,
        permissionManager,
    }: CommandHandlerArgs): void => {
        const shouldExecute = this.internalCommandShouldExecute(message, fragments, aliasManager);
        if (!shouldExecute) return;

        const shouldBlock = this.internalCommandShouldBlock(message, permissionManager);
        if (shouldBlock)
            return this.error(
                message,
                `This command requires you to have ${permissionManager?.permissions} permissions in the server.`
            );

        const shouldInhibit = this.internalCommandShouldInhibit(message, inhibitor);
        if (shouldInhibit) return this.error(message, "Command inhibited");

        const argumentErrors = setArguments(this, message, ...fragments.slice(1));
        if (argumentErrors) return this.error(message, argumentErrors);

        this.execute(message);

        this.internalCommandDidExecute();
    };

    private readonly internalCommandShouldInhibit = (message: Message, inhibitor?: CommandInhibitor) => {
        if (inhibitor) {
            return inhibitor.commandShouldInhibit(message);
        }
        return false;
    };

    private readonly internalCommandShouldExecute = (
        commandMessage: Message,
        commandFragments: string[],
        aliasManager?: AliasManager
    ): boolean => {
        if (aliasManager) {
            return (
                aliasManager.commandShouldInvoke(commandFragments[0] ?? "") &&
                this.commandShouldExecute(commandMessage, commandFragments)
            );
        }
        return this.commandShouldExecute(commandMessage, commandFragments);
    };

    protected commandShouldExecute(commandMessage: Message, fragments: string[]): boolean {
        return true;
    }

    private readonly internalCommandShouldBlock = (
        commandMessage: Message,
        permissionManager?: PermissionManager
    ): boolean => {
        if (permissionManager?.userHasPermissions(commandMessage) ?? true) {
            return this.commandShouldBlock(commandMessage, permissionManager);
        }
        return true;
    };

    protected commandShouldBlock = (commandMessage: Message, permissionManager?: PermissionManager): boolean => {
        return false;
    };

    private readonly internalCommandDidExecute = () => {
        clearArguments(this);
        this.commandDidExecute();
    };

    protected commandDidExecute() {}

    abstract execute(sourceMessage: Message): any;

    protected error(sourceMessage: Message, issue: string): any {
        Log.warn(issue);
    }
}

interface CommandHandlerArgs {
    fragments: string[];
    message: Message;
    inhibitor?: CommandInhibitor;
    aliasManager?: AliasManager;
    permissionManager?: PermissionManager;
}
