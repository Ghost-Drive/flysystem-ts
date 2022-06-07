# `@flysystem-ts/google-drive-adapter`

## Description:
This adapter allows you to work with [GoogleDrive](https://drive.google.com/).
Under the hood it use official [GoogleDrive SDK for node.js](https://developers.google.com/drive/api/quickstart/nodejs).
It works in composite with main [Flysystem class](#TODO). Also you may find useful codebase in [@flysystem-ts/common](#TODO) module.

## Specifics of this adapter:
Because of specific of Google drive, the folder structure is generates each your request. Because under the hood oogle store files something like link-list. We can get any file by its id and see its parentId for understand level up folder. But for generate virtual path, friendly for simple users, we should scan full drive. In future the cache mechanizm will be added (it will be default, based on Map, Set... etc. and also we will provide method to add your own cacher, for example with Redis help)

## Usage
* [Import and construct](#import-and-construct-example)
* [Upload](#upload-example)
* [Move](#move-example)
* [Rename](#move-example)
* [Copy](#copy-example)

#### Import and construct example:
```
import { Flysystem } from '@flysystem-ts/flysystem';
import { GoogleDriveAdapter } from '@flysystem-ts/drop-box-adapter;
import { join } from 'path'
import 'dotenv/config';


async function example() {
    const oaut2Client = {} // ... see documentation how make authentication in googleapis
    const gDriveAdapter = new GoogleDriveAdapter(oauth2Client);
    const flysystem = new Filesystem(dropBoxAdapter);
}
```

#### Upload example:
```
import fs from 'fs';

async function upload(flysystem: Filesystem<DropboxAdapter>) {
    const pathToFile = join(__dirname, 'relative/path/to/your/file.mp4');

    await flysystem.writeStream('your/google-drive/file.mp4', fs.readFileSync(pathToFile));
}
```

#### Move (or rename) example:
```
// TODO
```
#### Copy example:
```
// TODO
```
