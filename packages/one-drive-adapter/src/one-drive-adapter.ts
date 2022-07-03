// TODO rm these 3 lines of comment
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IFlysystemAdapter } from '@flysystem-ts/adapter-interface';
import {
    PathPrefixer, VisibilityInterface, ReadFileOptionsInterface, VisibilityEnum, RequirePart, FileAttributes, IStorageAttributes,
} from '@flysystem-ts/common';
import { ReadStream } from 'fs';
import { Readable } from 'stream';

export class OneDriveAdapter implements IFlysystemAdapter {
    getPathPrefix(): PathPrefixer {
        throw new Error('Method not implemented.');
    }

    write(path: string, contents: string | Buffer, config?: VisibilityInterface | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    writeStream(path: string, resource: Readable, config?: VisibilityInterface | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    read(path: string, config?: ReadFileOptionsInterface | undefined): Promise<string | Buffer> {
        throw new Error('Method not implemented.');
    }

    createDirectory(path: string, config?: VisibilityInterface | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    setVisibility(path: string, visibility: VisibilityEnum): Promise<void> {
        throw new Error('Method not implemented.');
    }

    visibility(path: string): Promise<RequirePart<FileAttributes, 'visibility'>> {
        throw new Error('Method not implemented.');
    }

    mimeType(path: string): Promise<RequirePart<FileAttributes, 'mimeType'>> {
        throw new Error('Method not implemented.');
    }

    lastModified(path: string): Promise<RequirePart<FileAttributes, 'lastModified'>> {
        throw new Error('Method not implemented.');
    }

    fileSize(path: string): Promise<RequirePart<FileAttributes, 'fileSize'>> {
        throw new Error('Method not implemented.');
    }

    listContents(path: string, deep: boolean): Promise<IStorageAttributes[]> {
        throw new Error('Method not implemented.');
    }

    fileExists(path: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    directoryExists(path: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    readStream(path: string, config?: Record<string, any> | undefined): Promise<ReadStream> {
        throw new Error('Method not implemented.');
    }

    delete(path: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    deleteDirectory(path: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    move(source: string, destination: string, config?: Record<string, any> | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    copy(source: string, destination: string, config?: Record<string, any> | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
