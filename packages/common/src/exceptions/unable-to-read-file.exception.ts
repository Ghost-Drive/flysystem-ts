/* eslint-disable no-unused-vars */
/* eslint-disable default-param-last */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FilesystemOperationFailedException } from './filesystem-operation-failed.exception';
import { bindErrorConstructor } from '../util/exception.util';

export class UnableToReadFileException extends FilesystemOperationFailedException {
    private _location = '';

    private _reason = '';

    constructor(message: string) {
        super(message);
        bindErrorConstructor(this, UnableToReadFileException);
    }

    static fromLocation(location: string, reason = '', previousErr?: Error): UnableToReadFileException {
        const err = new UnableToReadFileException(`Unable to read file from location: ${location}. {$reason}`.trimEnd());
        err._location = location;
        err._reason = reason;

        return err;
    }

    public reason(): string {
        return this._reason;
    }

    public location(): string {
        return this._location;
    }

    operation(): string {
        return FilesystemOperationFailedException.OPERATION_READ;
    }
}
