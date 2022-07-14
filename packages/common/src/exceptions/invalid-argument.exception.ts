import { bindErrorConstructor } from '../util/exception.util';
import { FlysystemException } from './flysystem.exception';

export class InvalidArgumentException extends FlysystemException {
    constructor(message?: string) {
        super(message);
        bindErrorConstructor(this, InvalidArgumentException);
    }
}
