import {
  ApplicationCommandData,
  ApplicationCommandOptionData,
  BaseCommandInteraction,
  CommandInteraction,
  Interaction,
} from "discord.js";
import internal from "stream";
import { SlashCommandLoaderException } from "../../errors/SlashCommandLoaderException";

interface ApiTypeMap {
  STRING: 3;
  INTEGER: 4;
  BOOLEAN: 5;
  USER: 6;
  CHANNEL: 7;
  ROLE: 8;
}
interface Choice {
  name: string;
  value: string | number;
}

interface SlashCommandCreator<E = {}> {
  name: string;
  description: string;
  options: Options<E>;
}

type Options<E = {}> = {
  [K in keyof E]: {
    description: string;
    required?: boolean;
    type: keyof ApiTypeMap;
    choices?: Choice[];
  };
};

interface SlashCommandRequirements<T = {}> {
  commandOptions: Options<T>;
  response: (response: T, interaction: CommandInteraction) => void;
}

export default abstract class SlashCommand<T = {}> {
  /**
   * The guilds where this command can execute (empty array means all guilds)
   */
  private _domains: Set<string> = new Set();
  private options: Required<Pick<SlashCommandCreator<T>, "options">> & Partial<SlashCommandCreator<T>>;
  private response;

  constructor({ commandOptions, response }: SlashCommandRequirements<T>) {
    this.options = { options: commandOptions };
    this.response = response;
  }

  readonly argNames = (): [name: keyof T, type: keyof ApiTypeMap][] => {
    const out: [keyof T, keyof ApiTypeMap][] = [];
    const options = this.options.options;
    for (const key in options) {
      const val = options[key];
      out.push([key, val.type]);
    }
    return out;
  };

  readonly executeWithArgs = (args: T, interaction: CommandInteraction) => {
    this.response(args, interaction);
  };

  readonly registrationData = (): ApplicationCommandData => {
    if (!this.options.name || !this.options.description) {
      throw new SlashCommandLoaderException(
        `Slash command name and description are required for ${this.constructor.name}`
      );
    }

    const transformedOptions: ApplicationCommandOptionData[] = [];
    const options = this.options.options;

    for (const key in options) {
      const val = options[key];
      transformedOptions.push({
        name: key,
        description: val.description,
        choices: val.choices,
        required: val.required,
        type: val.type,
      });
    }

    return {
      name: this.options.name,
      description: this.options.description,
      options: transformedOptions,
    };
  };

  readonly onMessage = async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== this.options.name) return;

    const args: T = this.argNames().reduce((acc, cur) => {
      const given = interaction.options.get(cur[0].toString());
      if (given == null) return acc;

      switch (cur[1]) {
        case "STRING":
        case "INTEGER":
        case "BOOLEAN":
          return { ...acc, [cur[0]]: given.value };
        case "CHANNEL":
          return { ...acc, [cur[0]]: given.channel };
        case "ROLE":
          return { ...acc, [cur[0]]: given.role };
        case "USER":
          return { ...acc, [cur[0]]: given.user };
        default:
          return acc;
      }
    }, {} as T);

    this.executeWithArgs(args, interaction as CommandInteraction);
  };

  setName(name: string) {
    this.options.name = name;
  }

  setDescription(description: string) {
    this.options.description = description;
  }

  domainSubtraction(...domains: string[]) {
    domains.forEach((domain) => this._domains.delete(domain));
  }

  domainUnion(...domains: string[]) {
    domains.forEach((domain) => this._domains.add(domain));
  }

  domainIterable(): Iterable<string> {
    return [...this._domains];
  }

  isGlobal() {
    return this._domains.size === 0;
  }

  verify() {
    if (!this.options.name || !this.options.description) {
      throw new SlashCommandLoaderException(
        `Slash command name and description is required for ${this.constructor.name}`
      );
    }

    if (this.options.name.toLowerCase() !== this.options.name) {
      throw new SlashCommandLoaderException(`Slash command name must be lowercase: ${this.options.name}`);
    }
  }
}
