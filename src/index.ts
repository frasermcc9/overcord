import path from "path";
import Argument, { getArguments } from "./commands/arguments/Argument";
import Client from "./Client";
import Command from "./commands/Command";
import BooleanType from "./types/boolean";
import { BitField } from "discord.js";

(async () => {
    const client = new Client({ defaultCommandPrefix: "%", owners: [] });
    await client.registry.recursivelyRegisterCommands(path.join(__dirname, "./RealCommand"));

    //@ts-ignore
    client.emit("message", {
        content: "test yes 45 12",
        author: { id: "12345" },
        member: { permissions: new BitField(0) },
    });
    //@ts-ignore
    client.emit("message", { content: "hello yes 45 12", author: { id: "12345" } });
    //@ts-ignore
    client.emit("message", { content: "test yes 45 12", author: { id: "12345" } });
    //@ts-ignore
    client.emit("message", { content: "test yes 45 12", author: { id: "12345" } });
    //@ts-ignore
    client.emit("message", { content: "test yes 45 12", author: { id: "123455" } });

    // const cmd = new TestCommand(); console.log(getArguments(cmd));
    // console.log(cmd);
})();
