import { Adapter } from '@flysystem-ts/adapter-interface';
import { FlysystemException, StorageItem } from '@flysystem-ts/common';
import { drive_v3 } from 'googleapis';
import { Readable } from 'stream';

export const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder' as const;

const nativeToCommon = (item: drive_v3.Schema$File): StorageItem => ({
    id: item.id,
    isFolder: item.mimeType === FOLDER_MIME_TYPE,
    name: item.name,
    mimeType: item.mimeType,
    size: item.size,
    trashed: item.trashed,
    parentFolderId: item?.parents?.[0],
});

export class GDriveAdapter implements Adapter {
    constructor(private gDrive: drive_v3.Drive) {
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

    async uploadById(data: Buffer, metadata: {
        name: string,
        parentId?: string,
        mimeType?: string,
    }): Promise<StorageItem> {
        const { name, parentId, mimeType } = metadata;
        const { data: res } = await this.gDrive.files.create({
            requestBody: {
                name,
                ...(parentId && { parents: [parentId] }),
            },
            media: {
                ...(mimeType && { mimeType }),
                body: Readable.from(data),
            },
        });

        return {
            id: res.id,
            isFolder: res.mimeType === FOLDER_MIME_TYPE,
            name: res.name,
            size: res.size,
            ...(res.parents?.[0] && { parentFolderId: res.parents[0] }),
        };
    }
}
