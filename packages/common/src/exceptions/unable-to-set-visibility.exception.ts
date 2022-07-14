/* eslint-disable no-unused-vars */
/* eslint-disable default-param-last */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { FilesystemOperationFailedException } from './filesystem-operation-failed.exception';
import { bindErrorConstructor } from '../util/exception.util';

export class UnableToSetVisibilityException extends FilesystemOperationFailedException {
    constructor(message: string) {
        super(message);
        bindErrorConstructor(this, UnableToSetVisibilityException);
    }

    private _location = '';

    private _reason = '';

    static atLocation(filename: string, extraMessage = '', prev?: Error): UnableToSetVisibilityException {
        const message = `Unable to set visibility for file ${filename}. ${extraMessage}`;
        const e = new UnableToSetVisibilityException(message.trimEnd());
        e._reason = extraMessage;
        e._location = filename;

        return e;
    }

    public reason(): string {
        return this._reason;
    }

    public location(): string {
        return this._location;
    }

    operation(): string {
        return FilesystemOperationFailedException.OPERATION_SET_VISIBILITY;
    }
}
