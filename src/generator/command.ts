import prompts from "prompts";
import { blue, red } from "colors";
import { mkdirSync, writeFile, writeFileSync } from "fs";

const template = (commandName: string) => `
import { Alias, Client, Command } from "@frasermcc/overcord";
import { Message } from "discord.js";

@Alias("${commandName.toLowerCase()}")
export default class ${commandName}Command extends Command {
    execute(message: Message, client: Client): Promise<any> {
        return message.channel.send("Hello");
    }
}
`;

(async () => {
  const { path } = await prompts({
    type: "text",
    name: "path",
    message: "Where would you like to place the new command?",
  });

  if (!path) {
    console.log(red("No path provided"));
    process.exit(0);
  }

  const { fileName } = await prompts({
    type: "text",
    name: "fileName",
    message: "What would you like to name the command?",
  });

  if (!fileName) {
    console.log(red("No command name provided"));
    process.exit(0);
  }

  mkdirSync(path, { recursive: true });
  process.chdir(path);

  writeFileSync(fileName + ".ts", template(fileName));
})();
