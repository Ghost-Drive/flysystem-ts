import { InvalidArgumentException } from './invalid-argument.exception';
import { bindErrorConstructor } from '../util/exception.util';

export class InvalidStreamProvidedException extends InvalidArgumentException {
    constructor(message?: string) {
        super(message);
        bindErrorConstructor(this, InvalidStreamProvidedException);
    }
}
