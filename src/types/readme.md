# Acknowledgements
The majority of the code inside this directory has been adapted from the [Discord Commando
Repository](https://github.com/discordjs/Commando), licensed under the Apache
License 2.0.

## Types
All classes in this directory are valid argument types for commands. Create new
instances of a type, and pass it into the `@Argument` function as follows:
```ts
@Alias("test")
export default class TestCommand extends Command {
    @Argument({ type: new BooleanType() })
    someBoolean!: boolean;

    async execute(message: Message) {
        console.log(`Value is ${someBoolean}.`);
    }
}
```
Basic JavaScript types, as well as many discord constructs, are supported.

## Union Type
Union types allow you to specify multiple possible valid types. In the following
example, we state that both booleans and numbers are valid arguments. 

Parsing is done in the order in which the types are passed in. In other words,
the parser will go through the arguments one at a time, and return whichever
type was the first that could be validly parsed.

```ts
@Alias("test")
export default class TestCommand extends Command {
    @Argument({ type: new UnionType(new BooleanType(), new FloatType()) })
    something!: boolean | number;

    async execute(message: Message) {
        console.log(`Value is ${something}.`);
    }
}
```

## Custom Types
Creating your own types is fairly straightforward. To do so, simply extend the
base ArgumentType class with your own custom type. Use the generic class
parameter to declare what the required type is. Now simply override the following methods:
- id (name of the type)
- validate (whether a passed string can be parsed)
- parse (turn the string into the object type)

The following is the abstract class to be extended:

```ts
export default abstract class ArgumentType<T> {
    abstract get id(): string;

    abstract validate(val: string, msg: Message): Promise<boolean> | boolean;

    abstract parse(val: string, msg: Message): Promise<T> | null | undefined;
}
```