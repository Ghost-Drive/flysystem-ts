import { VisibilityEnum } from '../enum';

export interface IVisibilityConverter<T = any> {
  forFile(visibility: VisibilityEnum): T;
  forDirectory(visibility: VisibilityEnum): T;
  inverseForFile(visibility: T): VisibilityEnum;
  inverseForDirectory(visibility: T): VisibilityEnum;
  defaultForDirectories(): T;
}
