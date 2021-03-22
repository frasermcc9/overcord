# Installation

## Requirements
- At least NodeJs 14
- TypeScript (npm i -g typescript)

## Preparation
Prepare your project directory by running `npm init` inside an empty directory.
Inside that directory, also run `tsc --init`.

Inside the new `tsconfig.json` file, you need to enable experimental support for
decorators. Alternatively, replace all of the contents with the following preset:
```json
{
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
}

```

## Install from NPM
You can now install Overcord from the npm registry:

`npm i @frasermcc/overcord`
