# Overcord

## About
Overcord is a command framework for [discord.js](https://discord.js.org/#/). The
goal is to make it easier to create bots with powerful commands whilst
maintaining a clean codebase. Additionally, this framework is built for
[TypeScript](https://www.typescriptlang.org/), using modern features like
decorators to help with writing less verbose code.

## Planned Features
- Hooks with methods that give control over commands
- Argument parsing and validation
- Argument typing system
- Per-guild prefixes
- Command invoking from non-command-message events
- Bundled commands
- Command inhibiting

## Current Usage

```ts
import Argument from "../annotations/Argument";
import Command from "../commands/Command";
import BooleanType from "../types/boolean";
import IntegerType from "../types/integer";

export default class TestCommand extends Command {
    @Argument({ type: new BooleanType() })
    someBoolean!: boolean;
    @Argument({ type: new IntegerType(), validate: (n) => n < 50 })
    someNumber!: number;

    commandShouldInvoke(command: string) {
        return ["test", "experiment", "testing"].includes(command);
    }

    execute() {
        console.log(`Executed! Args: ${this.number} ${this.notArg}`);
    }
}
```
Arguments that can be passed to the command from a users message are declared with the `@Argument()` decorator. This command will fire when `commandShouldInvoke` returns true. If so, then `execute` will fire.

For example, if a user types `!test true 35`, then `someBoolean` will have the value `true` and `someNumber` will have the value `35`.

### Expected Output:
```
Executed! Args: 35 true
```