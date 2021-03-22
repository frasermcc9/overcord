# Initial Setup

## Directory Setup

Your directory needs to be setup in a particular way in order to use overcord.
The following assumes you are using the `tsconfig.json` file that was provided
in a previous section.

- Create a directory containing all your TypeScript files, `./src`. This should
  be the same as the `rootDir` directory in your `tsconfig.json`.
- Inside this directory, create an `index.ts` file, as well as a directory named
  `commands` and a directory named `events`.

## Index Setup

Open `index.ts` and place the following code inside. This will be all we need to
create a simple bot that is capable of executing commands and events. Make sure
to put your token from Discord inside the `client.login()` method.

```ts
import { Client } from "@frasermcc/overcord";
import path from "path";

(async () => {
    const client = new Client({ defaultCommandPrefix: "!", owners: [], disableMentions: "everyone" });
    await client.registry.recursivelyRegisterCommands(path.join(__dirname, "/commands"));
    await client.registry.recursivelyRegisterEvents(path.join(__dirname, "/events"));
    client.login("YOUR_TOKEN");
})();
```
First we create the Client object, and pass in some settings. We can pass in any
settings that a normal Discord.js client can have, as well as a
`defaultCommandPrefix` and the bot `owners`. 

We then register our directory of commands and events. In this case, we register
our commands from the `commands` directory, and our events from the `events`
directory. In reality, you can choose any directory. 

::: tip 

If you only have commands, then you don't have to register events.
Likewise, if you only have events, then you don't need to register a commands
directory. 

:::

Finally, we log our bot in using our token.