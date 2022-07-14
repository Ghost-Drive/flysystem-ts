import { FlysystemException } from './flysystem.exception';
import { bindErrorConstructor } from '../util/exception.util';

export class Exception extends FlysystemException {
    constructor(message?: string) {
        super(message);
        bindErrorConstructor(this, Exception);
    }
}
