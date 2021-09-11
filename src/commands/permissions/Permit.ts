import {
  BitFieldResolvable,
  Message,
  PermissionString,
  Permissions as DiscordPermissions,
  GuildMember,
} from "discord.js";
import Client from "../../client/Client";

const metadataKey = Symbol("CommandPermission");
const ownerKey = Symbol("OwnerOnly");
const serverKey = Symbol("AllowServer");
type Permissions = BitFieldResolvable<PermissionString, bigint>;

export default function Permit(...perms: Permissions[]): (constructor: Function) => void {
  return function registerPermission(constructor: Function): void {
    let properties: Permissions[] = Reflect.getMetadata(metadataKey, constructor);

    if (properties) {
      properties.push(perms);
    } else {
      properties = [perms];
      Reflect.defineMetadata(metadataKey, properties, constructor);
    }
  };
}

export function OwnerOnly(): (constructor: Function) => void {
  return function registerOwnerOnly(constructor: Function): void {
    let properties: boolean[] = Reflect.getMetadata(ownerKey, constructor);

    if (properties) {
      properties.push(true);
    } else {
      properties = [true];
      Reflect.defineMetadata(ownerKey, properties, constructor);
    }
  };
}

export function AllowServers(...serverIds: string[]): (constructor: Function) => void {
  return function registerPermission(constructor: Function): void {
    let properties: string[] = Reflect.getMetadata(serverKey, constructor);

    if (properties) {
      properties.push(...serverIds);
    } else {
      properties = serverIds;
      Reflect.defineMetadata(serverKey, properties, constructor);
    }
  };
}

export function getPermissions(origin: Function) {
  const properties: Permissions[][] = Reflect.getMetadata(metadataKey, origin);
  return properties;
}

export function getOwnerOnly(origin: Function) {
  const properties: boolean[] = Reflect.getMetadata(ownerKey, origin);
  return properties;
}

export function getAllowedServers(origin: Function) {
  const properties: string[] = Reflect.getMetadata(serverKey, origin);
  return properties;
}

export class PermissionManager {
  private permissionBitfield;
  private ownerOnly = false;
  private allowedServers: string[] = [];

  constructor(permissions?: Permissions[], ownerOnly?: boolean, allowedServers?: string[]) {
    if (ownerOnly) {
      this.ownerOnly = true;
      return;
    }
    if (permissions) {
      this.permissionBitfield = new DiscordPermissions();
      this.permissionBitfield.add(permissions);
      return;
    }
    if (allowedServers) {
      this.allowedServers = allowedServers;
    }
  }

  getAllowedServers() {
    return this.allowedServers.slice();
  }

  get permissions() {
    if (this.permissionBitfield?.equals(DiscordPermissions.FLAGS.ADMINISTRATOR)) return ["ADMINISTRATOR"];
    return this.permissionBitfield?.toArray();
  }

  usePermissionManager(): boolean {
    return this.permissionBitfield != undefined;
  }

  userHasPermissions(message: Message, client: Client): boolean {
    if (client.isOwner(message.author.id)) {
      return true;
    }
    if (this.ownerOnly) {
      return false;
    }
    if (this.permissionBitfield == undefined) {
      return true;
    }
    if (message?.channel?.type === "DM") {
      return true;
    }

    return message.member?.permissions.has(this.permissionBitfield) ?? false;
  }
}
