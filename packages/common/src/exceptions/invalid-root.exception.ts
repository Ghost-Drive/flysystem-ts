import { bindErrorConstructor } from '../util/exception.util';

export class InvalidRootException extends Error {
    constructor(message?: string) {
        super(message);
        bindErrorConstructor(this, InvalidRootException);
    }
}
