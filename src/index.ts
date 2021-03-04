import path from "path";
import Argument, { getArguments } from "./annotations/Argument";
import Client from "./Client";
import Command from "./commands/Command";
import BooleanType from "./types/boolean";

(async () => {
    const client = new Client({ defaultCommandPrefix: "%", owners: [] });
    await client.registry.recursivelyRegisterCommands(path.join(__dirname, "./RealCommand"));

    //@ts-ignore
    client.emit("message", { content: "hello yes  45" });

    // const cmd = new TestCommand(); console.log(getArguments(cmd));
    // console.log(cmd);
})();
