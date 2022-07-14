import { VisibilityEnum } from '../enum';

export interface IFilesystemConfig {
  // disable extra calls to assert whether or not a file exists, see
  disable_asserts?: boolean;
  // default visibility
  visibility?: VisibilityEnum | string;
  // whether or not the adapter’s file system is case sensitive, e.g. Dropbox is case insensitive
  case_sensitive?: boolean;
}
