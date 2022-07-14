import { OPTION_DIRECTORY_VISIBILITY, OPTION_VISIBILITY } from '../constant';
import { VisibilityEnum } from '../enum';

export interface VisibilityInterface {
    [OPTION_VISIBILITY]?: VisibilityEnum | string;
    [OPTION_DIRECTORY_VISIBILITY]?: VisibilityEnum | string;
}
