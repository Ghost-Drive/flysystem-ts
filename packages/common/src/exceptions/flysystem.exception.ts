import { bindErrorConstructor } from '../util/exception.util';

export class FlysystemException extends Error {
    constructor(message?: string, public status = 401) {
        super(message);
        bindErrorConstructor(this, FlysystemException);
    }

    public getStatus() {
        return this.status;
    }
}
