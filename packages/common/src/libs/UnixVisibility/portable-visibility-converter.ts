import { IVisibilityConverter } from '../../interfaces';
import { VisibilityEnum } from '../../enum';
import { PortableVisibilityGuard } from '../portable-visibility-guard';

export interface IPortableVisibilityConfig<T = number> {
  [VisibilityEnum.PUBLIC]?: T;
  [VisibilityEnum.PRIVATE]?: T;
}

export interface IPortableVisibilityObj<T = number> {
  file?: IPortableVisibilityConfig<T>;
  dir?: IPortableVisibilityConfig<T>;
}

export class PortableVisibilityConverter<T = number> implements IVisibilityConverter<T> {
    constructor(
    protected readonly filePublic: T = 0o0644 as any,
    protected readonly filePrivate: T = 0o0600 as any,
    protected readonly directoryPublic: T = 0o0755 as any,
    protected readonly directoryPrivate: T = 0o0700 as any,
    protected readonly _defaultForDirectories = VisibilityEnum.PRIVATE,
    ) {}

    defaultForDirectories(): T {
        return this._defaultForDirectories === VisibilityEnum.PUBLIC ? this.directoryPublic : this.directoryPrivate;
    }

    forDirectory(visibility: VisibilityEnum): T {
        PortableVisibilityGuard.guardAgainstInvalidInput(visibility);
        return visibility === VisibilityEnum.PUBLIC ? this.directoryPublic : this.directoryPrivate;
    }

    forFile(visibility: VisibilityEnum): T {
        PortableVisibilityGuard.guardAgainstInvalidInput(visibility);
        return visibility === VisibilityEnum.PUBLIC ? this.filePublic : this.filePrivate;
    }

    inverseForDirectory(visibility: T): VisibilityEnum {
        if (visibility === this.directoryPublic) {
            return VisibilityEnum.PUBLIC;
        } if (visibility === this.directoryPrivate) {
            return VisibilityEnum.PRIVATE;
        }

        return VisibilityEnum.PUBLIC;
    }

    inverseForFile(visibility: T): VisibilityEnum {
        if (visibility === this.filePublic) {
            return VisibilityEnum.PUBLIC;
        } if (visibility === this.filePrivate) {
            return VisibilityEnum.PRIVATE;
        }

        return VisibilityEnum.PUBLIC;
    }

    static fromObject(permission: IPortableVisibilityObj, defaultForDirectories = VisibilityEnum.PRIVATE) {
        return new PortableVisibilityConverter(
            permission.file?.public,
            permission.file?.private,
            permission.dir?.public,
            permission.dir?.private,
            defaultForDirectories,
        );
    }
}
