import { ApplicationCommandData } from "discord.js";
import { Client, SlashCommand } from "../..";
import { getDescription, getDomain, getName } from "./SlashCommandDecorators";

export class SlashCommandLoader {
  private _commands: SlashCommand<any>[] = [];

  constructor(private readonly client: Client) {}

  public addCommand(command: SlashCommand<any>): void {
    this._commands.push(command);
  }

  public async finalize() {
    const toSet: ApplicationCommandData[] = [];
    for (const command of this._commands) {
      const ctor = command.constructor;
      command.setName(getName(ctor));
      command.setDescription(getDescription(ctor));
      command.domainUnion(...getDomain(ctor));

      const registrationData = command.registrationData();
      toSet.push(registrationData);

      this.client.on("interactionCreate", command.onMessage);

      if (command.isGlobal()) {
        await this.client.application?.commands.create(registrationData);
      } else {
        for (const guildId of command.domainIterable()) {
          const guild = await this.client.guilds.fetch(guildId);
          guild.commands.create(registrationData);
        }
      }
    }
  }
}
