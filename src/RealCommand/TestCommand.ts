import { Message } from "discord.js";
import Argument from "../commands/arguments/Argument";
import Alias from "../commands/alias/Alias";
import Command from "../commands/Command";
import Inhibit from "../commands/inhibitor/Inhibit";
import Permit from "../commands/permissions/Permit";
import { BooleanType, IntegerType, UnionType, FloatType } from "../types";

@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Alias("hello", "test")
@Permit("ADMINISTRATOR")
export default class TestCommand extends Command {
    @Argument({ type: new BooleanType() })
    someBoolean!: boolean;

    @Argument({ type: new IntegerType(), validate: (n) => n < 50 })
    someInteger!: number;

    @Argument({ type: new UnionType(new IntegerType(), new FloatType()) })
    someNumber!: number;

    async execute(message: Message) {
        console.log(`Executed! Args: ${this.someBoolean} ${this.someInteger} ${this.someNumber} `);
    }
}
