import { BitFieldResolvable, Message, PermissionString, Permissions as DiscordPermissions } from "discord.js";
import Client from "../../client/Client";

const metadataKey = Symbol("CommandPermission");
const ownerKey = Symbol("OwnerOnly");
type Permissions = BitFieldResolvable<PermissionString>;

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

export function getPermissions(origin: Function) {
    const properties: Permissions[][] = Reflect.getMetadata(metadataKey, origin);
    return properties;
}

export function getOwnerOnly(origin: Function) {
    const properties: boolean[] = Reflect.getMetadata(ownerKey, origin);
    return properties;
}

export class PermissionManager {
    private permissionBitfield;
    private ownerOnly = false;

    constructor(permissions?: Permissions[], ownerOnly?: boolean) {
        if (ownerOnly) {
            this.ownerOnly = true;
            return;
        }
        if (permissions) {
            this.permissionBitfield = new DiscordPermissions();
            this.permissionBitfield.add(permissions);
            return;
        }
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
        if (message?.channel?.type === "dm") {
            return true;
        }

        return message.member?.permissions.has(this.permissionBitfield) ?? false;
    }
}
