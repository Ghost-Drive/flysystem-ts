import { bindErrorConstructor } from '../util/exception.util';

export class FlysystemException extends Error {
    constructor(message?: string) {
        super(message);
        bindErrorConstructor(this, FlysystemException);
    }
}
