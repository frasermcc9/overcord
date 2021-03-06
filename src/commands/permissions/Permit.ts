import { BitFieldResolvable, Message, PermissionString, Permissions as DiscordPermissions } from "discord.js";

const metadataKey = Symbol("CommandPermission");
type Permissions = BitFieldResolvable<PermissionString>;

export default function Permit(...perms: Permissions[]): (constructor: Function) => void {
    return function registerArgument(constructor: Function): void {
        let properties: Permissions[] = Reflect.getMetadata(metadataKey, constructor);

        if (properties) {
            properties.push(perms);
        } else {
            properties = [perms];
            Reflect.defineMetadata(metadataKey, properties, constructor);
        }
    };
}

export function getPermissions(origin: Function) {
    const properties: Permissions[][] = Reflect.getMetadata(metadataKey, origin);
    return properties;
}

export class PermissionManager {
    private permissionBitfield;

    constructor(permissions?: Permissions[]) {
        if (!permissions) {
            return;
        }

        this.permissionBitfield = new DiscordPermissions();
        this.permissionBitfield.add(permissions);
    }

    get permissions() {
        if (this.permissionBitfield?.equals(DiscordPermissions.FLAGS.ADMINISTRATOR)) return ["ADMINISTRATOR"];
        return this.permissionBitfield?.toArray();
    }

    usePermissionManager(): boolean {
        return this.permissionBitfield != undefined;
    }

    userHasPermissions(message: Message): boolean {
        if (this.permissionBitfield == undefined) {
            return true;
        }
        if (message?.channel?.type === "dm") {
            return true;
        }

        return message.member?.permissions.has(this.permissionBitfield) ?? false;
    }
}
