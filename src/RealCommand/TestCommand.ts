import Argument from "../annotations/Argument";
import Command from "../commands/Command";
import BooleanType from "../types/boolean";
import IntegerType from "../types/integer";

export default class TestCommand extends Command {
    @Argument({ type: new BooleanType() })
    number!: boolean;
    @Argument({ type: new IntegerType(), validate: (n) => n < 50 })
    notArg!: number;

    commandShouldInvoke(message: string) {
        return true;
    }

    execute() {
        console.log(`Executed! Args: ${this.number} ${this.notArg}`);
    }
}
