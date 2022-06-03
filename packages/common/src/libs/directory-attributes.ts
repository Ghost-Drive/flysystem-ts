import { IStorageAttributes } from '../interfaces';
import { FileTypeEnum, VisibilityEnum } from '../enum';

export class DirectoryAttributes implements IStorageAttributes {
    isDir = true;

    isFile = false;

    type = FileTypeEnum.file;

    constructor(public path: string, public visibility?: VisibilityEnum, public lastModified?: number) {}
}
