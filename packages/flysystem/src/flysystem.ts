// import {
//     VisibilityEnum, IFilesystemOperator, IFilesystemConfig,
//     isReadableStream, WhitespacePathNormalizer, InvalidStreamProvidedException,
// } from '@flysystem-ts/common';
// import get from 'lodash/get';
// import { Readable } from 'stream';
// import { Type as ClassGenericType } from './types/class-generic-type.interface';

// export class Filesystem<T extends IFilesystemAdapter> implements IFilesystemOperator {
//     static LIST_SHALLOW = false;

//     static LIST_DEEP = true;

//     private static _adapter: {
//     [s: string]: ClassGenericType<IFilesystemAdapter>;
//   } = {};

//     public constructor(
//     protected adapter: T,
//     protected config: IFilesystemConfig = {},
//     protected pathNormalizer = new WhitespacePathNormalizer(),
//     ) { }

//     public getAdapter() {
//         return this.adapter;
//     }

//     protected getConfig(key: keyof IFilesystemConfig, defaultValue?: any) {
//         return get(this.config, key, defaultValue);
//     }

//     public fileExists(location: string): Promise<boolean> {
//         return this.adapter.fileExists(this.pathNormalizer.normalizePath(location));
//     }

//     public directoryExists(location: string): Promise<boolean> {
//         return this.adapter.directoryExists(this.pathNormalizer.normalizePath(location));
//     }

//     public async write(path: string, contents: string | Buffer, config?: any) {
//         return this.getAdapter().write(this.pathNormalizer.normalizePath(path), contents, config);
//     }

//     public async writeStream(path: string, resource: Readable, config?: Record<string, any>) {
//         if (!isReadableStream(resource)) {
//             throw new InvalidStreamProvidedException('writeStream expects argument #2 to be a valid readStream.');
//         }

//         // eslint-disable-next-line no-param-reassign
//         path = this.pathNormalizer.normalizePath(path);
//         // eslint-disable-next-line no-param-reassign
//         config = this.prepareConfig(config);

//         // TODO: rewindStream

//         return this.getAdapter().writeStream(path, resource, config);
//     }

//     public read(path: string, config?: any) {
//         return this.getAdapter().read(this.pathNormalizer.normalizePath(path), config);
//     }

//     public readStream(path: string, config?: any) {
//         return this.getAdapter().readStream(this.pathNormalizer.normalizePath(path), config);
//     }

//     public copy(path: string, newPath: string, config?: any) {
//         return this.getAdapter().copy(
//             this.pathNormalizer.normalizePath(path),
//             this.pathNormalizer.normalizePath(newPath),
//             config,
//         );
//     }

//     public async delete(path: string) {
//         return this.getAdapter().delete(this.pathNormalizer.normalizePath(path));
//     }

//     public deleteDirectory(dirname: string) {
//         return this.getAdapter().deleteDirectory(this.pathNormalizer.normalizePath(dirname));
//     }

//     public createDirectory(dirname: string, config?: any) {
//         // eslint-disable-next-line no-param-reassign
//         config = this.prepareConfig(config);

//         return this.getAdapter().createDirectory(this.pathNormalizer.normalizePath(dirname), this.prepareConfig(config));
//     }

//     public async listContents(directory = '', recursive = Filesystem.LIST_DEEP) {
//         return this.getAdapter().listContents(this.pathNormalizer.normalizePath(directory), recursive);
//     }

//     public async mimeType(path: string) {
//         return (await this.getAdapter().mimeType(this.pathNormalizer.normalizePath(path))).mimeType;
//     }

//     public async lastModified(path: string) {
//         return (await this.getAdapter().lastModified(this.pathNormalizer.normalizePath(path))).lastModified;
//     }

//     public async visibility(path: string) {
//         return (await this.getAdapter().visibility(this.pathNormalizer.normalizePath(path))).visibility;
//     }

//     public async fileSize(path: string) {
//         return (await this.getAdapter().fileSize(this.pathNormalizer.normalizePath(path))).fileSize;
//     }

//     public setVisibility(path: string, visibility: VisibilityEnum | string) {
//         return this.getAdapter().setVisibility(this.pathNormalizer.normalizePath(path), visibility as VisibilityEnum);
//     }

//     public move(source: string, destination: string, config?: Record<string, any>): Promise<void> {
//         return this.getAdapter().move(
//             this.pathNormalizer.normalizePath(source),
//             this.pathNormalizer.normalizePath(destination),
//             this.prepareConfig(config),
//         );
//     }

//     protected prepareConfig(config?: any) {
//         return config;
//     }

//     static adapter(): { [s: string]: ClassGenericType<IFilesystemAdapter> };

//     static adapter(name: string): ClassGenericType<IFilesystemAdapter> | void;

//     static adapter(name: string, adapter: ClassGenericType<IFilesystemAdapter>): void;

//     static adapter(
//         name?: string,
//         adapter?: ClassGenericType<IFilesystemAdapter>,
//     ): { [s: string]: ClassGenericType<IFilesystemAdapter> } | ClassGenericType<IFilesystemAdapter> | void {
//         if (!name && !adapter) {
//             return this._adapter;
//         }

//         if (name && adapter) {
//             this._adapter[name] = adapter;
//         }

//         if (name && !adapter) {
//             return this._adapter[name];
//         }

//         return undefined;
//     }
// }
