import { FilesystemOperationFailedException } from './filesystem-operation-failed.exception';
import { bindErrorConstructor } from '../util/exception.util';

export class UnableToDeleteFileException extends FilesystemOperationFailedException {
    constructor(message: string) {
        super(message);
        bindErrorConstructor(this, UnableToDeleteFileException);
    }

    private _location = '';

    private _reason = '';

    static atLocation(location: string, reason = '', errMsg = ''): UnableToDeleteFileException {
        const e = new UnableToDeleteFileException(
            `"Unable to delete file located at: {$location}. {$reason}": ${errMsg}`.trimEnd(),
        );
        e._location = location;
        e._reason = reason;

        return e;
    }

    operation(): string {
        return FilesystemOperationFailedException.OPERATION_DELETE;
    }

    public reason(): string {
        return this._reason;
    }

    public location(): string {
        return this._location;
    }
}
