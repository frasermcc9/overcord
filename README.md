# Overcord

[![npm version](https://badge.fury.io/js/%40frasermcc%2Fovercord.svg)](https://badge.fury.io/js/%40frasermcc%2Fovercord)
# About
Overcord is a command framework for [discord.js](https://discord.js.org/#/). The
goal is to make it easier to create bots with powerful commands whilst
maintaining a clean codebase. Additionally, this framework is built for
[TypeScript](https://www.typescriptlang.org/), using modern features like
decorators to help with writing less verbose code.

# Planned Features
- [x] Decorators and hooks to give advanced control over commands.
- [x] Argument parsing and validation
- [x] Argument typing system
- [x] Per-guild prefixes
- [x] Command invoking from non-command-message events
- [ ] Bundled commands
- [x] Command inhibiting
- [x] Union types
- [x] Command Permissions
- [x] Command Groups
- [x] Infinite Arguments
- [ ] Useful Patterns Built in

# Current Usage

## Initial Setup
```ts
import { Client } from "@frasermcc/overcord";
import path from "path";

(async () => {
    const client = new Client({ defaultCommandPrefix: "%", owners: [], disableMentions: "everyone" });
    await client.registry.recursivelyRegisterCommands(path.join(__dirname, "/commands"));
    await client.registry.recursivelyRegisterEvents(path.join(__dirname, "/events"));
    client.login("YOUR_TOKEN");
})();
```

Use `recursivelyRegisterCommands` to register all commands in a directory. Add
some commands, and this is all you need to bootstrap a bot.

Use `recursivelyRegisterEvents` to register all events in a directory.

## Creating a command

```ts
import {
    Alias,
    Inhibit,
    Permit,
    Command,
    Argument,
    BooleanType,
    IntegerType,
    UnionType,
    FloatType,
    Client,
} from "@frasermcc/overcord";
import { Message } from "discord.js";

@Alias("hello", "test")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Permit("ADMINISTRATOR")
export default class TestCommand extends Command {
    @Argument({ type: new BooleanType() })
    someBoolean!: boolean;

    @Argument({ type: new IntegerType(), validate: (n) => n < 50 })
    someInteger!: number;

    @Argument({ type: new UnionType(new IntegerType(), new FloatType()) })
    someNumber!: number;

    async execute(message: Message, client: Client) {
        console.log(
            `Executed! Args: ${this.someBoolean} ${this.someInteger} ${this.someNumber} `
        );
    }
}
```
For most cases, commands can use `@Decorators` to set command parameters. For
more advanced usage, the `Command` class exposes several hooks giving more
direct control over the commands.

In the above example, we have a command that is executed when `hello` or `test` is sent. The command is inhibited, such that a user can only use it 3 times, allowing them to use the command again 10 seconds after each execution. Only users with Administrator permissions can use the command.

Our command has three arguments, meaning when a user who types `!hello true 35 0.15`, the execute command will be run, with `someBoolean = true`, `someInteger = 35`, and `someNumber = 0.15`. Arguments can be normal types, discord types (i.e. members, channels), or one of several types.

### Expected Output:
```
Executed! Args: true 35 0.15
```

## Creating Other Events
You can easily create events to listen to other commands as well.

```ts
import DiscordEvent from "../events/BaseEvent";

const TestEvent: DiscordEvent<"guildMemberAdd"> = {
    callback: (member) => {
        console.log(`Say hi to ${member.user.username}!`);
    },
    firesOn: "guildMemberAdd",
};

export default TestEvent;
```