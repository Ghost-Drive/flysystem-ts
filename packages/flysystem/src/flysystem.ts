import {
    VisibilityEnum, IFilesystemOperator, IFilesystemConfig,
    isReadableStream, WhitespacePathNormalizer, InvalidStreamProvidedException, PathOrId,
} from '@flysystem-ts/common';
import get from 'lodash/get';
import { Readable } from 'stream';
import { IFlysystemAdapter } from '@flysystem-ts/adapter-interface';
import { Type as ClassGenericType } from './types/class-generic-type.interface';

export class Flysystem<T extends IFlysystemAdapter> implements IFilesystemOperator {
    static LIST_SHALLOW = false;

    static LIST_DEEP = true;

    private static _adapter: {
    [s: string]: ClassGenericType<IFlysystemAdapter>;
  } = {};

    public constructor(
    protected adapter: T,
    protected config: IFilesystemConfig = {},
    protected pathNormalizer = new WhitespacePathNormalizer(),
    ) { }

    public getAdapter() {
        return this.adapter;
    }

    protected getConfig(key: keyof IFilesystemConfig, defaultValue?: any) {
        return get(this.config, key, defaultValue);
    }

    public fileExists(pathOrId: PathOrId): Promise<boolean> {
        return this.adapter.fileExists(pathOrId);
    }

    public directoryExists(pathOrId: PathOrId): Promise<boolean> {
        return this.adapter.directoryExists(pathOrId);
    }

    public async write(pathOrId: PathOrId, contents: string | Buffer, config?: any) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        return this.getAdapter().write(pathOrId, contents, config);
    }

    public async writeStream(pathOrId: PathOrId, resource: Readable, config?: Record<string, any>) {
        if (!isReadableStream(resource)) {
            throw new InvalidStreamProvidedException('writeStream expects argument #2 to be a valid readStream.');
        }

        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        // eslint-disable-next-line no-param-reassign
        config = this.prepareConfig(config);

        return this.getAdapter().writeStream(pathOrId, resource, config);
    }

    public read(pathOrId: PathOrId, config?: any) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        return this.getAdapter().read(pathOrId, config);
    }

    public readStream(pathOrId: PathOrId, config?: any) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        return this.getAdapter().readStream(pathOrId, config);
    }

    public copy(source: PathOrId, destination: PathOrId, config?: any) {
        if (source.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            source.value = this.pathNormalizer.normalizePath(source.value);
        }

        if (destination.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            destination.value = this.pathNormalizer.normalizePath(destination.value);
        }

        return this.getAdapter().copy(
            source,
            destination,
            config,
        );
    }

    public async delete(pathOrId: PathOrId) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        return this.getAdapter().delete(pathOrId);
    }

    public deleteDirectory(pathOrId: PathOrId) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        return this.getAdapter().deleteDirectory(pathOrId);
    }

    public createDirectory(pathOrId: PathOrId, config?: any) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        // eslint-disable-next-line no-param-reassign
        config = this.prepareConfig(config);

        return this.getAdapter().createDirectory(pathOrId, this.prepareConfig(config));
    }

    public async listContents(pathOrId: PathOrId = { type: 'path', value: '' }, recursive = Flysystem.LIST_DEEP) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        return this.getAdapter().listContents(pathOrId, recursive);
    }

    public async mimeType(pathOrId: PathOrId) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        return (await this.getAdapter().mimeType(pathOrId)).mimeType;
    }

    public async lastModified(pathOrId: PathOrId) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        return (await this.getAdapter().lastModified(pathOrId)).lastModified;
    }

    public async visibility(pathOrId: PathOrId) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        return (await this.getAdapter().visibility(pathOrId)).visibility;
    }

    public async fileSize(pathOrId: PathOrId) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        return (await this.getAdapter().fileSize(pathOrId)).fileSize;
    }

    public setVisibility(pathOrId: PathOrId, visibility: VisibilityEnum | string) {
        if (pathOrId.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            pathOrId.value = this.pathNormalizer.normalizePath(pathOrId.value);
        }

        return this.getAdapter().setVisibility(pathOrId, visibility as VisibilityEnum);
    }

    public move(source: PathOrId, destination: PathOrId, config?: Record<string, any>): Promise<void> {
        if (source.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            source.value = this.pathNormalizer.normalizePath(source.value);
        }

        if (destination.type === 'path') {
            // eslint-disable-next-line no-param-reassign
            destination.value = this.pathNormalizer.normalizePath(destination.value);
        }

        return this.getAdapter().move(
            source,
            destination,
            this.prepareConfig(config),
        );
    }

    protected prepareConfig(config?: any) {
        return config;
    }

    static adapter(): { [s: string]: ClassGenericType<IFlysystemAdapter> };

    static adapter(name: string): ClassGenericType<IFlysystemAdapter> | void;

    static adapter(name: string, adapter: ClassGenericType<IFlysystemAdapter>): void;

    static adapter(
        name?: string,
        adapter?: ClassGenericType<IFlysystemAdapter>,
    ): { [s: string]: ClassGenericType<IFlysystemAdapter> } | ClassGenericType<IFlysystemAdapter> | void {
        if (!name && !adapter) {
            return this._adapter;
        }

        if (name && adapter) {
            this._adapter[name] = adapter;
        }

        if (name && !adapter) {
            return this._adapter[name];
        }

        return undefined;
    }
}
