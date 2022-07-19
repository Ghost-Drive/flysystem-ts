import { Adapter } from '@flysystem-ts/adapter-interface';
import { FlysystemException, StorageItem } from '@flysystem-ts/common';
import { drive_v3 } from 'googleapis';

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
        if (!error?.error?.errors?.[0]?.reason) throw error;

        return new FlysystemException(error.error.message, {
            originalError: error.error.errors,
            type: 'GoogleDrive Exception',
            storage: 'GoogleDrive',
            name: error.error.errors[0].reason,
        });
    }

    async getById(id: string): Promise<StorageItem> {
        const { data } = await this.gDrive.files.get({ fileId: id });

        return nativeToCommon(data);
    }
}
