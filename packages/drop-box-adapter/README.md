# `@flysystem-ts/drop-box-adapter`
# [Home](../../README.md)
## Description:
This adapter allows you to work with [DropBox](https://www.dropbox.com/home).
Under the hood it uses official [DropBox SDK for node.js](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html).
It works in composite with main [Flysystem class](../flysystem/README.md). Also, you may find useful codebase in [@flysystem-ts/common](../common/README.md) module.

## Usage
* [Import and construct](#import-and-construct-example)
* [Upload](#upload-example)
* [Move](#move-example)
* [Rename](#move-example)
* [Copy](#copy-example)

#### Import and construct example:
```ts
import { Flysystem } from '@flysystem-ts/flysystem';
import { DBoxAdapter } from '@dflysystem-ts/drop-box-adapter';
import { join } from 'path'
import { readFileSync } from 'fs';
import 'dotenv/config';


async function example() {
    const dropBoxAdapter = new DBoxAdapter({ accessToken: process.env.DBX_ACCESS });
    const flysystem = Flysystem<DBoxAdapter>(dropBoxAdapter);
    
    const { id } = await flysystem.mkdirById({
        name: 'example'
    });
    const item = await flysystem.uploadById(readFileSync(join(__dirname, 'hi.txt')), {
        name: 'hi.txt',
        rootDirId: id,
    });
}
```

#### Upload example:
```ts
import fs from 'fs';

async function upload(flysystem: Flysystem<DropboxAdapter>) {
    const pathToFile = join(__dirname, 'relative/path/to/your/file.mp4');

    await flysystem.uploadById(fs.readFileSync(pathToFile), {
        name: 'cool.mp4',
    });
}
```
