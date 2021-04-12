# Command Decorators

- [Command Decorators](#command-decorators)
  - [@Alias](#alias)
    - [Example](#example)
    - [API](#api)
  - [@Inhibit](#inhibit)
    - [Example](#example-1)
    - [API](#api-1)
    - [Command Hook](#command-hook)
  - [@Permit](#permit)
    - [Example](#example-2)
    - [API](#api-2)
    - [Command Hook](#command-hook-1)
  - [@OwnerOnly](#owneronly)
    - [Example](#example-3)
    - [API](#api-3)
    - [Command Hook](#command-hook-2)
  - [@AllowServers](#allowservers)
    - [Example](#example-4)
    - [API](#api-4)
    - [Command Hook](#command-hook-3)

Decorators provide a significant amount of functionality to your Overcord commands. Decorators are a feature currently in TypeScript that can modify the way your command classes are created. Overcord attaches metadata to your commands, which is then later used to do various useful things.

To use decorators in overcord, you must use the `@` sign, followed by the decorator function. Some decorators require arguments in Overcord.

```ts
@Decorator(args)
class MyCommand extends Command {...}
```

## @Alias
Alias is the most important decorator, and should be used on all your commands. Alias determines the names that your command can be invoked with.

### Example

```ts
@Alias("hi", "hello")
class WelcomeCommand extends Command {...}
```
In the above example, this command can be executed by typing either `"hi"` or `"hello"`.

### API
| Property | Description                                    | type          |
| -------- | ---------------------------------------------- | ------------- |
| names    | A comma-delimited list of names (not an array) | Spread string |

## @Inhibit
Inhibit provides a simple method of limiting the amount your command can be used. It is especially useful if you are creating commands that are vulnerable to spam, or can clutter up chats, or are computationally expensive.

### Example

```ts
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
class SpammableCommand extends Command {...}
```
In the above example, a user can use the command no more than 3 times within 10 seconds. Specifically, a counter is kept of the number of times the command is used. Using the command adds to the counter. After 10 seconds (or whatever periodDuration is), the counter is reduced. If the counter reaches the max uses, then the command is rejected.

```ts
@Inhibit({ limitBy: "CHANNEL", maxUsesPerPeriod: 1, periodDuration: 60 })
class SpammableCommand extends Command {...}
```
You can limit by more than just users. In this example, the command can only be used once per minute per channel.

### API
| Property          | Description                                                                             | type                           |
| ----------------- | --------------------------------------------------------------------------------------- | ------------------------------ |
| limitBy           | What to limit by                                                                        | "USER" or "CHANNEL" or "GUILD" |
| maxUsersPerPeriod | The maximum number of times the command can be used per period given in periodDuration. | number                         |
| periodDuration    | How long until the cooldown of the command is reduced, in seconds.                      | number                         |

### Command Hook

The hook `commandDidInhibt` is called when the command is inhibited. By default, it will send a message warning the user that the command has a cooldown, and then the allowed usages. If you would like to customize the message, then this method can be overridden.


## @Permit
Permit allows you ensure a command can only be used by people with the adequate
permissions. This is useful if you are trying to create commands that should
only be usable by people with privileges in the server, like deleting large
numbers of messages. You wouldn't want anyone to be able to do something like
that, or chaos would likely ensue.

### Example

```ts
@Permit("ADMINISTRATOR")
class PrivilegedCommand extends Command {...}
```
In the above example, a user cannot run this command unless they are an admin in the server. Please note that Overcord does not check for permissions outside of the permit decorator. If you have a command that bans members and you forget the permit decorator, then anyone will be able to use it.

```ts
@Permit("MANAGE_CHANNELS", "MANAGE_GUILD")
class PrivilegedCommand extends Command {...}
```
You can also declare multiple permissions the user needs to execute the command.

### API
| Property | Description                                                   | type          |
| -------- | ------------------------------------------------------------- | ------------- |
| perms    | A list of required permissions needed to execute the command. | Spread string |

### Command Hook

The hook `commandDidBlock` is called when the command is blocked due to permission issues (including OwnerOnly). By default, it will send a message warning the user that the command requires a certain permission, and what permissions it requires. If you would like to customize the message, then this method can be overridden.

## @OwnerOnly
OwnerOnly specifies commands that can only be used by the bot owner. Bot owners are declared when creating the Overcord client. This decorator is unrelated to server owners. A server owner will not be able to execute a command that is declared as owner only (unless they are, of course, an owner of the bot too). This is useful if you have very privileged commands, such as those that could manipulate the bot dynamically (i.e. by executing arbitrary JavaScript), or testing commands.

On another note, all bot owners cannot be blocked from executing commands due to lacking permissions. This means even if a bot owner has no permissions in the server, they can still successfully run privileged commands.

### Example

```ts
@OwnerOnly()
class SuperPrivilegedCommand extends Command {...}
```
In the above example, only owners in the owner array can use this command.

### API
| Property | Description              | type  |
| -------- | ------------------------ | ----- |
| (none)   | (there are no arguments) | never |

### Command Hook

The hook `commandDidBlock` is called when the command is blocked due to permission issues (including OwnerOnly). By default, it will send a message warning the user that the command requires a certain permission, and what permissions it requires. If you would like to customize the message, then this method can be overridden.

## @AllowServers
This decorator allows you to declare servers that are allowed to run the command. If this is omitted, then all servers are assumed to be allowed to run the command. This could be useful if you have commands that you want to remain exclusive to private servers. To use it, simply pass in a list of server IDs you want to allow.

### Example

```ts
@AllowServers("475740104927801117", "874768694427373883")
class PrivateServerCommand extends Command {...}
```
In the above example, the command can only be used in the guilds' with ids `475740104927801117` and `874768694427373883`.

### API
| Property  | Description                                       | type          |
| --------- | ------------------------------------------------- | ------------- |
| serverIds | A list of guild ids where the command is allowed. | Spread string |

### Command Hook

There is no command hook or default behaviour when a command is used outside of an allowed server.