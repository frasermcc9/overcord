# Arguments

Overcord supports many types of arguments, including:

- Basic Types
  - Integer
  - String
  - Float
  - Boolean
- Discord Types
  - Member
  - User
  - Channel
  - TextChannel
  - Role
- Special Types
  - Union Type

## Using Arguments

Arguments are declared as standard class fields:

```ts
export default class TestCommand extends Command {
    @Argument({ type: new BooleanType() })
    someBoolean!: boolean;

    @Argument({ type: new IntegerType(), validate: (n) => n < 50 })
    someInteger!: number;

    @Argument({ type: new UnionType(new IntegerType(), new FloatType()) })
    someNumber!: number;
}
```

To create an argument, create a new field in the command class and decorate it
with the `@Argument()` decorator. When the command is called, Overcord will
inject the appropriate values into these fields.

::: warning

To avoid errors with TypeScript, you will need to definitely assert these values
as defined (with the exclamation mark) or declare them as possibly undefined
(with the question mark).

:::

## Argument Options
The `@Argument` decorator takes a number of optional settings:

 | Option   | Description                                                                                          | Example                    |
 | :------- | :--------------------------------------------------------------------------------------------------- | :------------------------- |
 | type     | The datatype of the argument. The command will not run if the argument is not of this type.          | `new IntegerType()`        |
 | validate | A function to run to check if the argument is valid. (v: ArgumentType) => boolean                    | `(str) => str.length < 50` |
 | default  | A default value, if no argument is given by the user. Must be declared after non-optional arguments. | `"Hello"`                  |
 | optional | If the argument can be omitted. Optional arguments must be declared after non-optional arguments.    | `true`                     |

## Union Types
Union types are special types, in which the argument can be any number of
types. Consider the following:

```ts
export default class Something {
  @Argument({ type: new UnionType(new BooleanType(), new FloatType()) })
  someArgument!: boolean | number;
}
```

Union types can be passed several other types in its constructor. Overcord will attempt to parse the given argument to one of the types given. It will try to prioritize the earlier entered arguments (in the example above, it will first try to to parse the given argument to a boolean, and then a number if that fails).