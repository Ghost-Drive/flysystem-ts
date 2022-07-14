import { FlysystemException } from './flysystem.exception';
import { bindErrorConstructor } from '../util/exception.util';

export class SymbolicLinkEncounteredException extends FlysystemException {
    constructor(message: string) {
        super(message);
        bindErrorConstructor(this, SymbolicLinkEncounteredException);
    }

    private _location = '';

    public location(): string {
        return this._location;
    }

    static atLocation(pathName: string): SymbolicLinkEncounteredException {
        const e = new SymbolicLinkEncounteredException(`Unsupported symbolic link encountered at location ${pathName}`);
        e._location = pathName;

        return e;
    }
}
