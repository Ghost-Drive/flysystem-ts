import { ReadStream } from 'fs';
import { IStorageAttributes } from './storage-attributes.interface';
import { VisibilityEnum } from '../enum';
import { PathOrId } from '../types';

export interface IFilesystemReader {
    fileExists(pathOrId: PathOrId): Promise<boolean>;
    directoryExists(pathOrId: PathOrId): Promise<boolean>;
    read(pathOrId: PathOrId): Promise<Buffer | string>;
    readStream(pathOrId: PathOrId): Promise<ReadStream>;
    listContents(pathOrId: PathOrId, deep?: boolean): Promise<IStorageAttributes[]>;
    lastModified(pathOrId: PathOrId): Promise<number>;
    fileSize(pathOrId: PathOrId): Promise<number>;
    mimeType(pathOrId: PathOrId): Promise<string>;
    visibility(pathOrId: PathOrId): Promise<VisibilityEnum>;
}
