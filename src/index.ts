import { BitField } from "discord.js";
import path from "path";
import Client from "./Client";
import Command from "./commands/Command";
import Permit from "./commands/permissions/Permit";
import Inhibit from "./commands/inhibitor/Inhibit";
import Alias from "./commands/alias/Alias";
import Argument from "./commands/arguments/Argument";

export { BooleanType, ChannelType, FloatType, IntegerType, MemberType, StringType, UnionType } from "./types/index";
export { Client, Command, Permit, Inhibit, Alias, Argument };

// (async () => {
//     const client = new Client({ defaultCommandPrefix: "%", owners: [] });
//     await client.registry.recursivelyRegisterCommands(path.join(__dirname, "./RealCommand"));

//     //@ts-ignore
//     client.emit("message", {
//         content: "%test yes 45 12",
//         author: { id: "12345" },
//         member: { permissions: new BitField(8) },
//     });
//     //@ts-ignore
//     client.emit("message", { content: "%hello yes 45 12", author: { id: "12345" } });
//     //@ts-ignore
//     client.emit("message", { content: "%test yes 45 12", author: { id: "12345" } });
//     //@ts-ignore
//     client.emit("message", { content: "%test yes 45 12", author: { id: "12345" } });
//     //@ts-ignore
//     client.emit("message", { content: "%test yes 45 12", author: { id: "123455" } });

//     // const cmd = new TestCommand(); console.log(getArguments(cmd));
//     // console.log(cmd);
// })();
