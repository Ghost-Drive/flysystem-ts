import { FlysystemException } from './flysystem.exception';
import { bindErrorConstructor } from '../util/exception.util';

export abstract class FilesystemOperationFailedException extends FlysystemException {
    static OPERATION_WRITE = 'WRITE';

    static OPERATION_UPDATE = 'UPDATE';

    static OPERATION_FILE_EXISTS = 'FILE_EXISTS';

    static OPERATION_CREATE_DIRECTORY = 'CREATE_DIRECTORY';

    static OPERATION_DELETE = 'DELETE';

    static OPERATION_DELETE_DIRECTORY = 'DELETE_DIRECTORY';

    static OPERATION_MOVE = 'MOVE';

    static OPERATION_RETRIEVE_METADATA = 'RETRIEVE_METADATA';

    static OPERATION_COPY = 'COPY';

    static OPERATION_READ = 'READ';

    static OPERATION_SET_VISIBILITY = 'SET_VISIBILITY';

    constructor(message: string) {
        super(message);
        bindErrorConstructor(this, FlysystemException);
    }

  public abstract operation(): string;
}
