import { ReadStream } from 'fs';
import { Readable } from 'stream';
import {
    VisibilityEnum,
    IStorageAttributes,
    FileAttributes,
    RequirePart,
    PathPrefixer,
    ReadFileOptionsInterface,
    VisibilityInterface,
    PathOrId,
    StorageItem,
} from '@flysystem-ts/common';

export interface IFlysystemAdapter {
  getPathPrefix(): PathPrefixer;

  fileExists(pathOrId: PathOrId): Promise<boolean>;

  directoryExists(pathOrId: PathOrId): Promise<boolean>;

  write(pathOrParentIdName: PathOrId, contents: string | Buffer, config?: VisibilityInterface): Promise<Partial<StorageItem>>;

  writeStream(pathOrParentIdName: PathOrId, resource: Readable, config?: VisibilityInterface): Promise<Partial<StorageItem>>;

  read(pathOrId: PathOrId, config?: ReadFileOptionsInterface): Promise<string | Buffer>;

  readStream(pathOrId: PathOrId, config?: Record<string, any>): Promise<ReadStream>;

  delete(pathOrId: PathOrId): Promise<Partial<StorageItem>>;

  deleteDirectory(pathOrId: PathOrId): Promise<Partial<StorageItem>>;

  createDirectory(pathOrParentIdName: PathOrId, config?: VisibilityInterface): Promise<Partial<StorageItem>>;

  setVisibility(pathOrId: PathOrId, visibility: VisibilityEnum): Promise<Partial<StorageItem>>;

  visibility(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'visibility'>>;

  mimeType(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'mimeType'>>;

  lastModified(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'lastModified'>>;

  fileSize(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'fileSize'>>;

  listContents(pathOrId: PathOrId, deep: boolean): Promise<IStorageAttributes[]>;

  move(source: PathOrId, destination: PathOrId, config?: Record<string, any>): Promise<Partial<StorageItem>>;

  copy(source: PathOrId, destination: PathOrId, config?: Record<string, any>): Promise<Partial<StorageItem>>;
}
