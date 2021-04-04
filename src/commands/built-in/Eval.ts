import { Message } from "discord.js";
import { Client, Command } from "../../index";
import { StringType } from "../../types";
import Alias from "../alias/Alias";
import Argument from "../arguments/Argument";
import Permit, { OwnerOnly } from "../permissions/Permit";

@Alias("eval")
@OwnerOnly()
export default class EvalCommand extends Command {
    @Argument({ type: new StringType(), infinite: true })
    command!: string[];

    async execute(message: Message, client: Client): Promise<any> {
        const msg = message;

        const command = this.command.join("");
        const result = await eval(command);
        return message.channel.send(result);
    }
}
