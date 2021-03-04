import ArgumentType from "./base";

export default class BooleanType extends ArgumentType<boolean> {
    private truthy: Set<string>;
    private falsy: Set<string>;

    constructor() {
        super();
        this.truthy = new Set(["true", "t", "yes", "y", "on", "enable", "enabled", "1", "+"]);
        this.falsy = new Set(["false", "f", "no", "n", "off", "disable", "disabled", "0", "-"]);
    }

    get id(): string {
        return "Boolean";
    }

    validate(val: string) {
        const lc = val.toLowerCase();
        return this.truthy.has(lc) || this.falsy.has(lc);
    }

    parse(val: string) {
        const lc = val.toLowerCase();
        if (this.truthy.has(lc)) return true;
        if (this.falsy.has(lc)) return false;
        throw new RangeError("Unknown boolean value.");
    }
}
