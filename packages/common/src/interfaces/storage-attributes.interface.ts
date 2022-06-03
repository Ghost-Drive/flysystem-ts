import { FileTypeEnum, VisibilityEnum } from '../enum';

export interface IStorageAttributes {
  path: string;
  type: FileTypeEnum;
  visibility?: VisibilityEnum;
  lastModified?: number;
  size?: number;
  isFile: boolean;
  isDir: boolean;
}
