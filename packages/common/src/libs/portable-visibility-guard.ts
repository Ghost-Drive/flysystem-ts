import { VisibilityEnum } from '../enum';

export class PortableVisibilityGuard {
    static guardAgainstInvalidInput(visibility: VisibilityEnum): void {
        if (visibility !== VisibilityEnum.PUBLIC && visibility !== VisibilityEnum.PRIVATE) {
            throw new Error(
                `Invalid visibility provided. Expected either Visibility.PUBLIC or Visibility.PUBLIC, received ${visibility}`,
            );
        }
    }
}
