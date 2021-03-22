# Commands

Commands are an essential part of Overcord. Commands allow you to create code
that executes in response to users typing certain commands to your bot.

::: tip

Commands must be executed by typing your bots command prefix, followed by the
command name. If you want more control over when code will execute, then
creating an event may be necessary.

:::

## Creating a Simple Command

Creating a command in Overcord is super simple. Start by creating a new file in
your commands directory, `Hi.ts`.

The following code will create a command that simply says 'hi' when the command
`!hi` or `!hello` is used:

```ts
import { Alias, Command, Client } from "@frasermcc/overcord";
import { Message } from "discord.js";

@Alias("hi", "hello")
export default class HiCommand extends Command {
    async execute(message: Message, client: Client) {
        return message.channel.send("Hi!");
    }
}
```

::: warning

Commands should always be the default export out of a file.

:::

- We use the `Alias` decorator to name a command. We can pass through any number
  of values, which must be unique amongst all other commands. Your command can be
  called by any of these names.
- We override the execute method to determine what should happen if the command
  is run successfully. The execute method exposes the message that invoked the
  command, as well as the client object.

## Commands with Arguments

Overcord can be used to require arguments to your commands. Arguments are
additional inputs beyond just typing the command name. In the following example,
we'll create a command that takes a number as an argument, and returns that
number minus 1.

```ts
import {
    Alias,
    Command,
    Argument,
    IntegerType,
    Client,
} from "@frasermcc/overcord";
import { Message } from "discord.js";

@Alias("subtractone")
export default class SubtractOneCommand extends Command {
    @Argument({ type: new IntegerType(), validate: (n) => !n.isNan() })
    someInteger!: number;

    async execute(message: Message, client: Client) {
        return message.channel.send(`Your number minus one is ${someInteger - 1}!`);
    }
}
```

When a user invokes this command with `!subtractone 15`, the value `15` will be
injected into the `someInteger` class field. You can then have access to this
value in any method inside the command.

In overcord, arguments are defined by using fields in a class. When the command
is executed, the provided arguments will be injected into these fields *in order*. So if you have:

```ts
    @Argument({ type: new IntegerType() })
    intOne!: number;
    @Argument({ type: new IntegerType() })
    intTwo!: number;
```

...then the first argument typed out would be injected into intOne, and the second
argument typed out would be injected into intTwo.

For more information about arguments in Overcord, check out the guide page on
Arguments.