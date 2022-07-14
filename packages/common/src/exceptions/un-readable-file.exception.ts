import { bindErrorConstructor } from '../util/exception.util';

export class UnReadableFileException extends Error {
    constructor(public path: string) {
        super(`Unreadable file encountered: ${path}`);
        bindErrorConstructor(this, UnReadableFileException);
    }
}
