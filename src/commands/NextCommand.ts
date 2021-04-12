import Log from "@frasermcc/log";
import { Message, MessageCollector, MessageEmbed, NewsChannel } from "discord.js";
import Client from "../client/Client";
import { AliasManager } from "./alias/Alias";
import { clearArguments, setArguments } from "./arguments/Argument";
import CommandInhibitor from "./inhibitor/CommandInhibitor";
import { PermissionManager } from "./permissions/Permit";

interface CommandHandlerArgs {
    fragments: string[];
    message: Message;
    client: Client;
    inhibitor?: CommandInhibitor;
    aliasManager?: AliasManager;
    permissionManager?: PermissionManager;
}

interface ExecutionPolicyResult {
    shouldExecute: boolean;
    errorMsg?: string;
    errors?: string[];
}

export default abstract class NextCommand {
    private _message?: Message;

    constructor() {}

    public readonly handle = async (args: CommandHandlerArgs): Promise<void> => {
        this.handleExecutionPolicy(args);

        this._message = args.message;

        this.execute(args.message, args.client)
            .then(() => this.internalCommandDidExecute(args))
            .catch((e) => this.error(args.message, e?.toString()));

        this.log(args.client, args.message, args.aliasManager);
    };

    protected abstract execute(message: Message, client: Client): Promise<any>;

    protected commandShouldExecute(args: CommandHandlerArgs): ExecutionPolicyResult {
        return { shouldExecute: true };
    }

    protected async commandDidBlock(sourceMessage: Message, issue: string): Promise<any> {
        await sourceMessage.channel.send(issue);
        Log.warn(issue);
    }

    protected commandDidInhibit(sourceMessage: Message, issue: string): any {
        sourceMessage.channel.send(
            `This command has a cooldown. The specific problem is as follows: ${codify(issue)}}`
        );
        Log.warn(issue);
    }

    protected commandDidShowHelp(sourceMessage: Message, help: string, issue: string): any {
        sourceMessage.channel.send(
            `You seem to have used the command incorrectly: ${codify(issue)}Correct Usage: ${codify(help)}`
        );
        Log.warn(issue);
    }

    protected async commandDidNotExecute(args: CommandHandlerArgs, issue: string): Promise<any> {
        await args.message.channel.send(issue);
        Log.warn(issue);
    }

    protected commandDidExecute(args: CommandHandlerArgs) {
        const aliases = args.aliasManager?.aliases;
        if (aliases) {
            Log.trace(`Successfully ran command ${aliases[0]}`);
        }
    }

    readonly handleExecutionPolicy = async (args: CommandHandlerArgs) => {
        // handle internal execution policy
        const commandShouldBlock = ({
            message,
            client,
            permissionManager,
        }: CommandHandlerArgs): ExecutionPolicyResult => {
            const shouldExecute = permissionManager?.userHasPermissions(message, client) ?? true;

            let errorMsg = `This command requires you to have ${permissionManager?.permissions} permissions in the server.`;
            if (!permissionManager?.permissions) errorMsg = `This command can only be used by the bot owner.`;

            return {
                shouldExecute,
                errorMsg,
            };
        };

        const commandShouldInhibit = ({ message, inhibitor }: CommandHandlerArgs): ExecutionPolicyResult => {
            if (inhibitor) {
                const errorMsg = inhibitor.commandShouldInhibit(message);
                if (errorMsg) {
                    return {
                        shouldExecute: false,
                        errorMsg,
                    };
                }
            }
            return { shouldExecute: true };
        };

        const commandIsWhitelisted = ({ message, permissionManager }: CommandHandlerArgs): ExecutionPolicyResult => {
            const allowedServers = permissionManager?.getAllowedServers();

            if (allowedServers && allowedServers.length !== 0 && !allowedServers?.includes(message.guild?.id ?? ""))
                return {
                    shouldExecute: false,
                    errorMsg: "This command is only allowed to be run in servers specified by the bot owner.",
                };

            return { shouldExecute: true };
        };

        const injectCommandArguments = async ({
            message,
            fragments,
        }: CommandHandlerArgs): Promise<ExecutionPolicyResult> => {
            const errors = await setArguments(this, message, ...fragments.slice(1));
            if (errors)
                return {
                    shouldExecute: false,
                    errors,
                };
            return { shouldExecute: true };
        };

        const sourceMessage = args.message;
        // related to per-server whitelisting
        const whitelistResult = commandIsWhitelisted(args);
        if (!whitelistResult.shouldExecute) {
            return;
        }
        // related to permissions
        const blockResult = commandShouldBlock(args);
        if (!blockResult.shouldExecute) {
            return this.commandDidBlock(sourceMessage, blockResult.errorMsg ?? "");
        }
        // related to command overuse
        const inhibitResult = commandShouldInhibit(args);
        if (!inhibitResult.shouldExecute) {
            return this.commandDidInhibit(sourceMessage, inhibitResult.errorMsg ?? "");
        }
        // related to argument injection
        const injectionResult = await injectCommandArguments(args);
        if (!injectionResult.shouldExecute) {
            if (injectionResult.errors)
                return this.commandDidShowHelp(sourceMessage, injectionResult.errors[0], injectionResult.errors[1]);
            return this.commandDidShowHelp(sourceMessage, "", "");
        }
        // user hook
        const userResult = this.commandShouldExecute(args);
        if (!userResult.shouldExecute) {
            return this.commandDidNotExecute(args, userResult.errorMsg ?? "");
        }
    };

    private internalCommandDidExecute = (args: CommandHandlerArgs) => {
        clearArguments(this);
        this.commandDidExecute(args);
    };

    protected error(sourceMessage: Message, issue: string): Promise<Message> {
        const reply = sourceMessage.channel.send(
            `There was an error when running this command. The specific problem is as follows: ${codify(issue)}`
        );
        Log.warn(issue);
        return reply;
    }

    protected async log(client: Client, message: Message, aliasManager?: AliasManager) {
        await client.logger?.log({
            command: aliasManager?.aliases ? aliasManager.aliases[0] : "",
            guild: message.guild ?? undefined,
            invokingUser: message.author,
            message: message,
            time: new Date(),
        });
    }

    protected readonly awaitReply = async ({
        promptText,
        secondsTimeout,
        sourceMessage,
    }: {
        sourceMessage: Message;
        promptText?: string;
        secondsTimeout: number;
    }) => {
        if (promptText) {
            await sourceMessage.channel.send(promptText);
        }
        const message = await sourceMessage.channel.awaitMessages((m) => m.author.id === sourceMessage.author.id, {
            errors: ["time"],
            max: 1,
        });
        return message.first();
    };

    protected readonly say = async (content: string | MessageEmbed) => {
        if (this._message) {
            if (typeof content === "string") return this._message.channel.send(content);
            return this._message.channel.send({ embed: content });
        }
    };

    protected readonly codifySay = async (content: string) => {
        if (this._message) {
            if (typeof content === "string") return this._message.channel.send("```" + content + "```");
        }
    };

    protected readonly printArrayChunks = async (content: string[]) => {
        const joined = content.join("\n");
        const totalChars = joined.length;
        if (totalChars < 1990) return this.codifySay(joined);

        let currentMessage = "";
        for (let i = 0; i < content.length; i++) {
            const element = content[i];
            const elementSize = element.length;
            const currentSize = currentMessage.length;
            if (currentSize + elementSize < 1990) {
                currentMessage += element + "\n";
            } else {
                await this.codifySay(currentMessage);
                currentMessage = element + "\n";
            }
        }
        if (currentMessage) {
            await this.codifySay(currentMessage);
        }
        return;
    };
}

const codify = (str: string) => `\`\`\`${str}\`\`\``;
