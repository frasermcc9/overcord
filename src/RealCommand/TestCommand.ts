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
