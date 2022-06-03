import { bindErrorConstructor } from '../util/exception.util';
import { FilesystemOperationFailedException } from './filesystem-operation-failed.exception';

export class UnableToCopyFileException extends FilesystemOperationFailedException {
    private _source = '';

    private _destination = '';

    constructor(message: string) {
        super(message);
        bindErrorConstructor(this, UnableToCopyFileException);
    }

    public source(): string {
        return this._source;
    }

    public destination(): string {
        return this._destination;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    static fromLocationTo(sourcePath: string, destinationPath: string, previous?: Error): UnableToCopyFileException {
        const e = new UnableToCopyFileException(`Unable to move file from ${sourcePath} to ${destinationPath}`);
        e._source = sourcePath;
        e._destination = destinationPath;

        return e;
    }

    operation(): string {
        return FilesystemOperationFailedException.OPERATION_COPY;
    }
}
