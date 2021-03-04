import ArgumentType from "./base";

export default class StringType extends ArgumentType<string> {
    constructor() {
        super();
    }

    get id(): string {
        return "String";
    }

    validate(val: string) {
        return true;
    }

    parse(val: string) {
        return val;
    }
}
