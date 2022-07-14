import { FileTypeEnum, VisibilityEnum } from '../enum';

export interface IStorageAttributes {
  id: string;
  path: string;
  type: FileTypeEnum;
  visibility?: VisibilityEnum;
  lastModified?: number;
  size?: number;
  isFile: boolean;
  isDir: boolean;
}
