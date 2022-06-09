import { drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { FOLDER_MIME_TYPE } from './google-drive.constants';

type VisibilityType = ` visibility = ${'"limited"'} `; // TODO complete
type TrashedType = ' and trashed = false '
    | ' and trashed = true '
    | '';
type FolderOptionType = ` and mimeType ${'=' | '!='} "${typeof FOLDER_MIME_TYPE}" `
    | '';
type FieldsInFileType = 'id'
    | 'parents'
    | 'modifiedTime'
    | 'name'
    | 'mimeType'
    | 'size'
    | 'copyRequiresWriterPermission'; // TODO complete
type FieldsType = 'nextPageToken'
    | ''; // TODO complete
export type FileListOptionsType = {
    visibility?: VisibilityType,
    trashed?: TrashedType,
    folderOption?: FolderOptionType,
    fieldsInFile?: [FieldsInFileType, ...FieldsInFileType[]] | ['*'],
    fields?: FieldsType[],
    pageSize?: number,
    pageToken?: string | null,
    inWhichFolderOnly?: ''
        | ` and "${string}" in parents `
        | ` and ("${string}" in parents or "${string}" in parents) `,
};

const PAGE_SIZE_FOR_FOLDER_REQ = 100;

export class GoogleDriveApiExecutor {
    private constructor(private gDrive: drive_v3.Drive) { }

    public static req(gDrive: drive_v3.Drive) {
        return new GoogleDriveApiExecutor(gDrive);
    }

    filesList(options: FileListOptionsType = {}): Promise<{ nextPageToken?: string | null, files: drive_v3.Schema$File[] }> {
        const {
            visibility = ' visibility = "limited" ',
            trashed = ' and trashed = false ',
            pageSize = PAGE_SIZE_FOR_FOLDER_REQ,
            fields = ['nextPageToken'],
            fieldsInFile = ['id', 'mimeType', 'name', 'parents', 'modifiedTime', 'copyRequiresWriterPermission', 'size'],
            folderOption = '',
            inWhichFolderOnly = '',
            pageToken,
        } = options as FileListOptionsType;

        return this.gDrive.files.list({
            q: `
                ${visibility}
                ${folderOption}
                ${trashed}
                ${inWhichFolderOnly}
            `,
            fields: `
                files(${fieldsInFile.join(', ')})
                ${fields.length ? `,${fields.join(', ')}` : ''}
            `.replaceAll(/\s+/g, ' ').trim(),
            pageSize,
            ...(pageToken && { pageToken }),
        }).then(({ data: { nextPageToken, files = [] } }) => ({ nextPageToken, files }));
    }

    filesCreateFromStream(parentId: string, name: string, body: Readable) {
        return this.gDrive.files.create({
            requestBody: {
                parents: [parentId],
                name,
            },
            media: {
                body,
            },
        });
    }

    filesCreateFolder(parentId: string, name: string) {
        return this.gDrive.files.create({
            requestBody: {
                mimeType: FOLDER_MIME_TYPE,
                name,
                parents: [parentId],
            },
        });
    }
}
