import Log from "@frasermcc/log";
import { Message, MessageCollector, MessageEmbed, NewsChannel } from "discord.js";
import Client from "../client/Client";
import { AliasManager } from "./alias/Alias";
import { clearArguments, setArguments } from "./arguments/Argument";
import CommandInhibitor from "./inhibitor/CommandInhibitor";
import { PermissionManager } from "./permissions/Permit";
import { setState } from "./state/Stateful";

export default abstract class AbstractCommand {
  private _message?: Message;

  constructor() {}

  public readonly handle = async ({
    fragments,
    message,
    aliasManager,
    inhibitor,
    permissionManager,
    client,
  }: CommandHandlerArgs): Promise<void> => {
    const shouldExecute = this.internalCommandShouldExecute(message, fragments, aliasManager);
    if (!shouldExecute) return;

    const allowedServers = permissionManager?.getAllowedServers();
    if (allowedServers && allowedServers.length !== 0 && !allowedServers?.includes(message.guild?.id ?? "")) return;

    const argumentErrors = await setArguments(this, message, ...fragments.slice(1));
    if (argumentErrors) return this.commandDidShowHelp(message, ...argumentErrors);

    setState(this, message);

    const customBlockMessage = await this.customCommandBlocker(message, client);
    if (customBlockMessage.shouldBlock) {
      if (customBlockMessage.msg) await this.commandDidBlock(message, customBlockMessage.msg);
      return;
    }

    const shouldBlock = this.internalCommandShouldBlock(message, client, permissionManager);
    if (shouldBlock) {
      let errorMsg = `This command requires you to have ${permissionManager?.permissions} permissions in the server.`;
      if (!permissionManager?.permissions) errorMsg = `This command can only be used by the bot owner.`;
      return this.commandDidBlock(message, errorMsg);
    }

    const shouldInhibit = this.internalCommandShouldInhibit(message, inhibitor);
    if (shouldInhibit) return this.commandDidInhibit(message, shouldInhibit);

    this._message = message;

    this.execute(message, client)
      .then(() => this.internalCommandDidExecute())
      .catch((e) => this.error(message, e?.toString()));

    this.log(client, message, aliasManager);
  };

  protected async customCommandBlocker(
    message: Message,
    client: Client
  ): Promise<{ shouldBlock: boolean; msg?: string }> {
    return { shouldBlock: false };
  }

  private readonly internalCommandShouldInhibit = (message: Message, inhibitor?: CommandInhibitor): string | void => {
    if (inhibitor) {
      return inhibitor.commandShouldInhibit(message);
    }
    return;
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
    client: Client,
    permissionManager?: PermissionManager
  ): boolean => {
    if (permissionManager?.userHasPermissions(commandMessage, client) ?? true) {
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

  protected async log(client: Client, message: Message, aliasManager?: AliasManager) {
    await client.logger?.log({
      command: aliasManager?.aliases ? aliasManager.aliases[0] : "",
      guild: message.guild ?? undefined,
      invokingUser: message.author,
      message: message,
      time: new Date(),
    });
  }

  /**
   *
   * @param message
   * @param client
   * @abstract
   */
  abstract execute(message: Message, client: Client): Promise<any>;

  protected error(sourceMessage: Message, issue: string): Promise<Message> {
    const reply = sourceMessage.channel.send(
      `There was an error when running this command. The specific problem is as follows: \`\`\`${issue}\`\`\``
    );
    Log.warn(issue);
    return reply;
  }

  protected commandDidInhibit(sourceMessage: Message, issue: string): any {
    sourceMessage.channel.send(`This command has a cooldown. The specific problem is as follows: \`\`\`${issue}\`\`\``);
    Log.warn(issue);
  }

  protected commandDidShowHelp(sourceMessage: Message, help: string, issue: string): any {
    sourceMessage.channel.send(
      `You seem to have used the command incorrectly: ${codify(issue)}Correct Usage: ${codify(help)}`
    );
    Log.warn(issue);
  }

  protected async commandDidBlock(sourceMessage: Message, issue: string): Promise<any> {
    await sourceMessage.channel.send(issue);
    Log.warn(issue);
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

    const message = await sourceMessage.channel.awaitMessages({
      filter: (m) => m.author.id === sourceMessage.author.id,
      max: 1,
      time: secondsTimeout * 1000,
    });
    return message.first();

    // return new Promise<string>((res, rej) => {
    //     if (sourceMessage.channel.type === "news" || sourceMessage.channel instanceof NewsChannel) return rej();
    //     new MessageCollector(sourceMessage.channel, (m) => m.author.id === sourceMessage.author.id, {
    //         max: 1,
    //         time: 1000 * secondsTimeout,
    //     })
    //         .once("collect", (m: Message) => res(m.content))
    //         .once("end", (collected, reason) => {
    //             if (collected.size === 0) rej(reason);
    //         });
    // });
  };

  protected readonly say = async (content: string | MessageEmbed) => {
    if (this._message) {
      if (typeof content === "string") return this._message.channel.send(content);
      return this._message.channel.send({ embeds: [content] });
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

interface CommandHandlerArgs {
  fragments: string[];
  message: Message;
  client: Client;
  inhibitor?: CommandInhibitor;
  aliasManager?: AliasManager;
  permissionManager?: PermissionManager;
}
