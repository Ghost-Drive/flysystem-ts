import { Adapter } from '@flysystem-ts/adapter-interface';
import {
    DeleteById, FlysystemException, MakeDirById, StorageItem, SuccessRes,
} from '@flysystem-ts/common';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { OneDriveItem } from './one-drive-item.interface';

function nativeToCommon(item: OneDriveItem): StorageItem {
    const {
        id, name, parentReference, folder, size, deleted,
    } = item;

    return {
        id,
        name,
        ...(parentReference && {
            path: parentReference.path,
            parentFolderId: parentReference.id,
            parentFolderName: parentReference.path.split('/').at(-1),
        }),
        size,
        trashed: !!deleted,
        isFolder: !!folder,
    };
}

export class OneDriveAdapter implements Adapter, MakeDirById, DeleteById {
    constructor(private msClient: Client) {}

    async deleteById(id: string, soft: boolean): Promise<SuccessRes> {
        if (!soft) {
            throw new FlysystemException('Only "soft"=true deletion is supported', {
                type: 'Unsupported flag',
                storage: 'OneDrive',
            });
        }

        await this.msClient.api(`/me/drive/items/${id}`).delete();

        return {
            success: true,
        };
    }

    async mkdirById(options: {
        name: string,
        parentId?: string,
    }): Promise<StorageItem> {
        const { name, parentId } = options;
        const graph = parentId
            ? `/me/drive/items/${parentId}/children`
            : `/me/drive/root/children`;
        const res = await this
            .msClient
            .api(graph)
            .post({
                name,
                folder: { },
            });

        return nativeToCommon(res);
    }

    exceptionsPipe(error: any): FlysystemException {
        return new FlysystemException(error?.code || 'unknown error', {
            storage: 'OneDrive',
            type: error?.message || 'unknown error',
            originalError: error,
        });
    }
}
