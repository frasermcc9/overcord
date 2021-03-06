import ArgumentType from "./base";

export default class UnionType extends ArgumentType<any> {
    private _types: ArgumentType<any>[];

    constructor(...types: ArgumentType<any>[]) {
        super();
        this._types = types;
    }

    get types() {
        return this._types;
    }

    get id(): string {
        return `(${this.types.map((t) => t.id).join(" or ")})`;
    }

    validate(val: string) {
        for (const type of this.types) {
            if (type.validate(val)) {
                return true;
            }
        }
        return false;
    }

    parse(val: string) {
        for (const type of this.types) {
            if (type.validate(val)) {
                return type.parse(val);
            }
        }
        throw new RangeError(`Provided argument ${val} cannot be assigned to one of the required types: ${this.id}.`);
    }
}
