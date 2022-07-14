import { Stream } from 'stream';

export interface IMimeTypeDetector {
  detectMimeType(path: string, contents?: string | Buffer | Stream): Promise<string | void>;

  detectMimeTypeFromBuffer(contents: string | Buffer | Stream): Promise<string | void>;

  detectMimeTypeFromPath(path: string): string | void;

  detectMimeTypeFromFile(path: string): Promise<string | void>;
}
