/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
import { Adapter } from '@flysystem-ts/adapter-interface';
import {
    DeleteById, DownloadById,
    FlysystemException,
    GetById,
    MakeDirById,
    StorageItem,
    SuccessRes,
    UploadById,
    GetDownloadLinkById,
    IsFileExistsByPath,
} from '@flysystem-ts/common';
import { drive_v3 } from 'googleapis';
import { extname } from 'path';
import { Readable } from 'stream';
import { getType } from 'mime';
import { VirtualPathMapper } from './lib/virtual-path-mapper';
import { GoogleDriveApiExecutor } from './lib/google-drive-api-executor';

export const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder' as const;

const nativeToCommon = (item: drive_v3.Schema$File): StorageItem => {
    const extension = item.fileExtension || extname(item.name!) || 'unknown';
    const mimeType = item.mimeType || getType(extension) || 'unknown';

    return {
        id: item.id,
        isFolder: item.mimeType === FOLDER_MIME_TYPE,
        name: item.name,
        size: item.size,
        trashed: item.trashed,
        parentFolderId: item?.parents?.[0],
        extension,
        mimeType,
    };
};

function trimSlashes(str: string) {
    return `/${str.replace(/^\//, '').replace(/\/$/, '')}`;
}

export class GDriveAdapter implements
    Adapter,
    GetById,
    MakeDirById,
    DeleteById,
    UploadById,
    DownloadById,
    GetDownloadLinkById,
    IsFileExistsByPath {
    private virtualPathMapper!: VirtualPathMapper;

    constructor(private gDrive: drive_v3.Drive) {
        this.virtualPathMapper = new VirtualPathMapper(gDrive);
    }

    // TODO sorry... little trash, but it works
    async isFileExistsByPath(path: string): Promise<string | false> {
        let asFile = true;
        let folderId: string | undefined;
        let fileName: string | undefined;

        maybe_it_is_path_to_folder:
        if (asFile) {
            try {
                ({ folderId, fileName } = await this.explorePath(path));
            } catch (error: any) {
                if (error instanceof FlysystemException) {
                    asFile = false;
                    break maybe_it_is_path_to_folder;
                }
            }

            let nextPageToken: string | null | undefined;
            let exists: drive_v3.Schema$File | undefined;

            do {
            // eslint-disable-next-line no-await-in-loop
                const res = await GoogleDriveApiExecutor
                    .req(this.gDrive)
                    .filesList({
                        inWhichFolderOnly: ` and "${folderId}" in parents `,
                        fields: ['nextPageToken'],
                        fieldsInFile: ['name'],
                        pageToken: nextPageToken,
                    });

                exists = res.files.find((f) => f.name! === fileName);
                nextPageToken = res.nextPageToken;

                if (exists) {
                    return exists.id!;
                }
            } while (nextPageToken);

            return false;
        }

        const { pathId } = await this
            .virtualPathMapper
            .virtualize(); // TODO it should be optimized (we already do it inside .explorePath() above)
        const _path = trimSlashes(path);

        return pathId.get(_path) || false;
    }

    async getDownloadLinkById(id: string) {
        const res = await this.gDrive.files.get({
            fileId: id,
            fields: 'webViewLink',
        });

        return {
            link: res.data.webViewLink,
            expiredAt: null,
        };
    }

    async uploadById(data: Buffer, metadata: {
        name: string,
        parentId?: string,
    }): Promise<StorageItem> {
        const { name, parentId } = metadata;
        const { data: res } = await this.gDrive.files.create({
            requestBody: {
                name,
                ...(parentId && { parents: [parentId] }),
            },
            media: {
                body: Readable.from(data),
            },
            fields: 'id,size,name,mimeType,parents,fileExtension',
        });

        return nativeToCommon(res);
    }

    exceptionsPipe(error: any) {
        return new FlysystemException(error?.message || 'unknown error', {
            originalError: error?.errors?.[0] || error,
            type: ({
                400: 'Bad request',
                401: 'Invalid Credentials',
                403: 'The limit of something is exceeded',
                404: 'File not found',
                429: 'Too many requests',
            } as any)[error.code] || 'unknown',
            storage: 'GoogleDrive',
            name: error?.errors?.[0]?.reason || 'unknown',
        });
    }

    async downloadById(id: string): Promise<Buffer> {
        return this.gDrive.files.get({
            fileId: id,
            alt: 'media',
        }, {
            responseType: 'arraybuffer',
        }).then(({ data }) => Buffer.from(data as any));
    }

    async getById(id: string): Promise<StorageItem> {
        const { data } = await this.gDrive.files.get({ fileId: id });

        return nativeToCommon(data);
    }

    async mkdirById(options: {
        parentId?: string,
        name: string,
    }): Promise<StorageItem> {
        const { parentId, name } = options;
        const { data } = await this.gDrive.files.create({
            requestBody: {
                mimeType: FOLDER_MIME_TYPE,
                name,
                ...(parentId && { parents: [parentId] }),
            },
        });

        return nativeToCommon(data);
    }

    async deleteById(id: string, soft = false): Promise<SuccessRes> {
        const res = soft
            ? await this.gDrive.files.update({
                fileId: id,
                requestBody: {
                    trashed: true,
                },
            })
            : await this.gDrive.files.delete({ fileId: id });

        return {
            success: res.status < 400,
        };
    }

    private async explorePath(path: string, isFolder = false): Promise<{ folderId: string, folderPath: string, fileName?: string, folders: string[], idPath: Map<string, string>, pathId: Map<string, string>, trimedPath: string }> {
        const { folders, idPath, pathId } = await this.virtualPathMapper.virtualize();
        const trimedPath = trimSlashes(path);
        const [fileName] = isFolder
            ? [undefined]
            : trimedPath.match(/(?!\/)[^\/]+$/) || [];
        const folderPath = isFolder
            ? trimedPath
            : trimedPath.slice(0, trimedPath.lastIndexOf(`/${fileName!}`));
        const folderId = pathId.get(folderPath);

        if (!folderId) {
            throw new FlysystemException(`Any directory by such path "${path}" (interpreted as "${folderPath}").`, {
                type: 'Not found',
                storage: 'GoogleDrive',
            });
        }

        return {
            folderId, fileName, folderPath, folders, idPath, pathId, trimedPath,
        };
    }
}
