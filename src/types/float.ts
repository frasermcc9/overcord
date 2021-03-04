import ArgumentType from "./base";

export default class FloatType extends ArgumentType<number> {
    constructor() {
        super();
    }

    get id(): string {
        return "Float";
    }

    validate(val: string) {
        const float = Number.parseFloat(val);
        if (Number.isNaN(float)) return false;
        return true;
    }

    parse(val: string) {
        return Number.parseFloat(val);
    }
}
