import { fromBuffer, fromFile, fromStream } from 'file-type';
import { extname } from 'path';
import { getType as getMimeType } from 'mime';
import { Readable as ReadableStream, Stream } from 'stream';
import { IMimeTypeDetector } from '../interfaces';

export class FInfoMimeTypeDetector implements IMimeTypeDetector {
    public async detectMimeType(path: string, contents?: string | Buffer | Stream): Promise<string | void> {
        if (contents) {
            const mimetype = await this.detectMimeTypeFromBuffer(contents);
            if (mimetype) {
                return mimetype;
            }
        }

        const mimetype = await this.detectMimeTypeFromFile(path);
        if (mimetype) {
            return mimetype;
        }

        return this.detectMimeTypeFromPath(path);
    }

    public async detectMimeTypeFromBuffer(contents: string | Buffer | Stream): Promise<string | void> {
        let mimetype;

        if (contents instanceof Stream) {
            mimetype = await fromStream(contents as ReadableStream);
        } else {
            mimetype = await fromBuffer(contents as Buffer);
        }

        if (mimetype) {
            return mimetype.mime;
        }

        return undefined;
    }

    public async detectMimeTypeFromFile(path: string): Promise<string | void> {
        const mimetype = await fromFile(path);

        if (mimetype) {
            return mimetype.mime;
        }

        return undefined;
    }

    detectMimeTypeFromPath(path: string): string | void {
        const ext = extname(path);

        if (ext) {
            const mime = getMimeType(ext);

            if (mime) {
                return mime;
            }
        }

        return undefined;
    }
}
