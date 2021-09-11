# Slash Commands

- [Slash Commands](#slash-commands)
  - [Example](#example)
  - [Notes](#notes)

An abstract `SlashCommand` class exists. Extending this instead of the regular
`Command` class will create a slash command! Use `@Named` to name it,
`@Described` to give it a description, and `@Domain` to pass in a rest list of
server Ids for it to work in. 

Omitting the `@Domain` decorator will allow global
use, however be aware that global interactions can take up to an hour to appear,
so use a domain when testing!

## Example

```ts
import { Described, Domain, Named, SlashCommand } from "@frasermcc/overcord";

@Named("first")
@Described("This is an example slash command")
@Domain("SomeServerId")
export default class FirstSlashCommand extends SlashCommand<FirstSlashCommandOptions> {
    constructor() {
        super({
            commandOptions: {
                your_name: {
                    description: "What is your name?",
                    required: true,
                    type: "STRING",
                },
            },
            response: ({ your_name }, interaction) => {
                interaction.reply(
                    `Hello ${your_name}, you used a slash command!`
                );
            },
        });
    }
}

interface FirstSlashCommandOptions {
    your_name: string;
}

```

## Notes

- Your commands must have the `@Named` and `@Described` decorators.
- The name of your command must be lower_case.
- The name of all arguments must also be lower_case.