/* eslint-disable no-unused-vars */
/* eslint-disable default-param-last */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { bindErrorConstructor } from '../util/exception.util';
import { FilesystemOperationFailedException } from './filesystem-operation-failed.exception';
import {
    ATTRIBUTE_FILE_SIZE, ATTRIBUTE_LAST_MODIFIED, ATTRIBUTE_MIME_TYPE, ATTRIBUTE_VISIBILITY,
} from '../constant';

export class UnableToRetrieveMetadataException extends FilesystemOperationFailedException {
    private _location = '';

    private _metadataType = '';

    private _reason = '';

    constructor(message: string) {
        super(message);
        bindErrorConstructor(this, UnableToRetrieveMetadataException);
    }

    static lastModified(location: string, reason = '', previous: Error | null = null): UnableToRetrieveMetadataException {
        return this.create(location, ATTRIBUTE_LAST_MODIFIED, reason, previous);
    }

    static visibility(location: string, reason = '', previous: Error | null = null): UnableToRetrieveMetadataException {
        return this.create(location, ATTRIBUTE_VISIBILITY, reason, previous);
    }

    static fileSize(location: string, reason = '', previous: Error | null = null): UnableToRetrieveMetadataException {
        return this.create(location, ATTRIBUTE_FILE_SIZE, reason, previous);
    }

    static mimeType(location: string, reason = '', previous: Error | null = null): UnableToRetrieveMetadataException {
        return this.create(location, ATTRIBUTE_MIME_TYPE, reason, previous);
    }

    static create(
        location: string,
        type: string,
    reason = '',
    previous: Error | null = null,
    ): UnableToRetrieveMetadataException {
        const e = new UnableToRetrieveMetadataException(
            `Unable to retrieve the $type for file at location: ${location}. ${reason}`,
        );
        e._reason = reason;
        e._location = location;
        e._metadataType = type;

        return e;
    }

    public reason(): string {
        return this._reason;
    }

    public location(): string {
        return this._location;
    }

    public metadataType(): string {
        return this._metadataType;
    }

    public operation(): string {
        return FilesystemOperationFailedException.OPERATION_RETRIEVE_METADATA;
    }
}
