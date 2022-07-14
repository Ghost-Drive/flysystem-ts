import { IStorageAttributes } from '../interfaces';
import { FileTypeEnum, VisibilityEnum } from '../enum';

export class FileAttributes implements IStorageAttributes {
    isDir = false;

    isFile = true;

    type = FileTypeEnum.file;

    public id!: string;

    public fileSize?: number;

    public visibility?: VisibilityEnum;

    public lastModified?: number;

    public mimeType?: string;

    public extraMetada!: Record<string, any>;

    constructor(
    public path: string,
    options: {
      id?: string,
      fileSize?: number,
      visibility?: VisibilityEnum,
      lastModified?: number,
      mimeType?: string,
      extraMetadata?: Record<string, any>
    } = {},
    ) {
        this.id = options.id || '';
        this.extraMetada = options.extraMetadata || {};
        this.fileSize = options.fileSize;
        this.lastModified = options.lastModified;
        this.mimeType = options.mimeType;
        this.visibility = options.visibility;
    }
}
