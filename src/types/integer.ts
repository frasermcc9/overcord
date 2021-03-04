import ArgumentType from "./base";

export default class IntegerType extends ArgumentType<number> {
    constructor() {
        super();
    }

    get id(): string {
        return "Integer";
    }

    validate(val: string) {
        const int = Number.parseInt(val);
        if (Number.isNaN(int)) return false;
        return true;
    }

    parse(val: string) {
        return Number.parseInt(val);
    }
}
