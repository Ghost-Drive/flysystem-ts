import { Readable } from 'stream';
import { VisibilityEnum } from '../enum';
import { StorageItem } from '../storage-item.type';
import { PathOrId } from '../types';

export interface IFilesystemWriter {
  write(pathOrId: PathOrId, content: string | Buffer, config?: Record<string, any>): Promise<Partial<StorageItem>>;
  writeStream(pathOrId: PathOrId, contents: Readable, config?: Record<string, any>): Promise<Partial<StorageItem>>;
  setVisibility(pathOrId: PathOrId, visibility: VisibilityEnum): Promise<Partial<StorageItem>>;
  delete(pathOrId: PathOrId, permanently: boolean): Promise<Partial<StorageItem>>;
  deleteDirectory(pathOrId: PathOrId, permanently: boolean): Promise<Partial<StorageItem>>;
  createDirectory(pathOrId: PathOrId, config?: Record<string, any>): Promise<Partial<StorageItem>>;
  move(source: PathOrId, destination: PathOrId, config?: Record<string, any>): Promise<Partial<StorageItem>>;
  copy(source: PathOrId, destination: PathOrId, config?: Record<string, any>): Promise<Partial<StorageItem>>;
}
