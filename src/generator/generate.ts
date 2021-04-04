#!/usr/bin/env node

import prompts from "prompts";
import { blue, red } from "colors";
import { mkdir, mkdirSync, writeFileSync } from "fs";
import { exec, execSync } from "child_process";
import touch from "touch";
import cliProgress from "cli-progress";

(async () => {
    {
        const { confirm } = await prompts({
            type: "confirm",
            name: "confirm",
            message: "This will create a new directory and create all necessary Overcord files inside. Continue?",
        });

        if (!confirm) {
            console.log(red("Cancelled script."));
            process.exit(1);
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
            process.exit(1);
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

    execSync("npm init -y");

    progressBar.update(20);

    execSync("git init");

    progressBar.update(30);

    execSync("tsc --init");

    progressBar.update(40);

    execSync("npm i @frasermcc/overcord dotenv");

    progressBar.update(80);

    execSync("npm i -D @types/node nodemon npm-run-all rimraf");

    progressBar.update(130);

    execSync("mkdir src");
    process.chdir("./src");
    touch.sync("index.ts");
    mkdirSync("commands");
    mkdirSync("events");

    progressBar.update(200);

    progressBar.stop();
}

function generatePackage(dirName: string) {
    const text = `{
        "name": "${dirName}",
        "version": "1.0.0",
        "description": "",
        "main": "build/index.js",
        "scripts": {
            "start": "run-p watch daemon",
            "watch": "tsc --watch",
            "daemon": "nodemon --delay 1000ms",
            "build": "rimraf ./build && tsc",
            "test": "ts-mocha ./src/test/**/*.test.ts",
            "prestart": "npm run build"
        },
        "keywords": [],
        "author": "",
        "license": "ISC",
        "dependencies": {
            "@frasermcc/overcord": "file:../overcord",
            "discord.js": "^12.5.1",
            "dotenv": "^8.2.0",
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
}
