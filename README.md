![](https://progress-bar.dev/40/?title=in_progress)

# Flysystem-ts
File storage library for Node.js

### Description
Node.js library for working with any storage system, for example DropBox, GoogleDrive, OneDrive etc.
This library was created for two main purposes:
* provide common usage interface for client code to operate with any of storages
* provide simple way to create custom storage usage implementation with common concept

> One of the main features and purposes of this library
> is possibility to provide simple way for everyone to became part of this project.
> You may create your own adapters that will be compatible with general modules and powered by them.
> Another feature is partial typing. Your adapter may not implement completely all interface, but only part.
> And that's enough. It simply will use as such not-completed type, so you still use it and
> you can't call not-implemented methods at once.
---
> Also note, that project is at the development state.
> So many things are ready to change.
> Especially in future this library should provide flexibility not only to partial implementation
> in adapters but also computed typings etc... And all of this will be strongly typed in dynamic!

### Main Features:
* Common interface for every storage
* Customizable and open to setting interfaces
* Typings and flexibility natures in one box

## General modules (you should use them for create own adapters):
* [Common](./packages/common) => base types, concepts, interfaces etc.
* [Flysystem](./packages/flysystem) => main class for initiate adapter instance
* [Adapter Interface](./packages/adapter-interface) => Minimal stuff that each adapter should implement with a bunch of methods that should be implemented by adapter optionally

## Adapters that are ready out of the box:
* [DropBox adapter](./packages/drop-box-adapter/README.md)
* [GoogleDrive adapter](./packages/google-drive-adapter/README.md)
* [OneDrive adapter](./packages/one-drive-adapter)

## [You also may create your own custom adapter with CLI help](#TODO) => TODO

## Install:
```
npm i @flysystem-ts/flysystem @flysystem-ts/google-drive-adapter
```

# How it looks in code:
#### StorageItem
```ts
/**
 * Each item from any storage should implement such interface
 * (in future it also will became more custom cumputed and generic)
 */
export type StorageItem = {
    id?: string | null;
    isFolder?: boolean | null;
    name?: string | null;
    mimeType?: string | null;
    size?: number | string | null;
    extension?: string | null;
    trashed?: boolean | null;
    parentFolderId?: string | null;
    parentFolderName?: string | null;
    path?: string | null;
}
```
#### Methods
Recently such methods are allowed to be implemented in adapter:
* getById
* deleteById
* mkDirById
* uploadById
* downloadById

## Example:

```ts
import { Dropbox } from 'dropbox';
import { google } from 'googleapis';
import { Flysystem } from '@flysystem-ts/flysystem';
import { DBoxAdapter } from '@flysystem-ts/drop-box-adapter';
import { GDriveAdapter } from '@flysystem-ts/google-drive-adapter';

const dBoxAdapter = new DBoxAdapter(new Dropbox());
const dBoxFlysystem = Flysystem.init<DBoxAdapter>(dBoxAdapter);
const gDriveFlysystem = Flysystem.init<GDriveAdapter>(google.drive({ version: 'v3', auth: new google.auth.OAuth2() }));

Promise.all([
    dBoxAdapter.getById('your-id-in-drop-box-storage'),
    gDriveFlysystem.getById('your-in-google-drive'),
]).then((res) => res.forEach((i) => console.log(i)));
```

#### For more details see links above for each adapter/module separately

# Attention!
This project is developing right! His versions may be incompatible with each other.
