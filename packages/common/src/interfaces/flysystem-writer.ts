import { Readable } from 'stream';
import { VisibilityEnum } from '../enum';
import { PathOrId } from '../types';

export interface IFilesystemWriter {
  write(pathOrId: PathOrId, content: string | Buffer, config?: Record<string, any>): Promise<void>;
  writeStream(pathOrId: PathOrId, contents: Readable, config?: Record<string, any>): Promise<void>;
  setVisibility(pathOrId: PathOrId, visibility: VisibilityEnum): Promise<void>;
  delete(pathOrId: PathOrId): Promise<void>;
  deleteDirectory(pathOrId: PathOrId): Promise<void>;
  createDirectory(pathOrId: PathOrId, config?: Record<string, any>): void;
  move(source: PathOrId, destination: PathOrId, config?: Record<string, any>): Promise<void>;
  copy(source: PathOrId, destination: PathOrId, config?: Record<string, any>): Promise<void>;
}
