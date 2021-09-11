import { BitField } from "discord.js";
import path from "path";
import Client from "./client/Client";
import Command from "./commands/Command";
import Permit, { OwnerOnly, AllowServers } from "./commands/permissions/Permit";
import Inhibit from "./commands/inhibitor/Inhibit";
import Alias from "./commands/alias/Alias";
import Argument from "./commands/arguments/Argument";
import DiscordEvent from "./events/BaseEvent";
import NextCommand from "./commands/NextCommand";
import ModuleConfig from "./commands/ModuleConfig";
import { LogEntry, Logger, FullLogEntry } from "./util/LoggingMixin";
import Stateful, { State } from "./commands/state/Stateful";

export {
  BooleanType,
  ChannelType,
  FloatType,
  IntegerType,
  MemberType,
  StringType,
  UnionType,
  RoleType,
  TextChannelType,
  UserType,
  BaseType,
} from "./types/index";

export {
  Client,
  Command,
  Permit,
  Inhibit,
  Alias,
  Argument,
  DiscordEvent,
  OwnerOnly,
  AllowServers,
  NextCommand,
  ModuleConfig,
  LogEntry,
  Logger,
  FullLogEntry,
  State,
  Stateful,
};

(async () => {
  // const client = new Client({ defaultCommandPrefix: "%", owners: [] });
  // await client.registry.recursivelyRegisterCommands(path.join(__dirname, "./RealCommand"));
  // await client.registry.recursivelyRegisterEvents(path.join(__dirname, "./RealCommand"));
  // //client.guildSettingsManager.disableGroupInGuild({ guild: "guild123", groupName: "base", shouldBeDisabled: true });
  // //@ts-ignore
  // client.emit("message", {
  //     content: `%test yes 45 12 1 5 6 7 8 `,
  //     author: { id: "12345" },
  //     member: { permissions: new BitField(8) },
  //     guild: { id: "guild123" },
  // });
  // //@ts-ignore
  // client.emit("message", { content: "%hello yes 45 12", author: { id: "12345" } });
  // //@ts-ignore
  // client.emit("message", { content: "%test yes 45 12", author: { id: "12345" } });
  //@ts-ignore
  //client.emit("message", { content: "%test yes 45 12", author: { id: "12345" } });
  //@ts-ignore
  // client.emit("message", { content: "%test yes 45 12", author: { id: "123455" } });
})();
