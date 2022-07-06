// TODO rm these 3 lines of comment
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IFlysystemAdapter } from '@flysystem-ts/adapter-interface';
import {
    PathPrefixer, VisibilityInterface, ReadFileOptionsInterface, VisibilityEnum, RequirePart, FileAttributes, IStorageAttributes, PathOrId, FlysystemException,
} from '@flysystem-ts/common';
import { ReadStream } from 'fs';
import { Readable } from 'stream';
import { Client, Options } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

export class OneDriveAdapter implements IFlysystemAdapter {
    private msClient!: Client;

    private prefixer!: PathPrefixer;

    constructor(private options: Options) {
        this.msClient = Client.init(options);
        this.prefixer = new PathPrefixer('');
    }

    fileExists(pathOrId: PathOrId): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    directoryExists(pathOrId: PathOrId): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    write(pathOrParentIdName: PathOrId, contents: string | Buffer, config?: VisibilityInterface | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    writeStream(pathOrParentIdName: PathOrId, resource: Readable, config?: VisibilityInterface | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    read(pathOrId: PathOrId, config?: ReadFileOptionsInterface | undefined): Promise<string | Buffer> {
        throw new Error('Method not implemented.');
    }

    readStream(pathOrId: PathOrId, config?: Record<string, any> | undefined): Promise<ReadStream> {
        throw new Error('Method not implemented.');
    }

    delete(pathOrId: PathOrId): Promise<void> {
        throw new Error('Method not implemented.');
    }

    deleteDirectory(pathOrId: PathOrId): Promise<void> {
        throw new Error('Method not implemented.');
    }

    createDirectory(pathOrParentIdName: PathOrId, config?: VisibilityInterface | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    setVisibility(pathOrId: PathOrId, visibility: VisibilityEnum): Promise<void> {
        throw new Error('Method not implemented.');
    }

    visibility(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'visibility'>> {
        throw new Error('Method not implemented.');
    }

    mimeType(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'mimeType'>> {
        throw new Error('Method not implemented.');
    }

    lastModified(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'lastModified'>> {
        throw new Error('Method not implemented.');
    }

    fileSize(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'fileSize'>> {
        throw new Error('Method not implemented.');
    }

    move(source: PathOrId, destination: PathOrId, config?: Record<string, any> | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    copy(source: PathOrId, destination: PathOrId, config?: Record<string, any> | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    listContents(pathOrId: PathOrId, deep: boolean): Promise<IStorageAttributes[]> {
        if (pathOrId.type !== 'path') {
            throw new FlysystemException('By "id" API is not implemented yet');
        }

        return this.msClient.api('/me/drive/root/children').get() as any;
    }

    getPathPrefix(): PathPrefixer {
        return this.prefixer;
    }
}
