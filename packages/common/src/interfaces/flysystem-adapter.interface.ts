import { ReadStream } from 'fs';
import { Readable } from 'stream';
import { VisibilityEnum } from '../enum';
import { FileAttributes, PathPrefixer } from '../libs';
import { IStorageAttributes } from './storage-attributes.interface';
import { RequirePart } from './require-part.type';
import { ReadFileOptionsInterface } from './read-file-options.interface';
import { VisibilityInterface } from './visibility.interface';

export interface IFlysystemAdapter {
  getPathPrefix(): PathPrefixer;

  fileExists(path: string): Promise<boolean>;

  directoryExists(path: string): Promise<boolean>;

  write(path: string, contents: string | Buffer, config?: VisibilityInterface): Promise<void>;

  writeStream(path: string, resource: Readable, config?: VisibilityInterface): Promise<void>;

  read(path: string, config?: ReadFileOptionsInterface): Promise<string | Buffer>;

  readStream(path: string, config?: Record<string, any>): Promise<ReadStream>;

  delete(path: string): Promise<void>;

  deleteDirectory(path: string): Promise<void>;

  createDirectory(path: string, config?: VisibilityInterface): Promise<void>;

  setVisibility(path: string, visibility: VisibilityEnum): Promise<void>;

  visibility(path: string): Promise<RequirePart<FileAttributes, 'visibility'>>;

  mimeType(path: string): Promise<RequirePart<FileAttributes, 'mimeType'>>;

  lastModified(path: string): Promise<RequirePart<FileAttributes, 'lastModified'>>;

  fileSize(path: string): Promise<RequirePart<FileAttributes, 'fileSize'>>;

  listContents(path: string, deep: boolean): Promise<IStorageAttributes[]>;

  move(source: string, destination: string, config?: Record<string, any>): Promise<void>;

  copy(source: string, destination: string, config?: Record<string, any>): Promise<void>;
}
