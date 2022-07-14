import { bindErrorConstructor } from '../util/exception.util';

export class NotSupportedException extends Error {
    constructor(public message: string) {
        super(message);
        bindErrorConstructor(this, NotSupportedException);
    }

    static forLink(pathName: string) {
        return new NotSupportedException(`Links are not supported, encountered link at ${pathName}`);
    }
}
