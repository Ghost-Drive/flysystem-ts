# `@flysystem-ts/google-drive-adapter`
# [Home](../../README.md)

## Description:
This adapter allows you to work with [GoogleDrive](https://drive.google.com/).
Under the hood it uses official [GoogleDrive SDK for node.js](https://developers.google.com/drive/api/quickstart/nodejs).
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
import { GDriveAdapter } from '@flysystem-ts/google-drive-adapter';
import { join } from 'path';
import { google } from 'googleapis';
import 'dotenv/config';


async function example() {
    const oaut2Client = {} // ... see documentation how make authentication in googleapis
    const gDriveAdapter = new GoogleDriveAdapter(google.drive({ version: 'v3', auth: oauth2Client });
    const flysystem = Filesystem.init(dropBoxAdapter);
}
```

#### Upload example:
```ts
import fs from 'fs';

async function upload(flysystem: Filesystem) {
    const pathToFile = join(__dirname, 'relative/path/to/your/file.mp4');

    await flysystem.uploadById(fs.readFileSync(pathToFile), {
        name: 'cool.mp4',
    });
}
```
