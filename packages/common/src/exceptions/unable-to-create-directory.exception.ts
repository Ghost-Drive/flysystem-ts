import { Exception } from './exception';
import { bindErrorConstructor } from '../util/exception.util';

export class UnableToCreateDirectoryException extends Exception {
    private location?: string;

    constructor(message: string) {
        super(message);
        bindErrorConstructor(this, UnableToCreateDirectoryException);
    }

    static atLocation(dirname: string, errMsg = ''): UnableToCreateDirectoryException {
        const message = `Unable to create a directory at ${dirname}. ${errMsg}`;
        const e = new UnableToCreateDirectoryException(message.trimEnd());
        e.location = dirname;
        return e;
    }
}
