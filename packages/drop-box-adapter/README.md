# `@flysystem-ts/drop-box-adapter`

## Description:
This adapter allows you to work with [DropBox](https://www.dropbox.com/home).
Under the hood it use official [DropBox SDK for node.js](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html).
It works in composite with main [FileSystem class](#TODO). Also you may find useful codebase in [@draft-flysystem-ts/general](#TODO) module.

## Specifics of this adapter:
Be careful. This adapter does not support "_visibility_" property and related to it methods. This is due to the characteristics of the DropBox storage. Exception will be thrown. Also, since the official SDK does not work with streams, such methods as "_.readStream()_", "_.writeStream()_" also does not supported. But these methods will be support in the future. Follow the updates of this repository.

## Usage
* [Import and construct](#import-and-construct-example)
* [Upload](#upload-example)
* [Move](#move-example)
* [Rename](#move-example)
* [Copy](#copy-example)

#### Import and construct example:
```
import { Filesystem } from '@draft-flysystem-ts/flysystem';
import { DropboxAdapter } from '@draft-flysystem-ts/drop-box-adapter;
import { join } from 'path'
import 'dotenv/config';


async function example() {
    const dropBoxAdapter = new DropboxAdapter({ accessToken: process.env.DBX_ACCESS });
    const flysystem = new Filesystem(dropBoxAdapter);
}
```

#### Upload example:
```
import fs from 'fs';

async function upload(flysystem: Filesystem<DropboxAdapter>) {
    const pathToFile = join(__dirname, 'relative/path/to/your/file.mp4');

    await flysystem.write('your/drop-box/file.mp4', fs.readFileSync(pathToFile));
}
```

#### Move (or rename) example:
```
async function move(flysystem: Filesystem<DropboxAdapter>) {
    await flysystem.move('your-dropbox/old-folder/file.mp4', 'your-dropbox/new-folder/file.mp4');
}
```
#### Copy example:
```
async function move(flysystem: Filesystem<DropboxAdapter>) {
    await flysystem.copy('your-dropbox/origin-file.mp4', 'your-dropbox/copy-file.mp4');
}
```
