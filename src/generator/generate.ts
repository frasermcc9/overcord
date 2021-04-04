#!/usr/bin/env node

import { execSync } from "child_process";
import cliProgress from "cli-progress";
import { blue, red } from "colors";
import { mkdirSync, writeFileSync } from "fs";
import prompts from "prompts";

(async () => {
    {
        const { confirm } = await prompts({
            type: "confirm",
            name: "confirm",
            message: "This will create a new directory and create all necessary Overcord files inside. Continue?",
        });

        if (!confirm) {
            console.log(red("Cancelled script."));
            process.exit(0);
        }
    }
    {
        const { dir } = await prompts({
            type: "text",
            name: "dir",
            message: "What is the name of the directory?",
        });
        if (!dir) {
            console.log(red("No name provided."));
            process.exit(0);
        }
        console.log(blue("Working..."));
        createDirectory(dir);
    }
})();

function createDirectory(dir: string) {
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(200, 0);

    mkdirSync(dir);
    process.chdir("./" + dir);

    progressBar.update(10);

    generatePackage(dir);

    progressBar.update(20);

    execSync("git init");

    progressBar.update(30);

    generateTsConfig();

    progressBar.update(40);

    generateEnv();
    progressBar.update(50);

    generateGitIgnore();
    progressBar.update(60);

    execSync("npm i");

    progressBar.update(160);

    mkdirSync("src");
    process.chdir("./src");
    generateIndex();
    mkdirSync("commands");
    mkdirSync("events");

    progressBar.update(180);

    process.chdir("commands");
    createExampleCommand();

    progressBar.update(200);

    progressBar.stop();
}

function generatePackage(dirName: string) {
    const text = `{
        "name": "${dirName.toLocaleLowerCase()}",
        "version": "1.0.0",
        "description": "",
        "main": "build/index.js",
        "scripts": {
            "start": "run-p watch daemon",
            "watch": "tsc --watch",
            "daemon": "nodemon --delay 1000ms",
            "build": "rimraf ./build && tsc",
            "test": "ts-mocha ./src/test/**/*.test.ts",
            "prestart": "npm run build",
            "create-command": "node ./node_modules/@frasermcc/overcord/build/generator/command.js"
        },
        "keywords": [],
        "author": "",
        "license": "ISC",
        "dependencies": {
            "@frasermcc/overcord": "0.4.1",
            "@frasermcc/log": "^1.0.0",
            "discord.js": "^12.5.1",
            "dotenv": "^8.2.0"
        },
        "devDependencies": {
            "@types/node": "^14.14.31",
            "mocha": "^8.2.1",
            "nodemon": "^2.0.7",
            "npm-run-all": "^4.1.5",
            "rimraf": "^3.0.2",
            "typescript": "^4.2.3"
        }
    }
`;
    writeFileSync("./package.json", text);
}

function generateTsConfig() {
    const text = `{
        "compilerOptions": {
            "target": "es2020" ,
            "module": "commonjs" ,
            "allowJs": true ,
            "checkJs": false ,
            "declaration": true ,
            "declarationMap": true ,
            "sourceMap": true ,
            "outDir": "./build" ,
            "rootDir": "./src" ,
            "strict": true ,
            "esModuleInterop": true ,
            "experimentalDecorators": true ,
            "emitDecoratorMetadata": true ,
            "skipLibCheck": true ,
            "forceConsistentCasingInFileNames": true 
        },
        "include": ["src/**/*.ts", "typings/**/*.d.ts"]
    }`;
    writeFileSync("./tsconfig.json", text);
}

function generateIndex() {
    const text = `
    import Log from "@frasermcc/log";
    import { Client } from "@frasermcc/overcord";
    import path from "path";
    require("dotenv").config();
    
    (async () => {    
        const client = new Client({
            defaultCommandPrefix: "%",
            owners: ["202917897176219648"],
            disableMentions: "everyone",
        });
        await client.registry.recursivelyRegisterCommands(
            path.join(__dirname, "./commands")
        );
        await client.registry.recursivelyRegisterEvents(
            path.join(__dirname, "./events")
        );
        await client.login(process.env.DISCORD_TOKEN);
        Log.info("Logged in successfully");
    })();
    
    `;

    writeFileSync("./index.ts", text);
}

function generateEnv() {
    const text = `
BOT_NAME=
DISCORD_TOKEN=
    `;

    writeFileSync("./.env", text);
}

function generateGitIgnore() {
    const text = `
node_modules
build
.env
        `;

    writeFileSync("./.gitignore", text);
}

function createExampleCommand() {
    const text = `
import { Alias, Client, Command } from "@frasermcc/overcord";
import { Message } from "discord.js";

@Alias("test")
export default class TestCommand extends Command {
    execute(message: Message, client: Client): Promise<any> {
        return message.channel.send("Hello");
    }
}
`;

    writeFileSync("./TestCommand", text);
}
