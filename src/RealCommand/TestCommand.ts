import { Message } from "discord.js";
import Argument from "../commands/arguments/Argument";
import Alias from "../commands/alias/Alias";
import Command from "../commands/Command";
import Inhibit from "../commands/inhibitor/Inhibit";
import Permit, { AllowServers, OwnerOnly } from "../commands/permissions/Permit";
import { BooleanType, IntegerType, UnionType, FloatType } from "../types";
import InfiniteType from "../types/infinite";

@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Alias("hello", "test")
@AllowServers("12345", "newid")
@OwnerOnly()
export default class TestCommand extends Command {
    @Argument({ type: new BooleanType() })
    someBoolean!: boolean;

    @Argument({ type: new IntegerType(), validate: (n) => n < 50 })
    someInteger!: number;

    @Argument({ type: new UnionType(new IntegerType(), new FloatType()) })
    someNumber!: number;

    @Argument({ type: new IntegerType(), infinite: true, validate: (n) => n > 0 })
    infiniteArgs!: number[];

    async execute(message: Message) {
        console.log(`Executed! Args: ${this.someBoolean} ${this.someInteger} ${this.someNumber} `);
        console.log(`Executed! Infinite Args: ${this.infiniteArgs}`);
    }
}
